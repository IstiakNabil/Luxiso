from django.urls import path

from ..views.purchases import (
    PurchaseListCreateView,
    PurchaseDetailView,
    PurchaseReturnListView,
    PurchasableItemListView,
    PurchasePaymentCreateView,
)

urlpatterns = [
    path("", PurchaseListCreateView.as_view(), name="pos-purchases-list"),
    path("<int:pk>/", PurchaseDetailView.as_view(), name="pos-purchases-detail"),
    path(
        "<int:purchase_id>/returnable-items/",
        PurchasableItemListView.as_view(),
        name="pos-purchase-returnable-items",
    ),
    path("<int:pk>/payments/", PurchasePaymentCreateView.as_view(), name="pos-purchase-payments-create"),
    path("returns/", PurchaseReturnListView.as_view(), name="pos-purchase-returns-list"),
]
