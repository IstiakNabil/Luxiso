from rest_framework import generics
from decimal import Decimal
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from orders.models import (
    Cart,
    CartItem,
    Order,
    OrderItem,
    Shipment,
    Address,
)
from orders.models import Payment
from orders.emails import send_order_confirmation_email
from products.models import ProductVariant
from django.shortcuts import get_object_or_404
from .serializers import (
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    CheckoutSerializer,
    OrderListSerializer,
OrderDetailSerializer,

)
from coupons.models import Coupon, CouponUsage
from sitesettings.models import SiteSetting
from django.utils import timezone
from django.db.models import Sum, F, DecimalField
from django.db.models.functions import Coalesce
from drf_spectacular.utils import extend_schema


from rest_framework import (
    generics,
    status,
)

from rest_framework.filters import (
    SearchFilter,
    OrderingFilter,
)

from rest_framework.permissions import (
    IsAdminUser,
)

from rest_framework.response import Response

from orders.models import Order

from .serializers import (
    AdminOrderListSerializer,
    AdminOrderDetailSerializer,
    AdminOrderUpdateSerializer,
)

@extend_schema(
    tags=["Cart"],
    summary="View Cart",
    description="Retrieve the authenticated user's shopping cart with totals.",
)
class CartAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        items = cart.items.select_related(
            "product_variant__product",
            "product_variant__color",
            "product_variant__size",
        ).prefetch_related(
            "product_variant__product__images",
        )

        serializer = CartItemSerializer(
            items,
            many=True,
	    context={"request": request},
        )

        total_items = items.aggregate(
            total=Coalesce(Sum("quantity"), 0)
        )["total"]

        total_price = sum(
            item.product_variant.selling_price * item.quantity
            for item in items
        )

        return Response(
            {
                "items": serializer.data,
                "total_items": total_items,
                "total_price": total_price,
            },
            status=status.HTTP_200_OK,
        )


from drf_spectacular.utils import extend_schema

