from django.contrib import admin
from .models import Wishlist, WishlistItem


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "created_at",
    )

    search_fields = (
        "user__email",
    )


@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):

    list_display = (
        "wishlist",
        "product_variant",
        "created_at",
    )

    search_fields = (
        "wishlist__user__email",
        "product_variant__product__name",
    )