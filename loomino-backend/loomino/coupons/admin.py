from django.contrib import admin
from .models import Coupon, CouponUsage


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):

    list_display = (
        "code",
        "discount_type",
        "discount_value",
        "usage_limit",
        "used_count",
        "is_active",
        "valid_until",
    )

    list_filter = (
        "discount_type",
        "is_active",
    )

    search_fields = (
        "code",
    )


@admin.register(CouponUsage)
class CouponUsageAdmin(admin.ModelAdmin):

    list_display = (
        "coupon",
        "user",
        "order",
        "discount_amount",
        "used_at",
    )

    search_fields = (
        "coupon__code",
        "user__email",
        "order__order_number",
    )