from django.urls import path

from .views import (
    CartAPIView,
    AddToCartAPIView,
    UpdateCartItemAPIView,
    RemoveCartItemAPIView,
    ClearCartAPIView,
    CheckoutAPIView,
    OrderListAPIView,
    OrderDetailAPIView,
    CancelOrderAPIView,
    AdminOrderListAPIView,
    AdminOrderDetailUpdateAPIView,
)

urlpatterns = [

    # Cart
    path(
        "cart/",
        CartAPIView.as_view(),
        name="cart",
    ),

    path(
        "cart/add/",
        AddToCartAPIView.as_view(),
        name="cart-add",
    ),

    path(
        "cart/items/<int:pk>/",
        UpdateCartItemAPIView.as_view(),
        name="cart-update",
    ),

    path(
        "cart/items/<int:pk>/delete/",
        RemoveCartItemAPIView.as_view(),
        name="cart-remove",
    ),

    path(
        "cart/clear/",
        ClearCartAPIView.as_view(),
        name="cart-clear",
    ),

    # Checkout
    path(
        "checkout/",
        CheckoutAPIView.as_view(),
        name="checkout",
    ),

    # Orders
    path(
        "orders/",
        OrderListAPIView.as_view(),
        name="order-list",
    ),

    path(
        "orders/admin/",
        AdminOrderListAPIView.as_view(),
        name="admin-order-list",
    ),

    path(
        "orders/admin/<str:order_number>/",
        AdminOrderDetailUpdateAPIView.as_view(),
        name="admin-order-detail-update",
    ),

    path(
        "orders/<str:order_number>/",
        OrderDetailAPIView.as_view(),
        name="order-detail",
    ),

    path(
        "orders/<str:order_number>/cancel/",
        CancelOrderAPIView.as_view(),
        name="order-cancel",
    ),
]