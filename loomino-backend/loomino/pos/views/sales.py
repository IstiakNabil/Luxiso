import json
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework import status
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import (
    Sale, SaleItem, SaleStatus, SaleReturn, SaleReturnItem,
    PaymentStatus, PaymentMethod, DiscountType, POSVariant, StockLevel, StockMovement, StockMovementType,
    SalePayment,
)
from ..pagination import POSResultsPagination
from ..permissions import IsPOSStaff, CanSell, IsPOSAdminOrManager
from ..serializers.sales import (
    SaleListSerializer,
    SaleDetailSerializer,
    SaleWriteSerializer,
    SaleReturnListSerializer,
    SaleReturnDetailSerializer,
    ReturnableSaleItemSerializer,
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


STOCK_MOVING_STATUSES = {SaleStatus.FINAL}


class SaleListCreateView(GenericAPIView):
    """
    GET  /api/pos/sales/    -- backs All Sales, List Drafts, List
                                quotations via ?status=
    POST /api/pos/sales/    -- backs Add Sale, Add Draft, Add
                                Quotation via the "status" field

    Only a Final sale moves stock -- Draft/Quotation/Suspended are
    provisional and don't touch StockLevel at all. A Final sale is
    blocked if it would oversell (quantity requested exceeds current
    stock), the mirror of Purchase Return's over-return guard.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = POSResultsPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanSell()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        qs = Sale.objects.select_related("location", "customer", "added_by")
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(invoice_no__icontains=search)

        for param, field in [
            ("location", "location_id"),
            ("customer", "customer_id"),
            ("status", "status"),
            ("payment_status", "payment_status"),
            ("shipping_status", "shipping_status"),
        ]:
            value = params.get(param)
            if value:
                qs = qs.filter(**{field: value})

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale_date__date__lte=date_to)

        return qs

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        serializer = SaleListSerializer(page, many=True)
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

        sale_status = request.data.get("status") or SaleStatus.FINAL
        sale_serializer = SaleWriteSerializer(data=request.data)
        sale_serializer.is_valid(raise_exception=True)

        paid_amount = _to_decimal(request.data.get("paid_amount"), "0")

        try:
            with transaction.atomic():
                sale = sale_serializer.save(added_by=request.user, status=sale_status)

                subtotal = Decimal("0")
                total_quantity = Decimal("0")

                for row in items_data:
                    variant = get_object_or_404(POSVariant, pk=row.get("variant"))
                    quantity = _to_decimal(row.get("quantity"))
                    if quantity <= 0:
                        raise ValueError("Quantity must be greater than zero for every line.")
                    unit_price = _to_decimal(row.get("unit_price"))
                    discount_amount = _to_decimal(row.get("discount_amount"), "0")
                    line_subtotal = quantity * unit_price - discount_amount

                    if sale_status in STOCK_MOVING_STATUSES:
                        stock_level = StockLevel.objects.filter(
                            variant=variant, location=sale.location
                        ).first()
                        current_qty = stock_level.quantity if stock_level else Decimal("0")
                        if quantity > current_qty:
                            raise ValueError(
                                f"Can't sell {quantity} of {variant} -- only {current_qty} "
                                f"in stock at {sale.location.name}."
                            )

                    SaleItem.objects.create(
                        sale=sale,
                        variant=variant,
                        quantity=quantity,
                        unit_price=unit_price,
                        discount_amount=discount_amount,
                        subtotal=line_subtotal,
                    )
                    subtotal += line_subtotal
                    total_quantity += quantity

                    if sale_status in STOCK_MOVING_STATUSES:
                        stock_level.quantity -= quantity
                        stock_level.save(update_fields=["quantity"])

                        StockMovement.objects.create(
                            variant=variant,
                            location=sale.location,
                            movement_type=StockMovementType.SALE,
                            quantity=quantity,
                            reference_type="sale",
                            reference_id=sale.id,
                            note=f"Sale {sale.invoice_no}",
                            created_by=request.user,
                        )

                if sale.discount_type == DiscountType.PERCENTAGE:
                    discount = subtotal * sale.discount_amount / 100
                elif sale.discount_type == DiscountType.FIXED:
                    discount = sale.discount_amount
                else:
                    discount = Decimal("0")

                taxable = subtotal - discount
                tax = taxable * sale.tax_rate.rate / 100 if sale.tax_rate else Decimal("0")
                total = taxable + tax + sale.shipping_charges + sale.additional_expenses_amount

                if sale_status != SaleStatus.FINAL:
                    payment_status = PaymentStatus.DUE
                elif total <= 0:
                    payment_status = PaymentStatus.PAID
                elif paid_amount <= 0:
                    payment_status = PaymentStatus.DUE
                elif paid_amount >= total:
                    payment_status = PaymentStatus.PAID
                else:
                    payment_status = PaymentStatus.PARTIAL

                sale.subtotal = subtotal
                sale.discount = discount
                sale.tax = tax
                sale.total = total
                sale.total_quantity = total_quantity
                sale.paid_amount = min(paid_amount, total) if total > 0 else paid_amount
                sale.payment_status = payment_status
                sale.save(update_fields=[
                    "subtotal", "discount", "tax", "total", "total_quantity",
                    "paid_amount", "payment_status",
                ])

                # Only a Final sale represents a real transaction --
                # Draft/Quotation/Suspended never get a payment ledger
                # row, same reasoning as why they never touch stock.
                if sale_status == SaleStatus.FINAL and sale.paid_amount > 0:
                    SalePayment.objects.create(
                        sale=sale,
                        amount=sale.paid_amount,
                        paid_on=request.data.get("paid_on") or sale.sale_date,
                        payment_method=request.data.get("payment_method", PaymentMethod.CASH),
                        payment_reference=request.data.get("payment_reference", ""),
                        payment_note=request.data.get("payment_note", ""),
                        created_by=request.user,
                    )
        except (ValueError, InvalidOperation) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            SaleDetailSerializer(sale, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class SaleDetailView(GenericAPIView):
    """
    GET    /api/pos/sales/{id}/
    PATCH  /api/pos/sales/{id}/  -- order-level fields only (status, shipping fields, notes)
    DELETE /api/pos/sales/{id}/

    A Final sale has already moved stock, so DELETE is blocked the
    same way a saved Purchase is -- use a Sell Return instead. A
    Draft/Quotation/Suspended sale never touched stock, so deleting it
    is safe and always allowed.
    """

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated(), IsPOSStaff()]
        return [IsAuthenticated(), CanSell()]

    def get_queryset(self):
        return Sale.objects.select_related("location", "customer", "tax_rate").prefetch_related(
            "items", "items__variant", "items__variant__product"
        )

    def _get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def get(self, request, pk):
        sale = self._get_object(pk)
        return Response(SaleDetailSerializer(sale, context={"request": request}).data)

    def patch(self, request, pk):
        sale = self._get_object(pk)
        allowed = {"status", "shipping_status", "delivered_to", "notes"}
        data = {k: v for k, v in request.data.items() if k in allowed}
        for key, value in data.items():
            setattr(sale, key, value)
        sale.save(update_fields=list(data.keys()) or ["updated_at"])
        return Response(SaleDetailSerializer(sale, context={"request": request}).data)

    def delete(self, request, pk):
        sale = self._get_object(pk)
        if sale.status == SaleStatus.FINAL:
            return Response(
                {
                    "detail": (
                        "Final sales can't be deleted once saved, since stock has "
                        "already moved. Create a Sell Return instead."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        sale.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SaleReturnListView(GenericAPIView):
    """
    GET  /api/pos/sales/returns/   -- List Sell Return
    POST /api/pos/sales/returns/   -- Add Sell Return

    Mirror of PurchaseReturnListView: choosing items/quantities from a
    Final sale and saving increases stock back, the reverse of what
    the sale did.
    """

    serializer_class = SaleReturnListSerializer
    pagination_class = POSResultsPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsPOSAdminOrManager()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        qs = SaleReturn.objects.select_related("sale", "sale__customer", "location")
        location_id = self.request.query_params.get("location")
        if location_id:
            qs = qs.filter(location_id=location_id)
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")
        if date_from:
            qs = qs.filter(return_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(return_date__date__lte=date_to)
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

        sale = get_object_or_404(Sale, pk=request.data.get("sale"))
        return_date = request.data.get("return_date")
        if not return_date:
            return Response(
                {"return_date": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                sale_return = SaleReturn.objects.create(
                    sale=sale,
                    location=sale.location,
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
                    unit_price = _to_decimal(row.get("unit_price"))
                    line_total = quantity * unit_price

                    SaleReturnItem.objects.create(
                        sale_return=sale_return,
                        variant=variant,
                        quantity=quantity,
                        unit_price=unit_price,
                        line_total=line_total,
                    )
                    total += line_total

                    stock_level, _ = StockLevel.objects.get_or_create(
                        variant=variant, location=sale.location
                    )
                    stock_level.quantity += quantity
                    stock_level.save(update_fields=["quantity"])

                    StockMovement.objects.create(
                        variant=variant,
                        location=sale.location,
                        movement_type=StockMovementType.SALE_RETURN,
                        quantity=quantity,
                        reference_type="sale_return",
                        reference_id=sale_return.id,
                        note=f"Return against {sale.invoice_no}",
                        created_by=request.user,
                    )

                sale_return.total = total
                sale_return.save(update_fields=["total"])
        except (ValueError, InvalidOperation) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            SaleReturnDetailSerializer(sale_return, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ReturnableSaleItemListView(ListAPIView):
    """GET /api/pos/sales/{sale_id}/returnable-items/ -- Add Sell Return item picker."""

    permission_classes = [IsAuthenticated, IsPOSAdminOrManager]
    serializer_class = ReturnableSaleItemSerializer
    pagination_class = None

    def get_queryset(self):
        return SaleItem.objects.filter(
            sale_id=self.kwargs["sale_id"]
        ).select_related("variant", "variant__product")


class SalePaymentCreateView(GenericAPIView):
    """
    POST /api/pos/sales/{id}/payments/

    Logs an additional payment against a Final sale that's already
    partially paid -- mirror of PurchasePaymentCreateView.
    """

    permission_classes = [IsAuthenticated, IsPOSAdminOrManager]

    def post(self, request, pk):
        sale = get_object_or_404(Sale, pk=pk)

        if sale.status != SaleStatus.FINAL:
            return Response(
                {"detail": "Only a Final sale can have payments recorded against it."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = _to_decimal(request.data.get("amount"))
        except ValueError as e:
            return Response({"amount": [str(e)]}, status=status.HTTP_400_BAD_REQUEST)

        if amount <= 0:
            return Response(
                {"amount": ["Must be greater than zero."]}, status=status.HTTP_400_BAD_REQUEST
            )

        remaining_due = sale.total - sale.paid_amount
        if amount > remaining_due:
            return Response(
                {"amount": [f"Exceeds the remaining due of {remaining_due}."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
            SalePayment.objects.create(
                sale=sale,
                amount=amount,
                paid_on=paid_on,
                payment_method=request.data.get("payment_method", PaymentMethod.CASH),
                payment_reference=request.data.get("payment_reference", ""),
                payment_note=request.data.get("payment_note", ""),
                created_by=request.user,
            )
            sale.paid_amount += amount
            sale.payment_status = (
                PaymentStatus.PAID if sale.paid_amount >= sale.total else PaymentStatus.PARTIAL
            )
            sale.save(update_fields=["paid_amount", "payment_status"])

        return Response(
            SaleDetailSerializer(sale, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )
