from rest_framework import serializers
from products.models import ProductVariant
from orders.models import Order, OrderItem
from accounts.models import User


class DashboardOrderSerializer(serializers.ModelSerializer):

    customer = serializers.CharField(
        source="user.email"
    )

    class Meta:

        model = Order

        fields = (

            "order_number",

            "customer",

            "status",

            "total",

            "created_at",

        )

class LowStockSerializer(serializers.ModelSerializer):

    product = serializers.CharField(
        source="product.name"
    )

    color = serializers.CharField(
        source="color.name"
    )

    size = serializers.CharField(
        source="size.name"
    )

    class Meta:

        model = ProductVariant

        fields = (

            "sku",

            "product",

            "color",

            "size",

            "stock",

        )

class TopProductSerializer(serializers.ModelSerializer):

    product = serializers.CharField(
        source="product.name"
    )

    class Meta:

        model = OrderItem

        fields = (

            "product",

            "units_sold",

            "revenue",

        )

class DashboardCustomerSerializer(serializers.ModelSerializer):

    location = serializers.SerializerMethodField()

    class Meta:

        model = User

        fields = (

            "id",

            "first_name",

            "last_name",

            "email",

            "phone_number",

            "location",

            "date_joined",

        )

    def get_location(self, obj):

        # Prefer the customer's default address; fall back to
        # their most recently added one. Neither may exist yet
        # for a brand-new account.
        address = (
            obj.addresses.filter(is_default=True).first()
            or obj.addresses.order_by("-created_at").first()
        )

        if not address:
            return None

        parts = [
            part
            for part in (address.district, address.division)
            if part
        ]

        return ", ".join(parts) if parts else None