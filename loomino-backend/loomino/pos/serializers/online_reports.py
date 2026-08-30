from rest_framework import serializers

from products.models import Product as OnlineProduct, ProductVariant as OnlineProductVariant
from orders.models import Order as OnlineOrder, Payment as OnlinePayment


class OnlineProductStockSerializer(serializers.ModelSerializer):
    """One row per online variant -- stock is tracked at the variant level online, same as POS."""

    product_name = serializers.CharField(source="product.name", read_only=True)
    category_name = serializers.CharField(source="product.category.name", read_only=True)
    color_name = serializers.CharField(source="color.name", read_only=True)
    size_name = serializers.CharField(source="size.name", read_only=True)
    price = serializers.DecimalField(source="selling_price", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OnlineProductVariant
        fields = [
            "id", "product_name", "category_name", "color_name", "size_name",
            "sku", "stock", "price", "is_active",
        ]


class OnlineSaleListSerializer(serializers.ModelSerializer):
    """One row per online order -- the "Online Sales" equivalent of All Sales."""

    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.CharField(source="user.email", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    item_count = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = OnlineOrder
        fields = [
            "id", "order_number", "created_at", "customer_name", "customer_email",
            "status", "status_display", "cancel_refund_status", "subtotal",
            "shipping_cost", "discount", "total", "item_count",
            "payment_method", "payment_status",
        ]

    def get_customer_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name or obj.user.email

    def get_item_count(self, obj):
        # items are prefetched by the view; len() avoids a second query
        return sum(item.quantity for item in obj.items.all())

    def get_payment_method(self, obj):
        payment = getattr(obj, "payment", None)
        return payment.get_payment_method_display() if payment else "—"

    def get_payment_status(self, obj):
        payment = getattr(obj, "payment", None)
        return payment.get_status_display() if payment else "—"
