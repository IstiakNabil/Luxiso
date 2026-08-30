from django.contrib import admin
from .models import (
    Category,
    ProductType,
    Color,
    Size,
    Product,
    ProductImage,
    ProductVariant,
    ProductFeature
)


# ==========================
# Category
# ==========================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_active", "created_at")
    search_fields = ("name",)
    list_filter = ("is_active",)
    prepopulated_fields = {"slug": ("name",)}


# ==========================
# Product Type
# ==========================

@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_active")
    search_fields = ("name",)
    list_filter = ("is_active", "categories")
    filter_horizontal = ("categories",)
    prepopulated_fields = {"slug": ("name",)}


# ==========================
# Color
# ==========================

@admin.register(Color)
class ColorAdmin(admin.ModelAdmin):
    list_display = ("name", "hex_code", "is_active")


# ==========================
# Size
# ==========================

@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ("name", "display_order", "is_active")


# ==========================
# Product Inlines
# ==========================

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


# ==========================
# Product
# ==========================

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
    "name",
    "category",
    "product_type",
    "regular_price",
    "discount_price",
    "is_featured",
    "is_new_arrival",
    "is_on_sale",
    "is_active",
    )

    list_filter = (
    "category",
    "product_type",
    "is_featured",
    "is_new_arrival",
    "is_on_sale",
    "is_active",
    )

    search_fields = (
        "name",
        "description",
        "fitting",
        "fabric_and_care",
        "shipping_and_return",
    )

    fields = (
        "category",
        "product_type",
        "name",
        "slug",
        "short_description",
        "description",
        "fitting",
        "fabric_and_care",
        "shipping_and_return",
        "regular_price",
        "discount_price",
        "is_featured",
        "is_new_arrival",
        "is_active",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }

    inlines = [
        ProductImageInline,
        ProductVariantInline,
    ]




@admin.register(ProductFeature)
class ProductFeatureAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "feature",
        "display_order",
    )

    search_fields = (
        "product__name",
        "feature",
    )