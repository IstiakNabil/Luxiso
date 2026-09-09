from decimal import Decimal

from django.db.models import Sum, Value, DecimalField, OuterRef, Subquery, Q, Case, When, F
from django.db.models.functions import Coalesce
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import (
    PurchasePayment,
    SalePayment,
    PurchaseItem,
    PurchaseReturnItem,
    Expense,
    StockLevel,
    Sale,
    SaleItem,
    SaleReturn,
    SaleReturnItem,
    StockAdjustmentItem,
    StockAdjustment,
    AdjustmentType,
    SaleStatus,
)
from ..pagination import POSResultsPagination
from ..permissions import CanViewReports
from ..serializers.reports import (
    PurchasePaymentReportSerializer,
    SalePaymentReportSerializer,
    ProductPurchaseReportSerializer,
    StockReportRowSerializer,
    ProductSaleReportRowSerializer,
)
from ..serializers.stock_adjustment import StockAdjustmentListSerializer

DECIMAL_ZERO = DecimalField(max_digits=12, decimal_places=2)


class PurchasePaymentReportView(ListAPIView):
    """GET /api/pos/reports/purchase-payments/"""

    permission_classes = [IsAuthenticated, CanViewReports]
    serializer_class = PurchasePaymentReportSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = PurchasePayment.objects.select_related("purchase", "purchase__supplier")
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(reference_no__icontains=search)

        supplier_id = params.get("supplier")
        if supplier_id:
            qs = qs.filter(purchase__supplier_id=supplier_id)

        location_id = params.get("location")
        if location_id:
            qs = qs.filter(purchase__location_id=location_id)

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(paid_on__date__gte=date_from)
        if date_to:
            qs = qs.filter(paid_on__date__lte=date_to)

        return qs


class SalePaymentReportView(ListAPIView):
    """GET /api/pos/reports/sale-payments/"""

    permission_classes = [IsAuthenticated, CanViewReports]
    serializer_class = SalePaymentReportSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = SalePayment.objects.select_related(
            "sale", "sale__customer", "sale__customer__customer_group"
        )
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(reference_no__icontains=search)

        customer_id = params.get("customer")
        if customer_id:
            qs = qs.filter(sale__customer_id=customer_id)

        location_id = params.get("location")
        if location_id:
            qs = qs.filter(sale__location_id=location_id)

        payment_method = params.get("payment_method")
        if payment_method:
            qs = qs.filter(payment_method=payment_method)

        customer_group_id = params.get("customer_group")
        if customer_group_id:
            qs = qs.filter(sale__customer__customer_group_id=customer_group_id)

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(paid_on__date__gte=date_from)
        if date_to:
            qs = qs.filter(paid_on__date__lte=date_to)

        return qs


