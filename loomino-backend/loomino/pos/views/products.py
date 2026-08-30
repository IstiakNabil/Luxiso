import json
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import POSProduct, POSVariant, Location, StockLevel, get_document_prefix, DocumentType
from ..pagination import POSResultsPagination
from ..permissions import IsPOSStaff, CanEditProducts
from ..serializers.products import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    VariantSearchSerializer,
)


class VariantSearchListView(ListAPIView):
    """
    GET /api/pos/products/variants/search/?q=

    Backs the product/variant picker on Add Purchase (and later Add
    Sale). Requires 2+ characters, same reasoning as the Contacts
    account search -- don't dump the whole catalog on an empty query.
    """

    permission_classes = [IsAuthenticated, IsPOSStaff]
    serializer_class = VariantSearchSerializer
    pagination_class = None

    def get_queryset(self):
        q = self.request.query_params.get("q", "").strip()
        if len(q) < 2:
            return POSVariant.objects.none()
        return (
            POSVariant.objects.filter(
                Q(product__name__icontains=q)
                | Q(sku__icontains=q)
                | Q(variant_name__icontains=q)
                | Q(barcode__icontains=q)
            )
            .filter(is_active=True, product__is_active=True)
            .select_related("product", "product__unit")[:30]
        )


class VariantScanView(APIView):
    """
    GET /api/pos/products/variants/scan/?code=<scanned>&location=<id>

    The checkout scan lookup. Deliberately an EXACT match on barcode
    or SKU, never a fuzzy one -- a scanner feeding a real code must
    resolve to exactly one item or fail loudly, because silently
    grabbing the "closest" product would put the wrong thing in a
    customer's basket.

    Returns 404 with a clear message when nothing matches, so the
    till can beep/show "Unknown barcode" rather than sit silent.
    """

    permission_classes = [IsAuthenticated, IsPOSStaff]

    def get(self, request):
        code = request.query_params.get("code", "").strip()
        if not code:
            return Response(
                {"detail": "No code supplied."}, status=status.HTTP_400_BAD_REQUEST
            )

        variant = (
            POSVariant.objects.filter(Q(barcode=code) | Q(sku=code))
            .filter(is_active=True, product__is_active=True)
            .select_related("product", "product__unit", "product__tax_rate")
            .first()
        )
        if variant is None:
            return Response(
                {"detail": f"No product found for code '{code}'."},
                status=status.HTTP_404_NOT_FOUND,
            )

        location_id = request.query_params.get("location")
        current_stock = None
        if location_id:
            stock_level = StockLevel.objects.filter(
                variant=variant, location_id=location_id
            ).first()
            current_stock = stock_level.quantity if stock_level else Decimal("0")

        return Response(
            {
                "id": variant.id,
                "display_name": variant.display_name,
                "product_name": variant.product.name,
                "variant_name": variant.variant_name,
                "sku": variant.sku,
                "barcode": variant.barcode,
                "selling_price": variant.selling_price,
                "unit_short_name": (
                    variant.product.unit.short_name if variant.product.unit else ""
                ),
                "current_stock": current_stock,
                "not_for_selling": variant.product.not_for_selling,
                "manage_stock": variant.product.manage_stock,
            }
        )


def _parse_json_field(request, key, default):
    """
    variants/locations arrive as a JSON-encoded string alongside the
    multipart image/brochure upload (multipart can't natively carry
    nested arrays or lists) -- this decodes them, tolerating a missing
    key or one that was already parsed (plain JSON requests, no file).
    """
    raw = request.data.get(key, None)
    if raw is None:
        return default
    if isinstance(raw, (list, dict)):
        return raw
    try:
        return json.loads(raw)
    except (TypeError, ValueError):
        raise ValueError(f"'{key}' must be valid JSON.")


def _to_decimal(value, default):
    if value in (None, ""):
        value = default
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except InvalidOperation:
        raise ValueError(f"'{value}' is not a valid number.")


def _parse_bool(request, key, default):
    """
    See the is_active note below -- DRF's BooleanField treats a
    *missing* key in multipart data as explicit False, not "use the
    model default". Every boolean the create/update flow cares about
    is parsed by hand here instead of trusted to the serializer.
    """
    raw = request.data.get(key, None)
    if raw is None:
        return default
    return str(raw).lower() == "true"


