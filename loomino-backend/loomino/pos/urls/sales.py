from django.urls import path

from ..views.sales import (
    SaleListCreateView,
    SaleDetailView,
    SaleReturnListView,
    ReturnableSaleItemListView,
    SalePaymentCreateView,
)

urlpatterns = [
    path("", SaleListCreateView.as_view(), name="pos-sales-list"),
    path("<int:pk>/", SaleDetailView.as_view(), name="pos-sales-detail"),
    path(
        "<int:sale_id>/returnable-items/",
        ReturnableSaleItemListView.as_view(),
        name="pos-sale-returnable-items",
    ),
    path("<int:pk>/payments/", SalePaymentCreateView.as_view(), name="pos-sale-payments-create"),
    path("returns/", SaleReturnListView.as_view(), name="pos-sale-returns-list"),
]
