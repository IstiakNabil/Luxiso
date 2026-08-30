from rest_framework import serializers
from products.models import ProductVariant
from orders.models import (Cart,
                           CartItem, Order,
OrderItem,
                           )

from rest_framework import serializers

from orders.models import (
    Order,
    OrderItem,
    Payment,
    Shipment,
)
from orders.emails import send_order_delivered_email
class CartItemSerializer(serializers.ModelSerializer):

    product = serializers.CharField(
        source="product_variant.product.name"
    )

    slug = serializers.CharField(
        source="product_variant.product.slug"
    )

    color = serializers.CharField(
        source="product_variant.color.name"
    )

    size = serializers.CharField(
        source="product_variant.size.name"
    )

    image = serializers.SerializerMethodField()

    price = serializers.SerializerMethodField()

    subtotal = serializers.SerializerMethodField()

    class Meta:

        model = CartItem

        fields = (

            "id",

            "product",

            "slug",

            "image",

            "color",

            "size",

            "price",

            "quantity",

            "subtotal",

        )

    def get_image(self, obj):

        image = obj.product_variant.product.images.first()

        if image:

            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(image.image.url)

            return image.image.url

        return None

    def get_price(self, obj):

        return obj.product_variant.selling_price

    def get_subtotal(self, obj):

        return obj.product_variant.selling_price * obj.quantity

class CartSerializer(serializers.Serializer):

    items = CartItemSerializer(
        many=True
    )

    total_items = serializers.IntegerField()

    total_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

class AddToCartSerializer(serializers.Serializer):

    product_variant_id = serializers.IntegerField()

    quantity = serializers.IntegerField(
        min_value=1
    )

    def validate(self, attrs):

        try:
            variant = ProductVariant.objects.get(
                id=attrs["product_variant_id"],
                is_active=True,
            )

        except ProductVariant.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "product_variant_id": "Product variant not found."
                }
            )

        if variant.stock < attrs["quantity"]:

            raise serializers.ValidationError(
                {
                    "quantity": "Insufficient stock."
                }
            )

        attrs["variant"] = variant

        return attrs

    def save(self, user):

        cart, created = Cart.objects.get_or_create(
            user=user
        )

        variant = self.validated_data["variant"]

        quantity = self.validated_data["quantity"]

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product_variant=variant,
            defaults={
                "quantity": quantity
            }
        )

        if not created:

            new_quantity = cart_item.quantity + quantity

            if new_quantity > variant.stock:

                raise serializers.ValidationError(
                    {
                        "quantity": "Insufficient stock."
                    }
                )

            cart_item.quantity = new_quantity

            cart_item.save()

        return cart_item

class UpdateCartItemSerializer(serializers.Serializer):

    quantity = serializers.IntegerField(
        min_value=1
    )

    def validate(self, attrs):

        cart_item = self.context["cart_item"]

        if attrs["quantity"] > cart_item.product_variant.stock:

            raise serializers.ValidationError(
                {
                    "quantity": "Insufficient stock."
                }
            )

        return attrs

    def save(self):

        cart_item = self.context["cart_item"]

        cart_item.quantity = self.validated_data["quantity"]

        cart_item.save()

        return cart_item

class CheckoutSerializer(serializers.Serializer):

    address_id = serializers.IntegerField()

    payment_method = serializers.ChoiceField(
        choices=[
            "cod",
            "sslcommerz",
        ]
    )

    coupon_code = serializers.CharField(
        required=False,
        allow_blank=True,
    )

class OrderListSerializer(serializers.ModelSerializer):

    class Meta:

        model = Order

        fields = (

            "order_number",

            "status",

            "subtotal",

            "shipping_cost",

            "discount",

            "total",

            "created_at",

        )

class OrderItemSerializer(serializers.ModelSerializer):

    class Meta:

        model = OrderItem

        fields = (

            "product_name",

            "sku",

            "color",

            "size",

            "price",

            "quantity",

            "subtotal",

        )

class OrderDetailSerializer(serializers.ModelSerializer):

    items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    shipment_status = serializers.CharField(
        source="shipment.status",
        read_only=True,
    )

    tracking_number = serializers.CharField(
        source="shipment.tracking_number",
        read_only=True,
    )

    class Meta:

        model = Order

        fields = (

            "order_number",

            "status",

            "shipping_address",

            "subtotal",

            "shipping_cost",

            "discount",

            "total",

            "created_at",

            "shipment_status",

            "tracking_number",

            "items",

        )

# ============================================================
# ADMIN — Order Customer
# ============================================================

