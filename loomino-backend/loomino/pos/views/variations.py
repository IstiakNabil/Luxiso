from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import POSProduct, POSVariant, StockLevel
from ..permissions import IsPOSStaff, CanEditProducts
from ..services.storefront_sync import sync_product_to_storefront, PublishValidationError
from ..serializers.variations import VariationRowSerializer, VariationWriteSerializer


class VariationListCreateView(GenericAPIView):
    """
    GET  /api/pos/products/variations/?product=<id>  -- Add/Edit Variations
    POST /api/pos/products/variations/                -- add a new variant
         to an existing product

    A new variant is seeded with a single zero StockLevel row -- same
    reasoning as product creation: a row to increment later via
    Purchase/Stock Adjustment, not an opening-stock quantity. Stock is
    shared across every location, so there's one row, not one per
    tagged location.
    """

    serializer_class = VariationRowSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanEditProducts()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get(self, request):
        product_id = request.query_params.get("product")
        if not product_id:
            return Response(
                {"detail": "?product=<id> is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        product = get_object_or_404(POSProduct, pk=product_id)
        variants = product.variants.select_related("color", "size").prefetch_related(
            "stock_levels"
        )
        return Response(VariationRowSerializer(variants, many=True).data)

    def post(self, request):
        serializer = VariationWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            variant = serializer.save()
            product = variant.product

            if product.manage_stock:
                StockLevel.objects.get_or_create(variant=variant, defaults={"quantity": 0})

        publish_warning = None
        if product.publish_online:
            try:
                sync_product_to_storefront(product)
            except PublishValidationError as e:
                publish_warning = str(e)

        data = VariationRowSerializer(variant).data
        if publish_warning:
            data["publish_warning"] = publish_warning
        return Response(data, status=status.HTTP_201_CREATED)


class VariationDetailView(GenericAPIView):
    """
    PATCH  /api/pos/products/variations/{id}/
    DELETE /api/pos/products/variations/{id}/

    A variant with stock movement history (it's been sold, purchased,
    adjusted, etc.) can't be deleted -- same guard as deleting a whole
    product -- and a product's last remaining variant can't be deleted
    either, since Purchase/Sale/Stock always need at least one to
    point at.
    """

    permission_classes = [IsAuthenticated, CanEditProducts]
    serializer_class = VariationWriteSerializer

    def _get_object(self, pk):
        return get_object_or_404(POSVariant, pk=pk)

    def patch(self, request, pk):
        variant = self._get_object(pk)
        serializer = VariationWriteSerializer(variant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                variant = serializer.save()
        except (ValueError, InvalidOperation) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        product = variant.product
        publish_warning = None
        if product.publish_online:
            try:
                sync_product_to_storefront(product)
            except PublishValidationError as e:
                publish_warning = str(e)

        data = VariationRowSerializer(variant).data
        if publish_warning:
            data["publish_warning"] = publish_warning
        return Response(data)

    def delete(self, request, pk):
        variant = self._get_object(pk)
        product = variant.product

        if variant.movements.exists():
            return Response(
                {
                    "detail": (
                        "This variant has stock movement history and can't be "
                        "deleted. Set it to Inactive instead."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if product.variants.count() <= 1:
            return Response(
                {"detail": "A product needs at least one variant -- delete the product instead."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # The storefront ProductVariant's `pos_source` is SET_NULL on
        # delete, so it would otherwise survive as an orphaned,
        # still-purchasable row with stale stock -- deactivate it
        # first rather than let that happen silently.
        storefront_variant = getattr(variant, "storefront_variant", None)
        if storefront_variant:
            storefront_variant.is_active = False
            storefront_variant.stock = 0
            storefront_variant.save(update_fields=["is_active", "stock"])

        variant.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
