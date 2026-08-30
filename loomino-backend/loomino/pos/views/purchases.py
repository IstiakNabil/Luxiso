import json
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import (
    Purchase,
    PurchaseItem,
    PurchaseReturn,
    PurchaseReturnItem,
    PurchaseStatus,
    PaymentStatus,
    PaymentMethod,
    DiscountType,
    POSVariant,
    StockLevel,
    StockMovement,
    StockMovementType,
    Batch,
    PurchasePayment,
)
from ..pagination import POSResultsPagination
from ..permissions import IsPOSStaff, IsPOSAdminOrManager
from ..serializers.purchases import (
    PurchaseListSerializer,
    PurchaseDetailSerializer,
    PurchaseWriteSerializer,
    PurchaseReturnListSerializer,
    PurchaseReturnDetailSerializer,
    PurchasableItemSerializer,
)


def _parse_json_field(request, key, default):
    raw = request.data.get(key, None)
    if raw is None:
        return default
    if isinstance(raw, (list, dict)):
        return raw
    try:
        return json.loads(raw)
    except (TypeError, ValueError):
        raise ValueError(f"'{key}' must be valid JSON.")


def _to_decimal(value, default="0"):
    if value in (None, ""):
        value = default
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except InvalidOperation:
        raise ValueError(f"'{value}' is not a valid number.")


