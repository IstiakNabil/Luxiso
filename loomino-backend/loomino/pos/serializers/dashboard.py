from rest_framework import serializers

from ..models import Sale, Purchase, StockLevel, Batch


class SalesPaymentDueSerializer(serializers.ModelSerializer):
    customer = serializers.CharField(source="customer_name")
    invoice_no = serializers.CharField()
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        model = Sale
        fields = ["id", "customer", "invoice_no", "due_amount"]


class PurchasePaymentDueSerializer(serializers.ModelSerializer):
    supplier = serializers.CharField(source="supplier.name")
    reference_no = serializers.CharField()
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        model = Purchase
        fields = ["id", "supplier", "reference_no", "due_amount"]


class ProductStockAlertSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source="variant.display_name")
    location = serializers.CharField(source="location.name")
    current_stock = serializers.DecimalField(
        source="quantity", max_digits=12, decimal_places=2
    )
    unit = serializers.SerializerMethodField()

    class Meta:
        model = StockLevel
        fields = ["id", "product", "location", "current_stock", "unit"]

    def get_unit(self, obj):
        unit = obj.variant.product.unit
        return unit.short_name if unit else ""


class StockExpiryAlertSerializer(serializers.ModelSerializer):
    product = serializers.CharField(source="variant.display_name")
    location = serializers.CharField(source="location.name")
    stock_left = serializers.DecimalField(
        source="quantity", max_digits=12, decimal_places=2
    )
    expires_in_days = serializers.SerializerMethodField()

    class Meta:
        model = Batch
        fields = ["id", "product", "location", "stock_left", "expiry_date", "expires_in_days"]

    def get_expires_in_days(self, obj):
        if not obj.expiry_date:
            return None
        from django.utils import timezone

        return (obj.expiry_date - timezone.localdate()).days


class SalesOrderListSerializer(serializers.ModelSerializer):
    order_no = serializers.CharField(source="invoice_no")
    customer_name = serializers.CharField()
    contact_number = serializers.CharField(source="customer_phone")
    location = serializers.CharField(source="location.name")
    added_by = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            "id",
            "sale_date",
            "order_no",
            "customer_name",
            "contact_number",
            "location",
            "status",
            "shipping_status",
            "quantity_remaining",
            "added_by",
        ]

    def get_added_by(self, obj):
        if not obj.added_by:
            return ""
        return f"{obj.added_by.first_name} {obj.added_by.last_name}".strip()
