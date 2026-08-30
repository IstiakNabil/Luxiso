from datetime import timedelta

from django.db.models import Q, Sum, Count, Value, DecimalField
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import ProductVariant as OnlineProductVariant
from orders.models import Order as OnlineOrder, Payment as OnlinePayment

from ..pagination import POSResultsPagination
from ..permissions import CanViewReports
from ..serializers.online_reports import OnlineProductStockSerializer, OnlineSaleListSerializer

DECIMAL_ZERO = DecimalField(max_digits=12, decimal_places=2)

# Every online order status except these counts as a completed sale
# for reporting purposes -- cancelled orders never became real revenue.
SOLD_EXCLUDED_STATUSES = ["cancelled"]


class OnlineProductStockListView(ListAPIView):
    """
    GET /api/pos/online/products/

    Read-only mirror of the online storefront's product/variant stock
    -- this is a SEPARATE stock pool from the POS's own products, by
    design (see the earlier scoping conversation). Nothing here writes
    back to products.ProductVariant.
    """

    permission_classes = [IsAuthenticated, CanViewReports]
    serializer_class = OnlineProductStockSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = OnlineProductVariant.objects.select_related(
            "product", "product__category", "color", "size"
        )
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(product__name__icontains=search) | Q(sku__icontains=search))
        if self.request.query_params.get("out_of_stock") == "true":
            qs = qs.filter(stock=0)
        if self.request.query_params.get("category"):
            qs = qs.filter(product__category_id=self.request.query_params["category"])
        return qs.order_by("product__name", "color__name", "size__display_order")


class OnlineSalesListView(ListAPIView):
    """GET /api/pos/online/sales/ -- read-only list of website orders."""

    permission_classes = [IsAuthenticated, CanViewReports]
    serializer_class = OnlineSaleListSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = OnlineOrder.objects.select_related("user", "payment").prefetch_related("items")

        params = self.request.query_params
        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(order_number__icontains=search)

        status = params.get("status")
        if status:
            qs = qs.filter(status=status)

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        return qs.order_by("-created_at")


class OnlineSummaryView(APIView):
    """
    GET /api/pos/online/summary/

    Stock, sales (today/week/month), and payment-method totals for the
    online store, kept entirely separate from the POS's own dashboard
    numbers -- these are two different stock pools and two different
    revenue streams, shown side by side rather than merged.
    """

    permission_classes = [IsAuthenticated, CanViewReports]

    def get(self, request):
        today = timezone.localdate()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)

        sold_orders = OnlineOrder.objects.exclude(status__in=SOLD_EXCLUDED_STATUSES)

        def total_since(since_date):
            return sold_orders.filter(created_at__date__gte=since_date).aggregate(
                total=Coalesce(Sum("total"), Value(0), output_field=DECIMAL_ZERO),
                count=Count("id"),
            )

        today_stats = total_since(today)
        week_stats = total_since(week_start)
        month_stats = total_since(month_start)

        stock_stats = OnlineProductVariant.objects.aggregate(
            total_stock=Coalesce(Sum("stock"), Value(0)),
            out_of_stock_count=Count("id", filter=Q(stock=0)),
        )
        active_product_count = OnlineProductVariant.objects.filter(
            is_active=True, product__is_active=True
        ).values("product_id").distinct().count()

        # Payment breakdown -- only the two methods that actually exist
        # today (COD / SSL Gateway); per-channel bKash/Nagad/Card
        # breakdown is deferred until that data is captured at checkout.
        payment_rows = (
            OnlinePayment.objects.values("payment_method")
            .annotate(
                paid_total=Coalesce(
                    Sum("amount", filter=Q(status="paid")), Value(0), output_field=DECIMAL_ZERO
                ),
                pending_total=Coalesce(
                    Sum("amount", filter=Q(status="pending")), Value(0), output_field=DECIMAL_ZERO
                ),
                paid_count=Count("id", filter=Q(status="paid")),
            )
        )
        method_labels = dict(OnlinePayment.PAYMENT_METHODS)
        payment_breakdown = [
            {
                "method": row["payment_method"],
                "method_display": method_labels.get(row["payment_method"], row["payment_method"]),
                "paid_total": row["paid_total"],
                "pending_total": row["pending_total"],
                "paid_count": row["paid_count"],
            }
            for row in payment_rows
        ]

        returned_or_cancelled = OnlineOrder.objects.filter(
            cancel_refund_status="approved"
        ).count()

        return Response(
            {
                "stock": {
                    "total_units": stock_stats["total_stock"],
                    "active_products": active_product_count,
                    "out_of_stock_variants": stock_stats["out_of_stock_count"],
                },
                "sales": {
                    "today": {"total": today_stats["total"], "orders": today_stats["count"]},
                    "this_week": {"total": week_stats["total"], "orders": week_stats["count"]},
                    "this_month": {"total": month_stats["total"], "orders": month_stats["count"]},
                },
                "payment_breakdown": payment_breakdown,
                "returned_or_cancelled_orders": returned_or_cancelled,
            }
        )
