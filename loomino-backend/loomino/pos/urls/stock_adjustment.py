from django.urls import path

from ..views.stock_adjustment import StockAdjustmentListCreateView, StockAdjustmentDetailView

urlpatterns = [
    path("", StockAdjustmentListCreateView.as_view(), name="pos-stock-adjustments-list"),
    path("<int:pk>/", StockAdjustmentDetailView.as_view(), name="pos-stock-adjustments-detail"),
]