class ProductPurchaseReportView(ListAPIView):
    """GET /api/pos/reports/product-purchases/"""

    permission_classes = [IsAuthenticated, CanViewReports]
    serializer_class = ProductPurchaseReportSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = PurchaseItem.objects.select_related(
            "variant", "variant__product", "variant__product__unit",
            "purchase", "purchase__supplier",
        )
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(variant__product__name__icontains=search) | Q(variant__sku__icontains=search))

        supplier_id = params.get("supplier")
        if supplier_id:
            qs = qs.filter(purchase__supplier_id=supplier_id)

        location_id = params.get("location")
        if location_id:
            qs = qs.filter(purchase__location_id=location_id)

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(purchase__purchase_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(purchase__purchase_date__date__lte=date_to)

        # Returned quantity for this exact (purchase, variant) pair,
        # via a correlated subquery -- avoids the fan-out that a
        # combined annotate would risk if this queryset ever grows a
        # second reverse-relation aggregate alongside it.
        returned_subquery = (
            PurchaseReturnItem.objects.filter(
                purchase_return__purchase_id=OuterRef("purchase_id"),
                variant_id=OuterRef("variant_id"),
            )
            .values("purchase_return__purchase_id", "variant_id")
            .annotate(total=Sum("quantity"))
            .values("total")
        )
        qs = qs.annotate(
            returned_quantity=Coalesce(
                Subquery(returned_subquery, output_field=DECIMAL_ZERO),
                Value(0),
                output_field=DECIMAL_ZERO,
            )
        )

        return qs.order_by("-purchase__purchase_date")


class ExpenseReportView(APIView):
    """
    GET /api/pos/reports/expenses/

    Aggregates by top-level category (uncategorized expenses group
    under "Uncategorized"). Powers the bar chart + totals table.
    Refunds (is_refund=True) subtract from the category total rather
    than adding to it.
    """

    permission_classes = [IsAuthenticated, CanViewReports]

    def get(self, request):
        qs = Expense.objects.all()
        params = request.query_params

        location_id = params.get("location")
        if location_id:
            qs = qs.filter(location_id=location_id)

        category_id = params.get("category")
        if category_id:
            qs = qs.filter(category_id=category_id)

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(expense_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(expense_date__date__lte=date_to)

        signed_amount = Case(
            When(is_refund=True, then=F("amount") * -1),
            default=F("amount"),
            output_field=DECIMAL_ZERO,
        )

        rows = (
            qs.values("category__id", "category__name")
            .annotate(total=Coalesce(Sum(signed_amount), Value(0), output_field=DECIMAL_ZERO))
        )

        categories = []
        grand_total = 0
        for row in rows:
            name = row["category__name"] or "Uncategorized"
            categories.append(
                {"category_id": row["category__id"], "name": name, "total": row["total"]}
            )
            grand_total += row["total"]

        categories.sort(key=lambda r: r["name"])

        return Response({"categories": categories, "grand_total": grand_total})


class ProfitLossReportView(APIView):
    """
    GET /api/pos/reports/profit-loss/

    Revenue is a Final sale's subtotal minus its order-level discount
    (i.e. the taxable amount) -- tax collected is a pass-through, not
    revenue, so it's deliberately excluded. A Sell Return reduces
    revenue in the period the RETURN happened, not the period the
    original sale did (standard accounting treatment), so returns are
    filtered by their own return_date independent of which sales they
    reference.

    Cost of Goods Sold uses each variant's current purchase_price at
    the time of the report, not whatever it actually cost when that
    specific unit was originally bought -- this app doesn't do batch/
    lot costing, so this is an approximation, not an exact historical
    cost. A return reduces COGS back out, since that unit is back in
    inventory and no longer "sold."

    Net Profit subtracts total Expenses for the same period (refunds
    net against the total, same as the Expense Report), and also
    folds in Stock Adjustment impact: a Normal (write-off) adjustment
    is real inventory value lost with nothing sold to show for it,
    reducing profit (any amount_recovered on that write-off, e.g.
    goods sold off as damaged or an insurance payout, offsets the
    loss); an Abnormal (found-stock) adjustment is unexpected extra
    inventory value, added as a gain.
    """

    permission_classes = [IsAuthenticated, CanViewReports]

    def get(self, request):
        params = request.query_params
        date_from = params.get("date_from")
        date_to = params.get("date_to")
        location_id = params.get("location")

        sales_qs = Sale.objects.filter(status=SaleStatus.FINAL)
        returns_qs = SaleReturn.objects.all()
        expenses_qs = Expense.objects.all()
        adjustments_qs = StockAdjustment.objects.all()

        if location_id:
            sales_qs = sales_qs.filter(location_id=location_id)
            returns_qs = returns_qs.filter(location_id=location_id)
            expenses_qs = expenses_qs.filter(location_id=location_id)
            adjustments_qs = adjustments_qs.filter(location_id=location_id)
        if date_from:
            sales_qs = sales_qs.filter(sale_date__date__gte=date_from)
            returns_qs = returns_qs.filter(return_date__date__gte=date_from)
            expenses_qs = expenses_qs.filter(expense_date__date__gte=date_from)
            adjustments_qs = adjustments_qs.filter(adjustment_date__date__gte=date_from)
        if date_to:
            sales_qs = sales_qs.filter(sale_date__date__lte=date_to)
            returns_qs = returns_qs.filter(return_date__date__lte=date_to)
            expenses_qs = expenses_qs.filter(expense_date__date__lte=date_to)
            adjustments_qs = adjustments_qs.filter(adjustment_date__date__lte=date_to)

        total_sales = sales_qs.aggregate(
            total=Coalesce(Sum(F("subtotal") - F("discount")), Value(0), output_field=DECIMAL_ZERO)
        )["total"]

        total_sell_return = returns_qs.aggregate(
            total=Coalesce(Sum("total"), Value(0), output_field=DECIMAL_ZERO)
        )["total"]

        net_sales = total_sales - total_sell_return

        cogs_sold = SaleItem.objects.filter(sale__in=sales_qs).aggregate(
            total=Coalesce(
                Sum(F("quantity") * F("variant__purchase_price")), Value(0), output_field=DECIMAL_ZERO
            )
        )["total"]

        cogs_returned = SaleReturnItem.objects.filter(sale_return__in=returns_qs).aggregate(
            total=Coalesce(
                Sum(F("quantity") * F("variant__purchase_price")), Value(0), output_field=DECIMAL_ZERO
            )
        )["total"]

        total_cogs = cogs_sold - cogs_returned
        gross_profit = net_sales - total_cogs

        signed_expense = Case(
            When(is_refund=True, then=F("amount") * -1),
            default=F("amount"),
            output_field=DECIMAL_ZERO,
        )
        total_expense = expenses_qs.aggregate(
            total=Coalesce(Sum(signed_expense), Value(0), output_field=DECIMAL_ZERO)
        )["total"]

        # Write-offs (Normal) are inventory value lost with no sale to
        # show for it -- a real loss. Found stock (Abnormal) is
        # unexpected extra inventory value -- a real gain. Any amount
        # recovered on a write-off (e.g. sold off as damaged stock, or
        # an insurance payout) offsets that specific loss.
        adjustment_totals = adjustments_qs.aggregate(
            total_normal=Coalesce(
                Sum("total_amount", filter=Q(adjustment_type=AdjustmentType.NORMAL)),
                Value(0), output_field=DECIMAL_ZERO,
            ),
            total_abnormal=Coalesce(
                Sum("total_amount", filter=Q(adjustment_type=AdjustmentType.ABNORMAL)),
                Value(0), output_field=DECIMAL_ZERO,
            ),
            total_recovered=Coalesce(
                Sum("total_amount_recovered"), Value(0), output_field=DECIMAL_ZERO,
            ),
        )
        stock_adjustment_loss = adjustment_totals["total_normal"] - adjustment_totals["total_recovered"]
        stock_adjustment_gain = adjustment_totals["total_abnormal"]
        net_stock_adjustment_impact = stock_adjustment_gain - stock_adjustment_loss

        net_profit = gross_profit - total_expense + net_stock_adjustment_impact

        return Response({
            "total_sales": total_sales,
            "total_sell_return": total_sell_return,
            "net_sales": net_sales,
            "total_cogs": total_cogs,
            "gross_profit": gross_profit,
            "total_expense": total_expense,
            "stock_adjustment_loss": stock_adjustment_loss,
            "stock_adjustment_gain": stock_adjustment_gain,
            "net_stock_adjustment_impact": net_stock_adjustment_impact,
            "net_profit": net_profit,
        })


class StockReportView(APIView):
    """
    GET /api/pos/reports/stock/

    One row per variant -- stock is shared across every location now,
    so there's no per-location split to report on here (Sale/Purchase/
    Stock Adjustment location breakdowns are still available via
    their own reports, which use StockMovement.location).
    "Total Unit Transferred" is always 0 -- inter-location stock
    transfers aren't a feature.
    "Total Unit Adjusted" here means Normal (write-off) Stock
    Adjustment quantity for that variant across every location --
    Abnormal (found-stock) adjustments aren't counted as "adjusted
    away" since nothing left the business.
    """

    permission_classes = [IsAuthenticated, CanViewReports]

    def get(self, request):

        qs = StockLevel.objects.select_related(
            "variant", "variant__product", "variant__product__unit",
            "variant__product__category", "variant__product__brand",
        )
        params = request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(variant__product__name__icontains=search) | Q(variant__sku__icontains=search)
            )

        category_id = params.get("category")
        if category_id:
            qs = qs.filter(variant__product__category_id=category_id)

        subcategory_id = params.get("subcategory")
        if subcategory_id:
            qs = qs.filter(variant__product__subcategory_id=subcategory_id)

        brand_id = params.get("brand")
        if brand_id:
            qs = qs.filter(variant__product__brand_id=brand_id)

        unit_id = params.get("unit")
        if unit_id:
            qs = qs.filter(variant__product__unit_id=unit_id)

        rows = []
        totals = {"purchase_value": Decimal("0"), "sale_value": Decimal("0")}

        for sl in qs:
            variant = sl.variant
            qty = sl.quantity
            purchase_value = qty * variant.purchase_price
            sale_value = qty * variant.selling_price
            profit = sale_value - purchase_value

            sold = SaleItem.objects.filter(
                variant=variant
            ).exclude(sale__status=SaleStatus.DRAFT).aggregate(
                total=Coalesce(Sum("quantity"), Value(0), output_field=DECIMAL_ZERO)
            )["total"]

            adjusted = StockAdjustmentItem.objects.filter(
                variant=variant,
                stock_adjustment__adjustment_type=AdjustmentType.NORMAL,
            ).aggregate(total=Coalesce(Sum("quantity"), Value(0), output_field=DECIMAL_ZERO))["total"]

            rows.append({
                "sku": variant.sku,
                "product_name": variant.display_name,
                "unit_price": variant.selling_price,
                "current_stock": qty,
                "unit_name": variant.product.unit.short_name if variant.product.unit else "",
                "stock_value_by_purchase_price": purchase_value,
                "stock_value_by_sale_price": sale_value,
                "potential_profit": profit,
                "total_unit_sold": sold,
                "total_unit_transferred": Decimal("0"),
                "total_unit_adjusted": adjusted,
            })
            totals["purchase_value"] += purchase_value
            totals["sale_value"] += sale_value

        potential_profit = totals["sale_value"] - totals["purchase_value"]
        margin = (
            (potential_profit / totals["sale_value"] * 100) if totals["sale_value"] else Decimal("0")
        )

        paginator = POSResultsPagination()
        page = paginator.paginate_queryset(rows, request)
        serializer = StockReportRowSerializer(page, many=True)

        response = paginator.get_paginated_response(serializer.data)
        response.data["closing_stock_by_purchase_price"] = totals["purchase_value"]
        response.data["closing_stock_by_sale_price"] = totals["sale_value"]
        response.data["potential_profit"] = potential_profit
        response.data["profit_margin_percent"] = round(margin, 2)
        return response


class ProductSaleReportView(ListAPIView):
    """
    GET /api/pos/reports/product-sales/?view=detailed|grouped|by_category|by_brand

    "Detailed" lists individual sale lines (the reference's default
    tab). grouped/by_category/by_brand return an aggregated summary
    instead of a paginated line list -- handled directly in get()
    since their shape doesn't fit ListAPIView's per-row pagination.
    """

    permission_classes = [IsAuthenticated, CanViewReports]
    serializer_class = ProductSaleReportRowSerializer
    pagination_class = POSResultsPagination

    def get_base_queryset(self):

        qs = SaleItem.objects.filter(sale__status=SaleStatus.FINAL).select_related(
            "variant", "variant__product", "variant__product__category", "variant__product__brand",
            "sale", "sale__customer", "sale__tax_rate",
        )
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(variant__product__name__icontains=search) | Q(variant__sku__icontains=search))

        customer_id = params.get("customer")
        if customer_id:
            qs = qs.filter(sale__customer_id=customer_id)

        customer_group_id = params.get("customer_group")
        if customer_group_id:
            qs = qs.filter(sale__customer__customer_group_id=customer_group_id)

        location_id = params.get("location")
        if location_id:
            qs = qs.filter(sale__location_id=location_id)

        category_id = params.get("category")
        if category_id:
            qs = qs.filter(variant__product__category_id=category_id)

        brand_id = params.get("brand")
        if brand_id:
            qs = qs.filter(variant__product__brand_id=brand_id)

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(sale__sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale__sale_date__date__lte=date_to)

        return qs.order_by("-sale__sale_date")

    def get_queryset(self):
        return self.get_base_queryset()

    def list(self, request, *args, **kwargs):
        view = request.query_params.get("view", "detailed")
        if view == "detailed":
            return super().list(request, *args, **kwargs)

        qs = self.get_base_queryset()
        if view == "grouped":
            group_field, label_field = "variant_id", "variant__product__name"
        elif view == "by_category":
            group_field, label_field = "variant__product__category_id", "variant__product__category__name"
        elif view == "by_brand":
            group_field, label_field = "variant__product__brand_id", "variant__product__brand__name"
        else:
            return Response({"detail": "Unknown view."}, status=400)

        rows = (
            qs.values(label_field)
            .annotate(
                total_quantity=Coalesce(Sum("quantity"), Value(0), output_field=DECIMAL_ZERO),
                total_sales=Coalesce(Sum("subtotal"), Value(0), output_field=DECIMAL_ZERO),
            )
            .order_by("-total_sales")
        )
        return Response([
            {
                "name": row[label_field] or "Uncategorized",
                "total_quantity": row["total_quantity"],
                "total_sales": row["total_sales"],
            }
            for row in rows
        ])