@extend_schema(
    tags=["Orders"],
    summary="Add Item to Cart",
    description="Add a product variant to the authenticated user's cart.",
    request=AddToCartSerializer,
)
class AddToCartAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = AddToCartSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        cart_item = serializer.save(
            user=request.user
        )

        return Response(
            {
                "message": "Product added to cart.",
                "cart_item_id": cart_item.id,
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    tags=["Cart"],
    summary="Update Cart Item",
    description="Update the quantity of a product variant in the authenticated user's cart.",
)
class UpdateCartItemAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        cart_item = get_object_or_404(

            CartItem,

            id=pk,

            cart__user=request.user,

        )

        serializer = UpdateCartItemSerializer(

            data=request.data,

            context={
                "cart_item": cart_item
            }

        )

        serializer.is_valid(
            raise_exception=True
        )

        cart_item = serializer.save()

        return Response(
            {
                "message": "Cart updated successfully.",

                "quantity": cart_item.quantity,
            }
        )


@extend_schema(
    tags=["Cart"],
    summary="Remove Item from Cart",
    description="Remove a product variant from the authenticated user's cart.",
)
class RemoveCartItemAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        cart_item = get_object_or_404(

            CartItem,

            id=pk,

            cart__user=request.user,

        )

        cart_item.delete()

        return Response(
            {
                "message": "Item removed from cart."
            },
            status=status.HTTP_200_OK,
        )

@extend_schema(
    tags=["Cart"],
    summary="Clear Cart",
    description="Clear the authenticated user's cart.",
)
class ClearCartAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        deleted_count = cart.items.count()

        cart.items.all().delete()

        return Response(
            {
                "message": "Cart cleared successfully.",
                "items_removed": deleted_count,
            },
            status=status.HTTP_200_OK,
        )

@extend_schema(
    tags=["Cart"],
    summary="Checkout",
    description="Place an order for the authenticated user's cart.",
)
class CheckoutAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = CheckoutSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        cart = Cart.objects.prefetch_related(
            "items__product_variant__product",
            "items__product_variant__color",
            "items__product_variant__size",
        ).filter(
            user=request.user
        ).first()

        if not cart or not cart.items.exists():
            return Response(
                {
                    "message": "Your cart is empty."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            address = Address.objects.get(
                id=serializer.validated_data["address_id"],
                user=request.user,
            )

        except Address.DoesNotExist:

            return Response(
                {
                    "message": "Shipping address not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        subtotal = Decimal("0.00")

        for item in cart.items.all():

            if item.quantity > item.product_variant.stock:
                return Response(
                    {
                        "message": f"{item.product_variant.product.name} has insufficient stock."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            subtotal += (
                    item.product_variant.selling_price * item.quantity
            )

        shipping_cost = SiteSetting.load().delivery_charge

        discount = Decimal("0.00")

        coupon = None

        coupon_code = serializer.validated_data.get(
            "coupon_code"
        )

        if coupon_code:

            try:

                coupon = Coupon.objects.get(

                    code__iexact=coupon_code,

                    is_active=True,

                )

            except Coupon.DoesNotExist:

                return Response(
                    {
                        "message": "Invalid coupon."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            now = timezone.now()

            if now < coupon.valid_from or now > coupon.valid_until:
                return Response(
                    {
                        "message": "Coupon expired."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if subtotal < coupon.minimum_order_amount:
                return Response(
                    {
                        "message": "Minimum order amount not reached."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if coupon.used_count >= coupon.usage_limit:
                return Response(
                    {
                        "message": "Coupon usage limit reached."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if coupon.discount_type == "percentage":

                discount = (
                                   subtotal * coupon.discount_value
                           ) / Decimal("100")

                if coupon.maximum_discount_amount:
                    discount = min(
                        discount,
                        coupon.maximum_discount_amount,
                    )

            else:

                discount = coupon.discount_value

        total = subtotal + shipping_cost - discount

        with transaction.atomic():

            order = Order.objects.create(
                user=request.user,
                shipping_address=address,
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                discount=discount,
                total=total,
            )

            if coupon:
                CouponUsage.objects.create(

                    coupon=coupon,

                    user=request.user,

                    order=order,

                    discount_amount=discount,

                )

                coupon.used_count += 1

                coupon.save()

            for item in cart.items.all():

                variant = ProductVariant.objects.select_for_update().get(
                    id=item.product_variant.id
                )

                if variant.stock < item.quantity:
                    raise serializers.ValidationError(
                        {
                            "message": f"{variant.product.name} is out of stock."
                        }
                    )

                OrderItem.objects.create(
                    order=order,
                    product_variant=variant,
                    quantity=item.quantity,
                    price=variant.selling_price,
                    subtotal=variant.selling_price * item.quantity,
                )

                variant.stock -= item.quantity
                variant.save()

            Shipment.objects.create(
                order=order
            )

            Payment.objects.create(

                order=order,

                payment_method=serializer.validated_data[
                    "payment_method"
                ],

                amount=total,

            )

            cart.items.all().delete()

        # Sent after the transaction commits — if anything above
        # had failed and rolled back, we don't want a
        # confirmation email for an order that doesn't exist.
        # Guarded so an SMTP hiccup can't turn an already-
        # successful order into an error response.
        try:
            send_order_confirmation_email(order)
        except Exception:
            pass

        return Response(
            {
                "message": "Order created successfully.",
                "order_number": order.order_number,
                "order_id": order.id,
                "subtotal": subtotal,
                "total": total,
            },
            status=status.HTTP_201_CREATED,
        )

@extend_schema(
    tags=["Orders"],
    summary="View Orders",
    description="Retrieve the authenticated user's orders.",
)
class OrderListAPIView(generics.ListAPIView):

    serializer_class = OrderListSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return (
            Order.objects.filter(
                user=self.request.user
            )
            .order_by("-created_at")
        )

@extend_schema(
    tags=["Orders"],
    summary="View Order Details",
    description="Retrieve details of a specific order.",
)
class OrderDetailAPIView(generics.RetrieveAPIView):

    serializer_class = OrderDetailSerializer

    permission_classes = [IsAuthenticated]

    lookup_field = "order_number"

    def get_queryset(self):

        return (
            Order.objects.filter(
                user=self.request.user
            )
            .prefetch_related(
                "items"
            )
            .select_related(
                "shipment",
                "shipping_address",
            )
        )

@extend_schema(
    tags=["Orders"],
    summary="Cancel Order",
    description="Cancel an order for the authenticated user.",
)
class CancelOrderAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, order_number):

        order = get_object_or_404(

            Order,

            order_number=order_number,

            user=request.user,

        )

        if order.status not in ["pending", "confirmed"]:

            return Response(
                {
                    "message": "This order cannot be cancelled."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            for item in order.items.all():

                variant = ProductVariant.objects.select_for_update().get(
                    id=item.product_variant.id
                )

                variant.stock += item.quantity

                variant.save()

            order.status = "cancelled"

            order.save()

        return Response(
            {
                "message": "Order cancelled successfully."
            },
            status=status.HTTP_200_OK,
        )
    
# ============================================================
# ADMIN — Order List
# ============================================================

class AdminOrderListAPIView(
    generics.ListAPIView
):

    serializer_class = AdminOrderListSerializer

    permission_classes = [IsAdminUser]

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (
        "order_number",
    )

    ordering_fields = (
        "created_at",
        "total",
        "status",
    )

    ordering = (
        "-created_at",
    )

    def get_queryset(self):

        return (
            Order.objects.all()
            .select_related(
                "user",
                "shipping_address",
                "payment",
                "shipment",
            )
        )


# ============================================================
# ADMIN — Order Detail / Update
# ============================================================

class AdminOrderDetailUpdateAPIView(
    generics.RetrieveUpdateAPIView
):

    permission_classes = [IsAdminUser]

    lookup_field = "order_number"

    lookup_url_kwarg = "order_number"

    def get_queryset(self):

        return (
            Order.objects.all()
            .select_related(
                "user",
                "shipping_address",
                "payment",
                "shipment",
            )
            .prefetch_related(
                "items__product_variant__product__images",
            )
        )

    def get_serializer_class(self):

        if self.request.method in (
            "PUT",
            "PATCH",
        ):

            return AdminOrderUpdateSerializer

        return AdminOrderDetailSerializer

    def update(
        self,
        request,
        *args,
        **kwargs,
    ):

        partial = kwargs.pop(
            "partial",
            False,
        )

        order = self.get_object()

        write_serializer = (
            AdminOrderUpdateSerializer(
                order,
                data=request.data,
                partial=partial,
                context=self.get_serializer_context(),
            )
        )

        write_serializer.is_valid(
            raise_exception=True
        )

        order = write_serializer.save()

        # Reload relationships after update.
        order = self.get_queryset().get(
            pk=order.pk
        )

        read_serializer = (
            AdminOrderDetailSerializer(
                order,
                context=self.get_serializer_context(),
            )
        )

        return Response(
            read_serializer.data,
            status=status.HTTP_200_OK,
        )
