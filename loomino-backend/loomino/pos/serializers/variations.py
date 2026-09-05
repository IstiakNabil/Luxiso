from decimal import Decimal

from rest_framework import serializers

from ..models import POSVariant, POSProduct
from products.models import Color, Size


class VariationRowSerializer(serializers.ModelSerializer):
    """Read shape for the Variations page -- one row per variant,
    with a total-stock figure (summed across every location) for
    context, same reasoning as ProductListSerializer.get_current_stock."""

    color_name = serializers.CharField(source="color.name", default=None, read_only=True)
    size_name = serializers.CharField(source="size.name", default=None, read_only=True)
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = POSVariant
        fields = [
            "id", "product", "variant_name", "color", "color_name", "size", "size_name",
            "sku", "barcode", "purchase_price", "selling_price", "alert_quantity",
            "is_active", "total_stock",
        ]
        read_only_fields = ["barcode"]

    def get_total_stock(self, obj):
        total = sum((sl.quantity for sl in obj.stock_levels.all()), Decimal("0"))
        return str(total)


class VariationWriteSerializer(serializers.ModelSerializer):
    """
    Add/Edit a single variant on an existing product. `product` is
    required on create, ignored (can't move a variant to a different
    product) on update.
    """

    product = serializers.PrimaryKeyRelatedField(queryset=POSProduct.objects.all())
    color = serializers.PrimaryKeyRelatedField(
        queryset=Color.objects.all(), required=False, allow_null=True
    )
    size = serializers.PrimaryKeyRelatedField(
        queryset=Size.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = POSVariant
        fields = [
            "product", "variant_name", "color", "size", "sku",
            "purchase_price", "selling_price", "alert_quantity", "is_active",
        ]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        product = attrs.get("product") or (instance.product if instance else None)
        color = attrs.get("color", instance.color if instance else None)
        size = attrs.get("size", instance.size if instance else None)
        variant_name = attrs.get("variant_name", instance.variant_name if instance else "")

        if not variant_name.strip() and not (color and size):
            raise serializers.ValidationError(
                "Give this variant a name, or a color and size."
            )

        qs = POSVariant.objects.filter(product=product, color=color, size=size)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if color and size and qs.exists():
            raise serializers.ValidationError(
                "This product already has a variant with that color and size."
            )
        return attrs

    def update(self, instance, validated_data):
        # A variant never moves to a different product once created.
        validated_data.pop("product", None)
        return super().update(instance, validated_data)
