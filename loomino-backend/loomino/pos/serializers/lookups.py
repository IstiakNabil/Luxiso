from rest_framework import serializers

from ..models import Category, Brand, TaxRate


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