class AdminOrderCustomerSerializer(serializers.Serializer):

    name = serializers.SerializerMethodField()

    email = serializers.EmailField(
        read_only=True
    )

    phone = serializers.SerializerMethodField()

    def get_name(self, obj):

        full_name = (
            f"{obj.first_name} {obj.last_name}"
        ).strip()

        if full_name:
            return full_name

        return obj.email

    def get_phone(self, obj):

        return getattr(
            obj,
            "phone_number",
            None,
        )


# ============================================================
# ADMIN — Order Product
# ============================================================

class AdminOrderItemProductSerializer(
    serializers.Serializer
):

    id = serializers.IntegerField(
        read_only=True
    )

    name = serializers.CharField(
        read_only=True
    )

    slug = serializers.CharField(
        read_only=True
    )

    thumbnail = serializers.SerializerMethodField()

    def get_thumbnail(self, obj):

        image = obj.images.order_by(
            "display_order",
            "id",
        ).first()

        if not image:
            return None

        request = self.context.get(
            "request"
        )

        if request:
            return request.build_absolute_uri(
                image.image.url
            )

        return image.image.url


# ============================================================
# ADMIN — Order Item
# ============================================================

class AdminOrderItemSerializer(
    serializers.ModelSerializer
):

    product = serializers.SerializerMethodField()

    variant_id = serializers.IntegerField(
        source="product_variant.id",
        read_only=True,
    )

    class Meta:

        model = OrderItem

        fields = (

            "id",

            "variant_id",

            "product",

            "product_name",

            "sku",

            "color",

            "size",

            "price",

            "quantity",

            "subtotal",

        )

    def get_product(self, obj):

        product = obj.product_variant.product

        serializer = AdminOrderItemProductSerializer(
            product,
            context=self.context,
        )

        return serializer.data


# ============================================================
# ADMIN — Shipping Address
# ============================================================

class AdminOrderAddressSerializer(
    serializers.Serializer
):

    id = serializers.IntegerField(
        read_only=True
    )

    full_name = serializers.SerializerMethodField()

    phone = serializers.SerializerMethodField()

    address_line_1 = serializers.SerializerMethodField()

    address_line_2 = serializers.SerializerMethodField()

    city = serializers.SerializerMethodField()

    state = serializers.SerializerMethodField()

    postal_code = serializers.SerializerMethodField()

    country = serializers.SerializerMethodField()

    def get_full_name(self, obj):

        first_name = getattr(
            obj,
            "first_name",
            "",
        )

        last_name = getattr(
            obj,
            "last_name",
            "",
        )

        full_name = (
            f"{first_name} {last_name}"
        ).strip()

        if full_name:
            return full_name

        return getattr(
            obj,
            "full_name",
            "",
        )

    def get_phone(self, obj):

        return getattr(
            obj,
            "phone",
            getattr(
                obj,
                "phone_number",
                None,
            ),
        )

    def get_address_line_1(self, obj):

        return getattr(
            obj,
            "address_line_1",
            getattr(
                obj,
                "address",
                "",
            ),
        )

    def get_address_line_2(self, obj):

        return getattr(
            obj,
            "address_line_2",
            "",
        )

    def get_city(self, obj):

        return getattr(
            obj,
            "city",
            "",
        )

    def get_state(self, obj):

        return getattr(
            obj,
            "state",
            "",
        )

    def get_postal_code(self, obj):

        return getattr(
            obj,
            "postal_code",
            "",
        )

    def get_country(self, obj):

        return getattr(
            obj,
            "country",
            "",
        )


# ============================================================
# ADMIN — Payment
# ============================================================

class AdminOrderPaymentSerializer(
    serializers.ModelSerializer
):

    payment_status = serializers.CharField(
        source="status",
        read_only=True,
    )

    class Meta:

        model = Payment

        fields = (

            "payment_method",

            "payment_status",

            "transaction_id",

            "amount",

            "paid_at",

        )


# ============================================================
# ADMIN — Shipment / Courier
# ============================================================

class AdminOrderShipmentSerializer(
    serializers.ModelSerializer
):

    courier_status = serializers.CharField(
        source="status",
        read_only=True,
    )

    class Meta:

        model = Shipment

        fields = (

            "courier_name",

            "tracking_number",

            "courier_status",

            "shipped_at",

            "delivered_at",

            "notes",

        )


# ============================================================
# ADMIN — Order List
# ============================================================

