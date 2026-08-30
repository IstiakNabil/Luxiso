from django.contrib import admin

from .models import Cart, CartItem, Order, OrderItem, Payment, Shipment


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "user__email",
    )


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):

    list_display = (
        "cart",
        "product_variant",
        "quantity",
    )

    search_fields = (
        "cart__user__email",
    )

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):

    list_display = (
        "order_number",
        "user",
        "status",
        "total",
        "created_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "order_number",
        "user__email",
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "product_name",
        "quantity",
        "price",
        "subtotal",
    )

    search_fields = (
        "order__order_number",
        "product_name",
        "sku",
    )

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "payment_method",
        "amount",
        "status",
    )

    list_filter = (
        "payment_method",
        "status",
    )

    search_fields = (
        "order__order_number",
        "transaction_id",
    )

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):

    list_display = (
        "order",
        "courier_name",
        "tracking_number",
        "status",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "order__order_number",
        "tracking_number",
    )