from decimal import Decimal

from rest_framework import serializers

from ..models import POSProduct, POSVariant, Unit, Category, Brand, TaxRate


def _price_range(values: list[Decimal]) -> str:
    values = [v for v in values if v is not None]
    if not values:
        return "-"
    lo, hi = min(values), max(values)
    if lo == hi:
        return f"{lo:.2f}"
    return f"{lo:.2f} - {hi:.2f}"


class ProductListSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    unit_name = serializers.CharField(source="unit.short_name", default="-", read_only=True)
    category_name = serializers.CharField(source="category.name", default="-", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", default=None, read_only=True)
    brand_name = serializers.CharField(source="brand.name", default="-", read_only=True)
    tax_name = serializers.CharField(source="tax_rate.name", default="-", read_only=True)
    product_type = serializers.CharField(read_only=True)
    location_names = serializers.SerializerMethodField()
    unit_purchase_price = serializers.SerializerMethodField()
    selling_price = serializers.SerializerMethodField()
    current_stock = serializers.SerializerMethodField()

    class Meta:
        model = POSProduct
        fields = [
            "id",
            "image_url",
            "name",
            "sku",
            "location_names",
            "unit_purchase_price",
            "selling_price",
            "current_stock",
            "unit_name",
            "product_type",
            "category_name",
            "subcategory_name",
            "brand_name",
            "tax_name",
            "custom_field_1",
            "custom_field_2",
            "custom_field_3",
            "custom_field_4",
            "manage_stock",
            "not_for_selling",
            "is_active",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None  # frontend shows its own default placeholder icon

    def get_location_names(self, obj):
        names = sorted(loc.name for loc in obj.locations.all())
        return ", ".join(names) if names else "-"

    def get_unit_purchase_price(self, obj):
        return _price_range([v.purchase_price for v in obj.variants.all()])

    def get_selling_price(self, obj):
        return _price_range([v.selling_price for v in obj.variants.all()])

    def get_current_stock(self, obj):
        if not obj.manage_stock:
            return "N/A"
        location_id = self.context.get("location_id")
        total = Decimal("0")
        for variant in obj.variants.all():
            for sl in variant.stock_levels.all():
                if location_id and str(sl.location_id) != str(location_id):
                    continue
                total += sl.quantity
        unit = obj.unit.short_name if obj.unit else ""
        return f"{total:g} {unit}".strip()


class VariantMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = POSVariant
        fields = [
            "id", "variant_name", "size", "color", "sku", "barcode",
            "purchase_price", "selling_price", "alert_quantity",
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    variants = VariantMiniSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    brochure_url = serializers.SerializerMethodField()
    location_ids = serializers.PrimaryKeyRelatedField(
        source="locations", many=True, read_only=True
    )

    class Meta:
        model = POSProduct
        fields = [
            "id",
            "name",
            "sku",
            "barcode_type",
            "unit",
            "category",
            "subcategory",
            "brand",
            "tax_rate",
            "location_ids",
            "image_url",
            "brochure_url",
            "description",
            "weight",
            "has_variants",
            "product_type",
            "manage_stock",
            "enable_serial_tracking",
            "alert_quantity",
            "custom_field_1",
            "custom_field_2",
            "custom_field_3",
            "custom_field_4",
            "not_for_selling",
            "is_active",
            "variants",
            "created_at",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None

    def get_brochure_url(self, obj):
        request = self.context.get("request")
        if obj.brochure and hasattr(obj.brochure, "url"):
            return request.build_absolute_uri(obj.brochure.url) if request else obj.brochure.url
        return None


class ProductWriteSerializer(serializers.ModelSerializer):
    """
    Product-level fields only. Variants and location-tagging are
    handled separately in the view (see ProductListCreateView.post)
    since they arrive as JSON-encoded strings alongside the multipart
    image/brochure upload -- editing variants/stock belongs to the
    future Variations and Stock Adjustment pages, not here.
    """

    unit = serializers.PrimaryKeyRelatedField(queryset=Unit.objects.all())
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )
    subcategory = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )
    brand = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), required=False, allow_null=True
    )
    tax_rate = serializers.PrimaryKeyRelatedField(
        queryset=TaxRate.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = POSProduct
        fields = [
            "name",
            "sku",
            "barcode_type",
            "unit",
            "category",
            "subcategory",
            "brand",
            "tax_rate",
            "image",
            "brochure",
            "description",
            "weight",
            "has_variants",
            "alert_quantity",
            "custom_field_1",
            "custom_field_2",
            "custom_field_3",
            "custom_field_4",
            "not_for_selling",
            "is_active",
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value

    def validate(self, attrs):
        # On a partial PATCH, a field the request didn't touch is
        # absent from attrs entirely -- fall back to the existing
        # instance's value so changing just `category` (or just
        # `subcategory`) still gets checked against whichever the
        # other one already is, not silently skipped.
        instance = getattr(self, "instance", None)
        subcategory = attrs.get(
            "subcategory", instance.subcategory if instance else None
        )
        category = attrs.get("category", instance.category if instance else None)
        if subcategory and subcategory.parent_id and category and subcategory.parent_id != category.id:
            raise serializers.ValidationError(
                {"subcategory": "This subcategory doesn't belong to the selected category."}
            )
        return attrs


class VariantSearchSerializer(serializers.ModelSerializer):
    """
    Powers the product/variant picker used by Add Purchase (and later
    Add Sale) -- "Enter Product name / SKU / Scan bar code".
    """

    product_name = serializers.CharField(source="product.name", read_only=True)
    unit_short_name = serializers.CharField(
        source="product.unit.short_name", default="", read_only=True
    )
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = POSVariant
        fields = [
            "id",
            "display_name",
            "product_name",
            "variant_name",
            "sku",
            "barcode",
            "purchase_price",
            "selling_price",
            "unit_short_name",
        ]
