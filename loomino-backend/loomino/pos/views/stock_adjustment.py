import json
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import (
    StockAdjustment, StockAdjustmentItem, AdjustmentType,
    POSVariant, StockLevel, StockMovement, StockMovementType,
)
from ..pagination import POSResultsPagination
from ..permissions import IsPOSStaff, CanManageStockAdjustments
from ..serializers.stock_adjustment import (
    StockAdjustmentListSerializer,
    StockAdjustmentDetailSerializer,
    StockAdjustmentWriteSerializer,
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
    try:
        return Decimal(str(value))
    except InvalidOperation:
        raise ValueError(f"'{value}' is not a valid number.")


class StockAdjustmentListCreateView(GenericAPIView):
    """
    GET  /api/pos/stock-adjustments/
    POST /api/pos/stock-adjustments/

    Normal decreases stock (loss/damage/theft) and is blocked if it
    would take a variant below zero at that location -- the same
    oversell-style guard used by Sales and Purchase/Sale Returns.
    Abnormal increases stock (a correction for stock found that wasn't
    recorded) and has no such ceiling.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = POSResultsPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanManageStockAdjustments()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        qs = StockAdjustment.objects.select_related("location", "created_by")
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(reference_no__icontains=search)

        location_id = params.get("location")
        if location_id:
            qs = qs.filter(location_id=location_id)

        adjustment_type = params.get("adjustment_type")
        if adjustment_type:
            qs = qs.filter(adjustment_type=adjustment_type)

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(adjustment_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(adjustment_date__date__lte=date_to)

        return qs

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        serializer = StockAdjustmentListSerializer(page, many=True)
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

        write_serializer = StockAdjustmentWriteSerializer(data=request.data)
        write_serializer.is_valid(raise_exception=True)
        adjustment_type = write_serializer.validated_data.get(
            "adjustment_type", AdjustmentType.NORMAL
        )

        try:
            with transaction.atomic():
                adjustment = write_serializer.save(created_by=request.user)

                total_amount = Decimal("0")
                for row in items_data:
                    variant = get_object_or_404(POSVariant, pk=row.get("variant"))
                    quantity = _to_decimal(row.get("quantity"))
                    if quantity <= 0:
                        raise ValueError("Quantity must be greater than zero for every line.")
                    unit_price = _to_decimal(row.get("unit_price"))
                    subtotal = quantity * unit_price

                    stock_level, _ = StockLevel.objects.get_or_create(
                        variant=variant, location=adjustment.location
                    )

                    if adjustment_type == AdjustmentType.NORMAL:
                        if quantity > stock_level.quantity:
                            raise ValueError(
                                f"Can't write off {quantity} of {variant} -- only "
                                f"{stock_level.quantity} in stock at {adjustment.location.name}."
                            )
                        stock_level.quantity -= quantity
                        movement_type = StockMovementType.ADJUSTMENT_DECREASE
                    else:
                        stock_level.quantity += quantity
                        movement_type = StockMovementType.ADJUSTMENT_INCREASE

                    stock_level.save(update_fields=["quantity"])

                    StockAdjustmentItem.objects.create(
                        stock_adjustment=adjustment,
                        variant=variant,
                        quantity=quantity,
                        unit_price=unit_price,
                        subtotal=subtotal,
                    )
                    total_amount += subtotal

                    StockMovement.objects.create(
                        variant=variant,
                        location=adjustment.location,
                        movement_type=movement_type,
                        quantity=quantity,
                        reference_type="stock_adjustment",
                        reference_id=adjustment.id,
                        note=f"Stock adjustment {adjustment.reference_no}",
                        created_by=request.user,
                    )

                adjustment.total_amount = total_amount
                adjustment.save(update_fields=["total_amount"])
        except (ValueError, InvalidOperation) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            StockAdjustmentDetailSerializer(adjustment).data,
            status=status.HTTP_201_CREATED,
        )


class StockAdjustmentDetailView(GenericAPIView):
    """
    GET    /api/pos/stock-adjustments/{id}/
    DELETE /api/pos/stock-adjustments/{id}/

    Unlike a Purchase or a Final sale, deleting a Stock Adjustment
    reverses its stock effect rather than being permanently blocked --
    a Normal (decrease) adjustment's deletion adds the quantity back;
    an Abnormal (increase) adjustment's deletion removes it, and that
    removal is itself blocked if the stock has since been used
    elsewhere and would go negative.
    """

    permission_classes = [IsAuthenticated, CanManageStockAdjustments]

    def get_queryset(self):
        return StockAdjustment.objects.select_related("location").prefetch_related(
            "items", "items__variant", "items__variant__product"
        )

    def _get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def get(self, request, pk):
        adjustment = self._get_object(pk)
        return Response(StockAdjustmentDetailSerializer(adjustment).data)

    def delete(self, request, pk):
        adjustment = self._get_object(pk)

        try:
            with transaction.atomic():
                for item in adjustment.items.all():
                    stock_level, _ = StockLevel.objects.get_or_create(
                        variant=item.variant, location=adjustment.location
                    )

                    if adjustment.adjustment_type == AdjustmentType.NORMAL:
                        stock_level.quantity += item.quantity
                        reversal_type = StockMovementType.ADJUSTMENT_INCREASE
                    else:
                        if item.quantity > stock_level.quantity:
                            raise ValueError(
                                f"Can't undo this adjustment -- {item.variant} only has "
                                f"{stock_level.quantity} in stock now, less than the "
                                f"{item.quantity} this adjustment added."
                            )
                        stock_level.quantity -= item.quantity
                        reversal_type = StockMovementType.ADJUSTMENT_DECREASE

                    stock_level.save(update_fields=["quantity"])

                    StockMovement.objects.create(
                        variant=item.variant,
                        location=adjustment.location,
                        movement_type=reversal_type,
                        quantity=item.quantity,
                        reference_type="stock_adjustment_reversal",
                        reference_id=adjustment.id,
                        note=f"Reversal of deleted adjustment {adjustment.reference_no}",
                        created_by=request.user,
                    )

                adjustment.delete()
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(status=status.HTTP_204_NO_CONTENT)
