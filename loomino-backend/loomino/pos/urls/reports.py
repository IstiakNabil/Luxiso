from django.urls import path

from ..views.reports import (
    PurchasePaymentReportView,
    SalePaymentReportView,
    ProductPurchaseReportView,
    ExpenseReportView,
    StockReportView,
    ProductSaleReportView,
    TrendingProductsView,
    StockAdjustmentReportView,
)

urlpatterns = [
    path("purchase-payments/", PurchasePaymentReportView.as_view(), name="pos-report-purchase-payments"),
    path("sale-payments/", SalePaymentReportView.as_view(), name="pos-report-sale-payments"),
    path("product-purchases/", ProductPurchaseReportView.as_view(), name="pos-report-product-purchases"),
    path("expenses/", ExpenseReportView.as_view(), name="pos-report-expenses"),
    path("stock/", StockReportView.as_view(), name="pos-report-stock"),
    path("product-sales/", ProductSaleReportView.as_view(), name="pos-report-product-sales"),
    path("trending-products/", TrendingProductsView.as_view(), name="pos-report-trending-products"),
    path("stock-adjustments/", StockAdjustmentReportView.as_view(), name="pos-report-stock-adjustments"),
]
