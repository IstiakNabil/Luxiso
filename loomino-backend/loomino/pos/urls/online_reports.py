from django.urls import path

from ..views.online_reports import (
    OnlineProductStockListView,
    OnlineSalesListView,
    OnlineSummaryView,
)

urlpatterns = [
    path("summary/", OnlineSummaryView.as_view(), name="pos-online-summary"),
    path("products/", OnlineProductStockListView.as_view(), name="pos-online-products"),
    path("sales/", OnlineSalesListView.as_view(), name="pos-online-sales"),
]