class TrendingProductsView(APIView):
    """
    GET /api/pos/reports/trending-products/

    Ranks products by total sales value (not raw quantity, since a
    handful of high-value items and a pile of cheap ones aren't
    comparable by unit count alone) over the filtered window.
    """

    permission_classes = [IsAuthenticated, CanViewReports]

    def get(self, request):

        qs = SaleItem.objects.filter(sale__status=SaleStatus.FINAL).select_related(
            "variant__product"
        )
        params = request.query_params

        location_id = params.get("location")
        if location_id:
            qs = qs.filter(sale__location_id=location_id)

        category_id = params.get("category")
        if category_id:
            qs = qs.filter(variant__product__category_id=category_id)

        subcategory_id = params.get("subcategory")
        if subcategory_id:
            qs = qs.filter(variant__product__subcategory_id=subcategory_id)

        brand_id = params.get("brand")
        if brand_id:
            qs = qs.filter(variant__product__brand_id=brand_id)

        unit_id = params.get("unit")
        if unit_id:
            qs = qs.filter(variant__product__unit_id=unit_id)

        product_type = params.get("product_type")
        if product_type == "single":
            qs = qs.filter(variant__product__has_variants=False)
        elif product_type == "variable":
            qs = qs.filter(variant__product__has_variants=True)

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(sale__sale_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(sale__sale_date__date__lte=date_to)

        try:
            limit = max(1, min(50, int(params.get("number_of_products", 5))))
        except (TypeError, ValueError):
            limit = 5

        rows = (
            qs.values("variant__product__id", "variant__product__name")
            .annotate(total_sales=Coalesce(Sum("subtotal"), Value(0), output_field=DECIMAL_ZERO))
            .order_by("-total_sales")[:limit]
        )

        return Response([
            {
                "product_id": row["variant__product__id"],
                "name": row["variant__product__name"],
                "total_sales": row["total_sales"],
            }
            for row in rows
        ])


class StockAdjustmentReportView(APIView):
    """GET /api/pos/reports/stock-adjustments/"""

    permission_classes = [IsAuthenticated, CanViewReports]

    def get(self, request):

        qs = StockAdjustment.objects.select_related("location", "created_by")
        params = request.query_params

        location_id = params.get("location")
        if location_id:
            qs = qs.filter(location_id=location_id)

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(adjustment_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(adjustment_date__date__lte=date_to)

        totals = qs.aggregate(
            total_normal=Coalesce(
                Sum("total_amount", filter=Q(adjustment_type=AdjustmentType.NORMAL)),
                Value(0), output_field=DECIMAL_ZERO,
            ),
            total_abnormal=Coalesce(
                Sum("total_amount", filter=Q(adjustment_type=AdjustmentType.ABNORMAL)),
                Value(0), output_field=DECIMAL_ZERO,
            ),
            total_recovered=Coalesce(Sum("total_amount_recovered"), Value(0), output_field=DECIMAL_ZERO),
        )

        paginator = POSResultsPagination()
        page = paginator.paginate_queryset(qs.order_by("-adjustment_date"), request)
        serializer = StockAdjustmentListSerializer(page, many=True)

        response = paginator.get_paginated_response(serializer.data)
        response.data["total_normal"] = totals["total_normal"]
        response.data["total_abnormal"] = totals["total_abnormal"]
        response.data["total_stock_adjustment"] = totals["total_normal"] + totals["total_abnormal"]
        response.data["total_amount_recovered"] = totals["total_recovered"]
        return response

