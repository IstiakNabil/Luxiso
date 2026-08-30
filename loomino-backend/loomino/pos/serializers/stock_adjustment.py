from rest_framework import serializers

from ..models import StockAdjustment, StockAdjustmentItem, Location


class StockAdjustmentListSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source="location.name", read_only=True)
    adjustment_type_display = serializers.CharField(
        source="get_adjustment_type_display", read_only=True
    )
    added_by = serializers.SerializerMethodField()

    class Meta:
        model = StockAdjustment
        fields = [
            "id", "reference_no", "adjustment_date", "location_name",
            "adjustment_type", "adjustment_type_display", "total_amount",
            "total_amount_recovered", "reason", "added_by",
        ]

    def get_added_by(self, obj):
        if not obj.created_by:
            return ""
        return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()


class StockAdjustmentItemDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.variant_name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)

    class Meta:
        model = StockAdjustmentItem
        fields = ["id", "variant", "product_name", "variant_name", "sku", "quantity", "unit_price", "subtotal"]


class StockAdjustmentDetailSerializer(serializers.ModelSerializer):
    items = StockAdjustmentItemDetailSerializer(many=True, read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True)
    adjustment_type_display = serializers.CharField(
        source="get_adjustment_type_display", read_only=True
    )

    class Meta:
        model = StockAdjustment
        fields = [
            "id", "reference_no", "location", "location_name", "adjustment_date",
            "adjustment_type", "adjustment_type_display", "total_amount",
            "total_amount_recovered", "reason", "items", "created_at",
        ]


class StockAdjustmentWriteSerializer(serializers.ModelSerializer):
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())

    class Meta:
        model = StockAdjustment
        fields = [
            "location", "reference_no", "adjustment_date", "adjustment_type",
            "total_amount_recovered", "reason",
        ]