class PurchaseListCreateView(GenericAPIView):
    """
    GET  /api/pos/purchases/    -- List Purchases
    POST /api/pos/purchases/    -- Add Purchase

    Filters: ?location=, ?supplier=, ?status=, ?payment_status=,
    ?date_from=, ?date_to= (on purchase_date), ?search= (reference_no)

    Create accepts multipart (for attached_document) with an extra
    JSON-encoded "items" field:
      items: [{variant, quantity, unit_cost, discount_percent,
                selling_price, mfg_date, exp_date}]

    Saving a purchase is the point stock actually increases -- each
    item writes a StockLevel increment and a StockMovement row, and
    optionally updates the variant's purchase/selling price and an
    expiry batch, all in one transaction.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = POSResultsPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsPOSAdminOrManager()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        qs = Purchase.objects.select_related("location", "supplier", "created_by")

        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(reference_no__icontains=search)

        for param, field in [
            ("location", "location_id"),
            ("supplier", "supplier_id"),
            ("status", "status"),
            ("payment_status", "payment_status"),
        ]:
            value = params.get(param)
            if value:
                qs = qs.filter(**{field: value})

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(purchase_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(purchase_date__date__lte=date_to)

        return qs

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        serializer = PurchaseListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def post(self, request):
        try:
            items_data = _parse_json_field(request, "items", [])
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if not items_data:
            return Response(
                {"items": ["At least one product line is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        purchase_serializer = PurchaseWriteSerializer(data=request.data)
        purchase_serializer.is_valid(raise_exception=True)

        paid_amount = _to_decimal(request.data.get("paid_amount"), "0")

        try:
            with transaction.atomic():
                purchase = purchase_serializer.save(
                    created_by=request.user, status=request.data.get("status") or PurchaseStatus.RECEIVED
                )

                subtotal = Decimal("0")
                created_items = []

                for row in items_data:
                    variant = get_object_or_404(POSVariant, pk=row.get("variant"))
                    quantity = _to_decimal(row.get("quantity"))
                    if quantity <= 0:
                        raise ValueError("Quantity must be greater than zero for every line.")
                    unit_cost = _to_decimal(row.get("unit_cost"))
                    discount_percent = _to_decimal(row.get("discount_percent"), "0")
                    unit_cost_after_discount = unit_cost * (1 - discount_percent / 100)
                    line_total = quantity * unit_cost_after_discount
                    selling_price = _to_decimal(row.get("selling_price"), None)

                    item = PurchaseItem.objects.create(
                        purchase=purchase,
                        variant=variant,
                        quantity=quantity,
                        unit_cost=unit_cost,
                        discount_percent=discount_percent,
                        unit_cost_after_discount=unit_cost_after_discount,
                        line_total=line_total,
                        subtotal=line_total,
                        selling_price=selling_price,
                        mfg_date=row.get("mfg_date") or None,
                        exp_date=row.get("exp_date") or None,
                    )
                    created_items.append(item)
                    subtotal += line_total

                    # Stock increases the moment the purchase is saved.
                    stock_level, _ = StockLevel.objects.get_or_create(
                        variant=variant, location=purchase.location
                    )
                    stock_level.quantity += quantity
                    stock_level.save(update_fields=["quantity"])

                    StockMovement.objects.create(
                        variant=variant,
                        location=purchase.location,
                        movement_type=StockMovementType.PURCHASE,
                        quantity=quantity,
                        reference_type="purchase",
                        reference_id=purchase.id,
                        note=f"Purchase {purchase.reference_no}",
                        created_by=request.user,
                    )

                    variant.purchase_price = unit_cost_after_discount
                    if selling_price is not None:
                        variant.selling_price = selling_price
                    variant.save(update_fields=["purchase_price", "selling_price"])

                    if item.mfg_date or item.exp_date:
                        Batch.objects.create(
                            variant=variant,
                            location=purchase.location,
                            expiry_date=item.exp_date,
                            quantity=quantity,
                        )

                # Order-level discount/tax/total computation.
                if purchase.discount_type == DiscountType.PERCENTAGE:
                    discount = subtotal * purchase.discount_amount / 100
                elif purchase.discount_type == DiscountType.FIXED:
                    discount = purchase.discount_amount
                else:
                    discount = Decimal("0")

                taxable = subtotal - discount
                tax = (
                    taxable * purchase.tax_rate.rate / 100
                    if purchase.tax_rate
                    else Decimal("0")
                )
                total = (
                    taxable
                    + tax
                    + purchase.shipping_charges
                    + purchase.additional_expenses_amount
                )

                if total <= 0:
                    payment_status = PaymentStatus.PAID
                elif paid_amount <= 0:
                    payment_status = PaymentStatus.DUE
                elif paid_amount >= total:
                    payment_status = PaymentStatus.PAID
                else:
                    payment_status = PaymentStatus.PARTIAL

                purchase.subtotal = subtotal
                purchase.discount = discount
                purchase.tax = tax
                purchase.total = total
                purchase.paid_amount = min(paid_amount, total) if total > 0 else paid_amount
                purchase.payment_status = payment_status
                purchase.save(
                    update_fields=[
                        "subtotal", "discount", "tax", "total", "paid_amount", "payment_status",
                    ]
                )

                # The initial payment recorded on the create form is
                # itself the first row in the payment ledger -- this
                # is what Purchase Payment Report actually lists, not
                # Purchase.paid_amount directly.
                if purchase.paid_amount > 0:
                    PurchasePayment.objects.create(
                        purchase=purchase,
                        amount=purchase.paid_amount,
                        paid_on=request.data.get("paid_on") or purchase.purchase_date,
                        payment_method=request.data.get("payment_method", PaymentMethod.CASH),
                        payment_reference=request.data.get("payment_reference", ""),
                        payment_note=request.data.get("payment_note", ""),
                        created_by=request.user,
                    )
        except (ValueError, InvalidOperation) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            PurchaseDetailSerializer(purchase, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PurchaseDetailView(GenericAPIView):
    """
    GET    /api/pos/purchases/{id}/
    PATCH  /api/pos/purchases/{id}/  -- order-level fields only (status, notes)
    DELETE /api/pos/purchases/{id}/  -- blocked; use a Purchase Return instead

    A saved purchase has already moved real stock -- deleting it would
    silently corrupt StockLevel unless every movement were reversed.
    That reversal is what a Purchase Return is for, so DELETE always
    declines rather than attempting a partial, error-prone undo.
    """

    permission_classes = [IsAuthenticated, IsPOSAdminOrManager]

    def get_queryset(self):
        return Purchase.objects.select_related("location", "supplier", "tax_rate").prefetch_related(
            "items", "items__variant", "items__variant__product"
        )

    def _get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def get(self, request, pk):
        purchase = self._get_object(pk)
        return Response(PurchaseDetailSerializer(purchase, context={"request": request}).data)

    def patch(self, request, pk):
        purchase = self._get_object(pk)
        allowed = {"status", "notes"}
        data = {k: v for k, v in request.data.items() if k in allowed}
        for key, value in data.items():
            setattr(purchase, key, value)
        purchase.save(update_fields=list(data.keys()) or ["updated_at"])
        return Response(PurchaseDetailSerializer(purchase, context={"request": request}).data)

    def delete(self, request, pk):
        return Response(
            {
                "detail": (
                    "Purchases can't be deleted once saved, since stock has already "
                    "moved. Create a Purchase Return instead."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )


class PurchaseReturnListView(GenericAPIView):
    """
    GET  /api/pos/purchases/returns/         -- List Purchase Return
    POST /api/pos/purchases/returns/         -- Add Purchase Return

    Create takes {purchase, location, return_date, reason, items:
    [{variant, quantity, unit_cost}]}. Saving decreases stock and
    writes a StockMovement for each line -- the reverse of what the
    original Purchase did.
    """

    permission_classes = []  # overridden per-method below
    serializer_class = PurchaseReturnListSerializer
    pagination_class = POSResultsPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsPOSAdminOrManager()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        qs = PurchaseReturn.objects.select_related(
            "purchase", "purchase__supplier", "location"
        )
        location_id = self.request.query_params.get("location")
        if location_id:
            qs = qs.filter(location_id=location_id)
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(return_date__gte=date_from)
        if date_to:
            qs = qs.filter(return_date__lte=date_to)
        return qs

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def post(self, request):
        try:
            items_data = _parse_json_field(request, "items", [])
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if not items_data:
            return Response(
                {"items": ["At least one product line is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        purchase = get_object_or_404(Purchase, pk=request.data.get("purchase"))
        return_date = request.data.get("return_date")
        if not return_date:
            return Response(
                {"return_date": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                purchase_return = PurchaseReturn.objects.create(
                    purchase=purchase,
                    location=purchase.location,
                    return_date=return_date,
                    reason=request.data.get("reason", ""),
                    created_by=request.user,
                )

                total = Decimal("0")
                for row in items_data:
                    variant = get_object_or_404(POSVariant, pk=row.get("variant"))
                    quantity = _to_decimal(row.get("quantity"))
                    if quantity <= 0:
                        raise ValueError("Quantity must be greater than zero for every line.")
                    unit_cost = _to_decimal(row.get("unit_cost"))
                    line_total = quantity * unit_cost

                    stock_level = StockLevel.objects.filter(
                        variant=variant, location=purchase.location
                    ).first()
                    current_qty = stock_level.quantity if stock_level else Decimal("0")
                    if quantity > current_qty:
                        raise ValueError(
                            f"Can't return {quantity} of {variant} -- only {current_qty} in stock "
                            f"at {purchase.location.name}."
                        )

                    PurchaseReturnItem.objects.create(
                        purchase_return=purchase_return,
                        variant=variant,
                        quantity=quantity,
                        unit_cost=unit_cost,
                        line_total=line_total,
                    )
                    total += line_total

                    stock_level.quantity -= quantity
                    stock_level.save(update_fields=["quantity"])

                    StockMovement.objects.create(
                        variant=variant,
                        location=purchase.location,
                        movement_type=StockMovementType.PURCHASE_RETURN,
                        quantity=quantity,
                        reference_type="purchase_return",
                        reference_id=purchase_return.id,
                        note=f"Return against {purchase.reference_no}",
                        created_by=request.user,
                    )

                purchase_return.total = total
                purchase_return.save(update_fields=["total"])
        except (ValueError, InvalidOperation) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            PurchaseReturnDetailSerializer(purchase_return, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PurchasableItemListView(ListAPIView):
    """
    GET /api/pos/purchases/{purchase_id}/returnable-items/

    Powers the Add Purchase Return item picker -- lists the chosen
    purchase's original lines with how much of each remains returnable.
    """

    permission_classes = [IsAuthenticated, IsPOSAdminOrManager]
    serializer_class = PurchasableItemSerializer
    pagination_class = None

    def get_queryset(self):
        return PurchaseItem.objects.filter(
            purchase_id=self.kwargs["purchase_id"]
        ).select_related("variant", "variant__product")


class PurchasePaymentCreateView(GenericAPIView):
    """
    POST /api/pos/purchases/{id}/payments/

    Logs an additional payment against a purchase that's already
    partially paid -- this is how a purchase ends up with more than
    one row in Purchase Payment Report over time. Rejects an amount
    that would overpay past the remaining due.
    """

    permission_classes = [IsAuthenticated, IsPOSAdminOrManager]

    def post(self, request, pk):
        purchase = get_object_or_404(Purchase, pk=pk)

        try:
            amount = _to_decimal(request.data.get("amount"))
        except ValueError as e:
            return Response({"amount": [str(e)]}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response(
                {"amount": ["Must be greater than zero."]}, status=status.HTTP_400_BAD_REQUEST
            )

        remaining_due = purchase.total - purchase.paid_amount
        if amount > remaining_due:
            return Response(
                {"amount": [f"Exceeds the remaining due of {remaining_due}."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # request.data.get("paid_on") arrives as a plain string (JSON
        # or multipart both send text over the wire) -- it must be
        # parsed into a real datetime before being assigned, or
        # PurchasePayment.save()'s `self.paid_on.year` blows up the
        # moment a caller actually supplies this field explicitly
        # (the timezone.now() fallback path never hit the bug, which
        # is why omitting it looked fine).
        raw_paid_on = request.data.get("paid_on")
        if raw_paid_on:
            parsed_paid_on = parse_datetime(raw_paid_on)
            if parsed_paid_on is None:
                return Response(
                    {"paid_on": ["Not a valid date/time."]}, status=status.HTTP_400_BAD_REQUEST
                )
            paid_on = parsed_paid_on
        else:
            paid_on = timezone.now()

        with transaction.atomic():
            PurchasePayment.objects.create(
                purchase=purchase,
                amount=amount,
                paid_on=paid_on,
                payment_method=request.data.get("payment_method", PaymentMethod.CASH),
                payment_reference=request.data.get("payment_reference", ""),
                payment_note=request.data.get("payment_note", ""),
                created_by=request.user,
            )
            purchase.paid_amount += amount
            purchase.payment_status = (
                PaymentStatus.PAID
                if purchase.paid_amount >= purchase.total
                else PaymentStatus.PARTIAL
            )
            purchase.save(update_fields=["paid_amount", "payment_status"])

        return Response(
            PurchaseDetailSerializer(purchase, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
