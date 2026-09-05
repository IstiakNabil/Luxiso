from rest_framework import serializers

from ..models import Category, Brand, TaxRate
from products.models import (
    Color as StorefrontColor,
    Size as StorefrontSize,
    Category as StorefrontCategory,
    ProductType as StorefrontProductType,
)


class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.name", default=None, read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name", "category_code", "description", "parent", "parent_name", "is_active"]


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "note", "is_active"]


class TaxRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxRate
        fields = ["id", "name", "rate", "is_active"]


class POSColorSerializer(serializers.ModelSerializer):
    """
    Writes to products.Color -- the same table the storefront's
    swatches read from -- so a color added from POS is immediately
    usable there too. Gated by POS permissions (CanEditProducts), not
    the storefront's own is_staff-based admin permission, since the
    two systems deliberately don't share a permission model.
    """

    class Meta:
        model = StorefrontColor
        fields = ["id", "name", "hex_code", "is_active"]


class POSSizeSerializer(serializers.ModelSerializer):
    """Writes to products.Size -- see POSColorSerializer."""

    class Meta:
        model = StorefrontSize
        fields = ["id", "name", "display_order", "is_active"]


class POSStorefrontCategorySerializer(serializers.ModelSerializer):
    """
    Writes to products.Category -- the storefront's own browsing
    taxonomy, separate from pos.Category above (internal POS
    reporting). Slug auto-generates in the model's save().
    """

    class Meta:
        model = StorefrontCategory
        fields = ["id", "name", "is_active"]


class POSStorefrontTypeSerializer(serializers.ModelSerializer):
    """Writes to products.ProductType -- see POSStorefrontCategorySerializer."""

    categories = serializers.PrimaryKeyRelatedField(
        queryset=StorefrontCategory.objects.all(), many=True, required=False
    )

    class Meta:
        model = StorefrontProductType
        fields = ["id", "name", "categories", "is_active"]
