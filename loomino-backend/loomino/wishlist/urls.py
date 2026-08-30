from django.urls import path

from .views import (
    WishlistAPIView,
    AddWishlistAPIView,
    RemoveWishlistAPIView,
)

urlpatterns = [

    path(
        "",
        WishlistAPIView.as_view(),
        name="wishlist",
    ),

path(
    "add/",
    AddWishlistAPIView.as_view(),
    name="wishlist-add",
),

path(
    "<int:variant_id>/remove/",
    RemoveWishlistAPIView.as_view(),
    name="wishlist-remove",
),

]