class ProductListCreateView(GenericAPIView):
    """
    GET  /api/pos/products/                -- List Products
    POST /api/pos/products/                -- Add Product

    Filters: ?product_type=single|variable, ?category=, ?brand=,
    ?tax_rate=, ?unit=, ?location=, ?not_for_selling=true, ?search=

    Create accepts multipart (for the image/brochure) with two extra
    JSON-encoded fields:
      variants: [{variant_name, sku, purchase_price, selling_price, alert_quantity}]
                (exactly 1 entry for Single products, 1+ for Variable)
      locations: [location_id, ...]  -- which branches sell this; if
                 manage_stock is on, a zero StockLevel row is seeded
                 for each (variant x location) pair so Purchases/Stock
                 Adjustments have something to increment later. This
                 is NOT opening stock -- no quantity is entered here.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = POSResultsPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanEditProducts()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        qs = POSProduct.objects.select_related(
            "unit", "category", "brand", "tax_rate"
        ).prefetch_related(
            "variants",
            "variants__stock_levels",
            "variants__stock_levels__location",
            "locations",
        )

        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(sku__icontains=search))

        product_type = params.get("product_type")
        if product_type == "single":
            qs = qs.filter(has_variants=False)
        elif product_type == "variable":
            qs = qs.filter(has_variants=True)

        for param, field in [
            ("category", "category_id"),
            ("subcategory", "subcategory_id"),
            ("brand", "brand_id"),
            ("tax_rate", "tax_rate_id"),
            ("unit", "unit_id"),
        ]:
            value = params.get(param)
            if value:
                qs = qs.filter(**{field: value})

        if params.get("not_for_selling") == "true":
            qs = qs.filter(not_for_selling=True)

        location_id = params.get("location")
        if location_id:
            qs = qs.filter(locations__id=location_id).distinct()

        return qs

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        serializer = ProductListSerializer(
            page,
            many=True,
            context={"request": request, "location_id": request.query_params.get("location")},
        )
        return self.get_paginated_response(serializer.data)

    def post(self, request):
        try:
            variants_data = _parse_json_field(request, "variants", [])
            location_ids = _parse_json_field(request, "locations", [])
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        has_variants = _parse_bool(request, "has_variants", False)
        is_active = _parse_bool(request, "is_active", True)
        not_for_selling = _parse_bool(request, "not_for_selling", False)
        manage_stock = _parse_bool(request, "manage_stock", True)
        enable_serial_tracking = _parse_bool(request, "enable_serial_tracking", False)

        if not variants_data:
            return Response(
                {"variants": ["At least one variant is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not has_variants and len(variants_data) != 1:
            return Response(
                {"variants": ["A Single product must have exactly one variant."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if has_variants:
            for row in variants_data:
                if not str(row.get("variant_name", "")).strip():
                    return Response(
                        {"variants": ["Every variant needs a name for a Variable product."]},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

        product_serializer = ProductWriteSerializer(data=request.data)
        product_serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                product = product_serializer.save(
                    has_variants=has_variants,
                    is_active=is_active,
                    not_for_selling=not_for_selling,
                    manage_stock=manage_stock,
                    enable_serial_tracking=enable_serial_tracking,
                )

                if not product.sku:
                    product.sku = f"{get_document_prefix(DocumentType.PRODUCT_SKU)}{product.id:04d}"
                    product.save(update_fields=["sku"])

                locations = list(Location.objects.filter(id__in=location_ids))
                if locations:
                    product.locations.set(locations)

                created_variants = []
                for row in variants_data:
                    variant = POSVariant.objects.create(
                        product=product,
                        variant_name=row.get("variant_name", "").strip() if has_variants else "",
                        sku=row.get("sku") or f"{product.sku}-{len(created_variants) + 1}",
                        purchase_price=_to_decimal(row.get("purchase_price"), "0"),
                        selling_price=_to_decimal(row.get("selling_price"), "0"),
                        alert_quantity=_to_decimal(row.get("alert_quantity"), None),
                    )
                    created_variants.append(variant)

                # Seed a zero StockLevel per (variant, tagged location) so
                # Purchases/Stock Adjustments have a row to increment later
                # -- deliberately zero, not an opening-stock quantity.
                if manage_stock and locations:
                    StockLevel.objects.bulk_create(
                        [
                            StockLevel(variant=variant, location=location, quantity=0)
                            for variant in created_variants
                            for location in locations
                        ],
                        ignore_conflicts=True,
                    )
        except (ValueError, InvalidOperation) as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            ProductDetailSerializer(product, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ProductDetailView(GenericAPIView):
    """
    GET    /api/pos/products/{id}/
    PATCH  /api/pos/products/{id}/  -- product-level fields only
    DELETE /api/pos/products/{id}/  -- Admin/Manager only

    Variant and stock editing belong to the future Variations and
    Stock Adjustment pages, not this endpoint.
    """

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated(), IsPOSStaff()]
        return [IsAuthenticated(), CanEditProducts()]

    def get_queryset(self):
        return POSProduct.objects.select_related("unit", "category", "brand", "tax_rate")

    def _get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def get(self, request, pk):
        product = self._get_object(pk)
        return Response(
            ProductDetailSerializer(product, context={"request": request}).data
        )

    def patch(self, request, pk):
        product = self._get_object(pk)
        serializer = ProductWriteSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()

        try:
            location_ids = _parse_json_field(request, "locations", None)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        if location_ids is not None:
            product.locations.set(Location.objects.filter(id__in=location_ids))

        return Response(
            ProductDetailSerializer(product, context={"request": request}).data
        )

    def delete(self, request, pk):
        product = self._get_object(pk)
        if product.variants.filter(movements__isnull=False).exists():
            return Response(
                {
                    "detail": (
                        "This product has stock movement history and can't be "
                        "deleted. Set it to Inactive instead."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