class AdminOrderListSerializer(
    serializers.ModelSerializer
):

    customer = AdminOrderCustomerSerializer(
        source="user",
        read_only=True,
    )

    payment_method = serializers.SerializerMethodField()

    payment_status = serializers.SerializerMethodField()

    courier_status = serializers.SerializerMethodField()

    placed_date = serializers.DateTimeField(
        source="created_at",
        read_only=True,
    )

    order_status = serializers.CharField(
        source="status",
        read_only=True,
    )

    class Meta:

        model = Order

        fields = (

            "order_number",

            "customer",

            "total",

            "payment_method",

            "payment_status",

            "order_status",

            "cancel_refund_status",

            "courier_status",

            "placed_date",

        )

    def get_payment_method(self, obj):

        try:
            return obj.payment.payment_method

        except Payment.DoesNotExist:
            return None

    def get_payment_status(self, obj):

        try:
            return obj.payment.status

        except Payment.DoesNotExist:
            return None

    def get_courier_status(self, obj):

        try:
            return obj.shipment.status

        except Shipment.DoesNotExist:
            return None


# ============================================================
# ADMIN — Order Detail
# ============================================================

class AdminOrderDetailSerializer(
    serializers.ModelSerializer
):

    customer = AdminOrderCustomerSerializer(
        source="user",
        read_only=True,
    )

    shipping_address = AdminOrderAddressSerializer(
        read_only=True
    )

    items = AdminOrderItemSerializer(
        many=True,
        read_only=True,
    )

    payment = serializers.SerializerMethodField()

    shipment = serializers.SerializerMethodField()

    order_status = serializers.CharField(
        source="status",
        read_only=True,
    )

    placed_date = serializers.DateTimeField(
        source="created_at",
        read_only=True,
    )

    class Meta:

        model = Order

        fields = (

            "order_number",

            "customer",

            "order_status",

            "cancel_refund_status",

            "shipping_address",

            "items",

            "subtotal",

            "shipping_cost",

            "discount",

            "total",

            "payment",

            "shipment",

            "placed_date",

            "updated_at",

        )

    def get_payment(self, obj):

        try:

            serializer = AdminOrderPaymentSerializer(
                obj.payment,
                context=self.context,
            )

            return serializer.data

        except Payment.DoesNotExist:

            return None

    def get_shipment(self, obj):

        try:

            serializer = AdminOrderShipmentSerializer(
                obj.shipment,
                context=self.context,
            )

            return serializer.data

        except Shipment.DoesNotExist:

            return None


# ============================================================
# ADMIN — Order Update
# ============================================================

class AdminOrderUpdateSerializer(
    serializers.Serializer
):

    order_status = serializers.ChoiceField(
        choices=Order.STATUS_CHOICES,
        required=False,
    )

    cancel_refund_status = serializers.ChoiceField(
        choices=Order.REQUEST_STATUS_CHOICES,
        required=False,
    )

    courier_status = serializers.ChoiceField(
        choices=Shipment.SHIPPING_STATUS,
        required=False,
    )

    courier_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )

    tracking_number = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=100,
    )

    def update(
        self,
        instance,
        validated_data,
    ):

        order_status = validated_data.pop(
            "order_status",
            None,
        )

        courier_status = validated_data.pop(
            "courier_status",
            None,
        )

        courier_name = validated_data.pop(
            "courier_name",
            None,
        )

        tracking_number = validated_data.pop(
            "tracking_number",
            None,
        )

        cancel_refund_status = (
            validated_data.pop(
                "cancel_refund_status",
                None,
            )
        )

        order_fields_to_update = []

        if order_status is not None:

            previous_status = instance.status

            instance.status = order_status

            order_fields_to_update.append(
                "status"
            )

        if cancel_refund_status is not None:

            instance.cancel_refund_status = (
                cancel_refund_status
            )

            order_fields_to_update.append(
                "cancel_refund_status"
            )

        if order_fields_to_update:

            instance.save(
                update_fields=order_fields_to_update
            )

            if (
                order_status == "delivered"
                and previous_status != "delivered"
            ):
                # Guarded so an SMTP hiccup doesn't turn an
                # otherwise-successful status update into a
                # 500 for the admin.
                try:
                    send_order_delivered_email(instance)
                except Exception:
                    pass

        if any(
            value is not None
            for value in (
                courier_status,
                courier_name,
                tracking_number,
            )
        ):

            shipment, created = (
                Shipment.objects.get_or_create(
                    order=instance
                )
            )

            shipment_fields_to_update = []

            if courier_status is not None:

                shipment.status = courier_status

                shipment_fields_to_update.append(
                    "status"
                )

            if courier_name is not None:

                shipment.courier_name = courier_name

                shipment_fields_to_update.append(
                    "courier_name"
                )

            if tracking_number is not None:

                shipment.tracking_number = (
                    tracking_number
                )

                shipment_fields_to_update.append(
                    "tracking_number"
                )

            if shipment_fields_to_update:

                shipment.save(
                    update_fields=(
                        shipment_fields_to_update
                    )
                )

        return instance

    def create(
        self,
        validated_data,
    ):

        raise NotImplementedError(
            "This serializer only updates existing orders."
        )
