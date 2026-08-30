from django.db.models import Sum
from django.utils import timezone
from rest_framework import generics
from .serializers import DashboardOrderSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .serializers import (
    DashboardOrderSerializer,
    LowStockSerializer,
)
from drf_spectacular.utils import extend_schema
from accounts.models import User
from products.models import ProductVariant
from products.models import Product
from orders.models import Order
from django.db.models import Sum, F, DecimalField
from orders.models import OrderItem
from django.db.models.functions import TruncMonth
from django.db.models import Count
from .serializers import (
    DashboardOrderSerializer,
    LowStockSerializer,
    DashboardCustomerSerializer,
)


@extend_schema(
    tags=["Dashboard"],
    summary="Dashboard Stats",
    description="Get dashboard statistics.",
)
class DashboardStatsAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        total_sales = (
            Order.objects.filter(
                status="delivered"
            ).aggregate(
                total=Sum("total")
            )["total"] or 0
        )

        todays_orders = Order.objects.filter(
            created_at__date=timezone.localdate(),
        ).exclude(
            status="cancelled",
        )

        today_sales = (
            todays_orders.aggregate(
                total=Sum("total")
            )["total"] or 0
        )

        return Response({

            "total_users": User.objects.count(),

            "total_products": Product.objects.count(),

            "total_orders": Order.objects.count(),

            "pending_orders": Order.objects.filter(
                status="pending"
            ).count(),

            "completed_orders": Order.objects.filter(
                status="delivered"
            ).count(),

            "total_sales": total_sales,

            "today_sales": today_sales,

            "today_orders": todays_orders.count(),

        })

@extend_schema(
    tags=["Dashboard"],
    summary="Dashboard Orders",
    description="Get dashboard orders.",
)
class DashboardOrderListAPIView(generics.ListAPIView):

    serializer_class = DashboardOrderSerializer

    permission_classes = [IsAdminUser]

    queryset = Order.objects.select_related(
        "user"
    ).order_by(
        "-created_at"
    )

@extend_schema(
    tags=["Dashboard"],
    summary="Low Stock Products",
    description="Get low stock products.",
)
class LowStockAPIView(generics.ListAPIView):

    serializer_class = LowStockSerializer

    permission_classes = [IsAdminUser]

    queryset = ProductVariant.objects.filter(

        stock__lte=10,

        is_active=True,

    ).select_related(

        "product",

        "color",

        "size",

    ).order_by(

        "stock",

    )

@extend_schema(
    tags=["Dashboard"],
    summary="Top Products",
    description="Get top products.",
)
class TopProductsAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        products = (

            OrderItem.objects

            .values(
                product=F("product_variant__product__name")
            )

            .annotate(

                units_sold=Sum("quantity"),

                revenue=Sum("subtotal"),

            )

            .order_by("-units_sold")[:10]

        )

        return Response(products)

@extend_schema(
    tags=["Dashboard"],
    summary="Monthly Sales",
    description="Get monthly sales.",
)
class MonthlySalesAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        sales = (

            Order.objects.filter(
                status="delivered"
            )

            .annotate(
                month=TruncMonth("created_at")
            )

            .values("month")

            .annotate(

                orders=Count("id"),

                sales=Sum("total"),

            )

            .order_by("month")

        )

        return Response(sales)

@extend_schema(
    tags=["Dashboard"],
    summary="Dashboard Customers",
    description="Get dashboard customers.",
)
class DashboardCustomerListAPIView(generics.ListAPIView):

    serializer_class = DashboardCustomerSerializer

    permission_classes = [IsAdminUser]

    queryset = User.objects.order_by(
        "-date_joined"
    ).prefetch_related(
        "addresses"
    )[:20]

@extend_schema(
    tags=["Dashboard"],
    summary="Order Status Summary",
    description="Get order status summary.",
)
class OrderStatusSummaryAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):

        summary = {}

        for status, _ in Order.STATUS_CHOICES:

            summary[status] = Order.objects.filter(
                status=status
            ).count()

        return Response(summary)