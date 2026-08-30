from django.db import models
from django.conf import settings
from django.utils import timezone
from products.models import ProductVariant
from decimal import Decimal
from accounts.models import Address

class Cart(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.email}'s Cart"


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        related_name="cart_items"
    )

    quantity = models.PositiveIntegerField(
        default=1
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "product_variant"],
                name="unique_cart_variant",
            )
        ]

    def __str__(self):
        return f"{self.product_variant} ({self.quantity})"

class Order(models.Model):
    ORDER_PREFIX = "LMN"
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
    
    )

    REQUEST_STATUS_CHOICES = (
    ("none", "None"),
    ("cancel_requested", "Cancel Requested"),
    ("refund_requested", "Refund Requested"),
    ("approved", "Approved"),
    ("rejected", "Rejected"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="orders"
    )

    order_number = models.CharField(
        max_length=30,
        unique=True,
        editable=False
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    cancel_refund_status = models.CharField(
    max_length=30,
    choices=REQUEST_STATUS_CHOICES,
    default="none",
    )

    shipping_address = models.ForeignKey(
        Address,
        on_delete=models.PROTECT,
        related_name="orders",
        null=True,
        blank=True,
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    shipping_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.order_number

    def save(self, *args, **kwargs):
        if not self.order_number:
            today = timezone.now().strftime("%Y%m%d")

            last_order = Order.objects.order_by("-id").first()

            if last_order:
                next_number = last_order.id + 1
            else:
                next_number = 1

            self.order_number = (
                f"{self.ORDER_PREFIX}-{today}-{next_number:06d}"
            )

        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="items"
    )

    product_variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.PROTECT,
        related_name="order_items"
    )

    product_name = models.CharField(
        max_length=255
    )

    sku = models.CharField(
        max_length=100
    )

    color = models.CharField(
        max_length=100
    )

    size = models.CharField(
        max_length=100
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    quantity = models.PositiveIntegerField()

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def save(self, *args, **kwargs):
        self.product_name = self.product_variant.product.name
        self.sku = self.product_variant.sku
        self.color = self.product_variant.color.name
        self.size = self.product_variant.size.name

        if not self.price:
            self.price = self.product_variant.selling_price

        self.subtotal = self.price * self.quantity

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} x {self.quantity}"



class Payment(models.Model):
    PAYMENT_METHODS = (
        ("cod", "Cash on Delivery"),
        ("sslcommerz", "SSL Gateway"),
    )

    PAYMENT_STATUS = (
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment"
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS
    )

    transaction_id = models.CharField(
        max_length=255,
        blank=True
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default="pending"
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.order.order_number} - {self.payment_method}"

class Shipment(models.Model):
    SHIPPING_STATUS = (
        ("pending", "Pending"),
        ("packed", "Packed"),
        ("shipped", "Shipped"),
        ("out_for_delivery", "Out For Delivery"),
        ("delivered", "Delivered"),
        ("returned", "Returned"),
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="shipment"
    )

    courier_name = models.CharField(
        max_length=100,
        blank=True
    )

    tracking_number = models.CharField(
        max_length=100,
        blank=True
    )

    status = models.CharField(
        max_length=30,
        choices=SHIPPING_STATUS,
        default="pending"
    )

    shipped_at = models.DateTimeField(
        null=True,
        blank=True
    )

    delivered_at = models.DateTimeField(
        null=True,
        blank=True
    )

    notes = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.order.order_number} - {self.status}"