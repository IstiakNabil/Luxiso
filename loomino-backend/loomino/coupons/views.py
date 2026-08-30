from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import Coupon
from .serializers import ApplyCouponSerializer
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

from rest_framework.views import APIView

from .models import Coupon

from .serializers import (
    AdminCouponSerializer,
)

@extend_schema(
    tags=["Coupons"],
    summary="Apply Coupon",
    description="Apply a coupon code to the cart and calculate the discount.",
)
class ApplyCouponAPIView(APIView):

    def post(self, request):

        serializer = ApplyCouponSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        code = serializer.validated_data["code"]

        subtotal = serializer.validated_data["subtotal"]

        try:

            coupon = Coupon.objects.get(
                code__iexact=code,
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
                    "message": "Coupon has expired."
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

        return Response(
            {
                "coupon": coupon.code,
                "discount": discount,
                "subtotal": subtotal,
                "total": subtotal - discount,
            }
        )
    
# ============================================================
# ADMIN — Coupon List / Create
# ============================================================

class AdminCouponListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = AdminCouponSerializer

    permission_classes = [IsAdminUser]

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (
        "code",
        "description",
    )

    ordering_fields = (
        "code",
        "valid_from",
        "valid_until",
        "created_at",
        "discount_value",
    )

    ordering = (
        "-created_at",
    )

    queryset = Coupon.objects.all()


# ============================================================
# ADMIN — Coupon Retrieve / Update / Delete
# ============================================================

class AdminCouponRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AdminCouponSerializer

    permission_classes = [IsAdminUser]

    queryset = Coupon.objects.all()

    lookup_field = "pk"


# ============================================================
# ADMIN — Toggle Coupon Active / Inactive
# ============================================================

class AdminCouponToggleActiveAPIView(
    APIView
):

    permission_classes = [IsAdminUser]

    def post(
        self,
        request,
        pk,
    ):

        coupon = get_object_or_404(
    Coupon,
    pk=pk,
)

        coupon.is_active = not coupon.is_active

        coupon.save(
            update_fields=(
                "is_active",
                "updated_at",
            )
        )

        serializer = AdminCouponSerializer(
            coupon,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )