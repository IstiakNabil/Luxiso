import calendar
from datetime import date, datetime, timedelta

from django.db.models import Sum, F, DecimalField, Value
from django.db.models.functions import Coalesce, ExtractYear, ExtractMonth, ExtractDay
from django.utils import timezone
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    Business,
    Location,
    Sale,
    SaleReturn,
    Purchase,
    PurchaseReturn,
    Expense,
    StockLevel,
    Batch,
    PaymentStatus,
    SaleStatus,
)
from ..pagination import POSResultsPagination
from ..permissions import IsPOSStaff
from ..serializers.dashboard import (
    SalesPaymentDueSerializer,
    PurchasePaymentDueSerializer,
    ProductStockAlertSerializer,
    StockExpiryAlertSerializer,
    SalesOrderListSerializer,
)

DECIMAL_ZERO = DecimalField(max_digits=12, decimal_places=2)


def _apply_common_filters(queryset, request, date_field, location_field="location_id"):
    """
    Shared ?location=&date_from=&date_to= filtering used by every
    dashboard endpoint. All three are optional; with none given the
    endpoint covers all locations / all time.

    date_to uses "< next day midnight" rather than "<= date_to" -- the
    fields this filters span both DateField (Expense, PurchaseReturn)
    and DateTimeField (Sale, Purchase, SaleReturn) columns, and a
    plain __lte against a date string would silently exclude same-day
    entries that happened after midnight on a DateTimeField column.
    """
    location_id = request.query_params.get("location")
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")

    if location_id:
        queryset = queryset.filter(**{location_field: location_id})
    if date_from:
        queryset = queryset.filter(**{f"{date_field}__gte": date_from})
    if date_to:
        try:
            exclusive_end = datetime.strptime(date_to, "%Y-%m-%d").date() + timedelta(days=1)
            queryset = queryset.filter(**{f"{date_field}__lt": exclusive_end})
        except ValueError:
            queryset = queryset.filter(**{f"{date_field}__lte": date_to})

    return queryset


class DashboardSummaryView(APIView):
    """
    GET /api/pos/dashboard/summary/?location=&date_from=&date_to=

    Returns the seven stat cards plus the two charts from the
    reference Home page. Location and date filters are optional.
    """

    permission_classes = [IsAuthenticated, IsPOSStaff]

    def get(self, request):
        business = Business.get_solo()

        sales = _apply_common_filters(
            Sale.objects.exclude(status=SaleStatus.DRAFT), request, "sale_date"
        )
        purchases = _apply_common_filters(Purchase.objects, request, "purchase_date")
        sale_returns = _apply_common_filters(SaleReturn.objects, request, "return_date")
        purchase_returns = _apply_common_filters(
            PurchaseReturn.objects, request, "return_date"
        )
        expenses = _apply_common_filters(Expense.objects, request, "expense_date")

        total_sales = sales.aggregate(v=Coalesce(Sum("total"), Value(0), output_field=DECIMAL_ZERO))["v"]
        total_purchase = purchases.aggregate(
            v=Coalesce(Sum("total"), Value(0), output_field=DECIMAL_ZERO)
        )["v"]
        total_sell_return = sale_returns.aggregate(
            v=Coalesce(Sum("total"), Value(0), output_field=DECIMAL_ZERO)
        )["v"]
        total_purchase_return = purchase_returns.aggregate(
            v=Coalesce(Sum("total"), Value(0), output_field=DECIMAL_ZERO)
        )["v"]
        total_expense = expenses.aggregate(
            v=Coalesce(Sum("amount"), Value(0), output_field=DECIMAL_ZERO)
        )["v"]

        invoice_due = sales.exclude(payment_status=PaymentStatus.PAID).aggregate(
            v=Coalesce(Sum(F("total") - F("paid_amount")), Value(0), output_field=DECIMAL_ZERO)
        )["v"]
        purchase_due = purchases.exclude(payment_status=PaymentStatus.PAID).aggregate(
            v=Coalesce(Sum(F("total") - F("paid_amount")), Value(0), output_field=DECIMAL_ZERO)
        )["v"]

        data = {
            "currency_symbol": business.currency_symbol,
            "total_purchase": total_purchase,
            "total_sales": total_sales,
            "purchase_due": purchase_due,
            "invoice_due": invoice_due,
            "total_purchase_return": total_purchase_return,
            "total_sell_return": total_sell_return,
            "expense": total_expense,
            "sales_last_30_days": self._sales_last_30_days(request),
            "sales_current_financial_year": self._sales_current_financial_year(
                request, business
            ),
        }
        return Response(data)

    def _sales_last_30_days(self, request):
        # sale_date is a DateTimeField, so grouping by .values("sale_date")
        # directly would fragment every sale into its own bucket (down to
        # the second) instead of grouping by day -- extract the
        # year/month/day parts and group on those instead. This also
        # sidesteps the earlier SQLite TruncDate incompatibility.
        since = timezone.localdate() - timedelta(days=29)
        qs = (
            _apply_common_filters(
                Sale.objects.exclude(status=SaleStatus.DRAFT), request, "sale_date"
            )
            .filter(sale_date__date__gte=since)
            .annotate(
                y=ExtractYear("sale_date"),
                m=ExtractMonth("sale_date"),
                d=ExtractDay("sale_date"),
            )
            .values("y", "m", "d")
            .annotate(total=Coalesce(Sum("total"), Value(0), output_field=DECIMAL_ZERO))
        )
        by_day = {date(row["y"], row["m"], row["d"]): row["total"] for row in qs}

        series = []
        for i in range(30):
            day = since + timedelta(days=i)
            series.append({"date": day.isoformat(), "total": by_day.get(day, 0)})
        return series

    def _sales_current_financial_year(self, request, business):
        start_month = business.fiscal_year_start_month or 1
        today = timezone.localdate()

        # Fiscal year containing "today".
        if today.month >= start_month:
            fy_start_year = today.year
        else:
            fy_start_year = today.year - 1
        fy_start = date(fy_start_year, start_month, 1)

        qs = (
            _apply_common_filters(
                Sale.objects.exclude(status=SaleStatus.DRAFT), request, "sale_date"
            )
            .filter(sale_date__date__gte=fy_start)
            .annotate(year=ExtractYear("sale_date"), month=ExtractMonth("sale_date"))
            .values("year", "month")
            .annotate(total=Coalesce(Sum("total"), Value(0), output_field=DECIMAL_ZERO))
        )
        by_month = {f"{row['year']}-{row['month']:02d}": row["total"] for row in qs}

        series = []
        for i in range(12):
            m = (start_month - 1 + i) % 12 + 1
            y = fy_start_year + ((start_month - 1 + i) // 12)
            key = f"{y}-{m:02d}"
            label = f"{calendar.month_abbr[m]}-{y}"
            series.append({"month": label, "total": by_month.get(key, 0)})
        return series


class SalesPaymentDueListView(ListAPIView):
    """GET /api/pos/dashboard/sales-payment-due/"""

    permission_classes = [IsAuthenticated, IsPOSStaff]
    serializer_class = SalesPaymentDueSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = _apply_common_filters(
            Sale.objects.exclude(payment_status=PaymentStatus.PAID),
            self.request,
            "sale_date",
        )
        return qs.filter(total__gt=F("paid_amount")).select_related("customer")


class PurchasePaymentDueListView(ListAPIView):
    """GET /api/pos/dashboard/purchase-payment-due/"""

    permission_classes = [IsAuthenticated, IsPOSStaff]
    serializer_class = PurchasePaymentDueSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = _apply_common_filters(
            Purchase.objects.exclude(payment_status=PaymentStatus.PAID),
            self.request,
            "purchase_date",
        )
        return qs.filter(total__gt=F("paid_amount")).select_related("supplier")


class ProductStockAlertListView(ListAPIView):
    """
    GET /api/pos/dashboard/stock-alert/

    Only shows a variant/location combo where current stock has
    dropped to or below its alert threshold.
    """

    permission_classes = [IsAuthenticated, IsPOSStaff]
    serializer_class = ProductStockAlertSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = StockLevel.objects.select_related(
            "variant", "variant__product", "location"
        )
        location_id = self.request.query_params.get("location")
        if location_id:
            qs = qs.filter(location_id=location_id)

        # Threshold comparison needs Python-side filtering since it
        # depends on a per-row fallback (variant.alert_quantity or
        # product.alert_quantity) rather than a single DB column.
        low_ids = [
            row.id
            for row in qs
            if row.quantity <= (row.variant.effective_alert_quantity or 0)
        ]
        return StockLevel.objects.filter(id__in=low_ids).select_related(
            "variant", "variant__product", "location"
        )


class StockExpiryAlertListView(ListAPIView):
    """GET /api/pos/dashboard/stock-expiry-alert/"""

    permission_classes = [IsAuthenticated, IsPOSStaff]
    serializer_class = StockExpiryAlertSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        business = Business.get_solo()
        cutoff = timezone.localdate() + timedelta(days=business.stock_expiry_alert_days)

        qs = Batch.objects.filter(
            expiry_date__isnull=False,
            expiry_date__lte=cutoff,
            quantity__gt=0,
        ).select_related("variant", "variant__product", "location")

        location_id = self.request.query_params.get("location")
        if location_id:
            qs = qs.filter(location_id=location_id)

        return qs.order_by("expiry_date")


class SalesOrderListView(ListAPIView):
    """
    GET /api/pos/dashboard/sales-orders/

    This is the "Sales Order" table at the bottom of Home. It's the
    same underlying Sale list the Sell section will use, so this view
    gets reused (not rebuilt) once we get to that section.
    """

    permission_classes = [IsAuthenticated, IsPOSStaff]
    serializer_class = SalesOrderListSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = _apply_common_filters(Sale.objects, self.request, "sale_date")
        return qs.select_related("customer", "location", "added_by").order_by(
            "-sale_date", "-id"
        )


class LocationChoicesView(APIView):
    """GET /api/pos/dashboard/locations/ -- populates the location filter dropdown."""

    permission_classes = [IsAuthenticated, IsPOSStaff]

    def get(self, request):
        locations = Location.objects.filter(is_active=True).values("id", "name")
        return Response(list(locations))
