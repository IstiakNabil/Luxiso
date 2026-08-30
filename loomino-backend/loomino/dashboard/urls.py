from django.urls import path

from .views import (DashboardStatsAPIView,
                    DashboardOrderListAPIView,
LowStockAPIView, TopProductsAPIView, MonthlySalesAPIView,
DashboardCustomerListAPIView,OrderStatusSummaryAPIView,
                    )
urlpatterns = [

    path(
        "stats/",
        DashboardStatsAPIView.as_view(),
        name="dashboard-stats",
    ),

path(
    "orders/",
    DashboardOrderListAPIView.as_view(),
    name="dashboard-orders",
),

path(
    "low-stock/",
    LowStockAPIView.as_view(),
    name="dashboard-low-stock",
),

path(
    "top-products/",
    TopProductsAPIView.as_view(),
    name="dashboard-top-products",
),

path(
    "sales/",
    MonthlySalesAPIView.as_view(),
    name="dashboard-sales",
),

path(
    "customers/",
    DashboardCustomerListAPIView.as_view(),
    name="dashboard-customers",
),

path(
    "order-summary/",
    OrderStatusSummaryAPIView.as_view(),
    name="dashboard-order-summary",
),

]