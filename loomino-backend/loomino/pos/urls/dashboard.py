from django.urls import path

from ..views.dashboard import (
    DashboardSummaryView,
    SalesPaymentDueListView,
    PurchasePaymentDueListView,
    ProductStockAlertListView,
    StockExpiryAlertListView,
    SalesOrderListView,
    LocationChoicesView,
)

urlpatterns = [
    path("summary/", DashboardSummaryView.as_view(), name="pos-dashboard-summary"),
    path(
        "sales-payment-due/",
        SalesPaymentDueListView.as_view(),
        name="pos-dashboard-sales-payment-due",
    ),
    path(
        "purchase-payment-due/",
        PurchasePaymentDueListView.as_view(),
        name="pos-dashboard-purchase-payment-due",
    ),
    path(
        "stock-alert/",
        ProductStockAlertListView.as_view(),
        name="pos-dashboard-stock-alert",
    ),
    path(
        "stock-expiry-alert/",
        StockExpiryAlertListView.as_view(),
        name="pos-dashboard-stock-expiry-alert",
    ),
    path(
        "sales-orders/",
        SalesOrderListView.as_view(),
        name="pos-dashboard-sales-orders",
    ),
    path("locations/", LocationChoicesView.as_view(), name="pos-dashboard-locations"),
]
