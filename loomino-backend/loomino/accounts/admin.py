
from django.contrib import admin
from .models import (
    User,
    EmailOTP,
    CustomerProfile,
    Address,
    LoginHistory,
)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):

    list_display = (
        "email",
        "first_name",
        "last_name",
        "is_email_verified",
        "is_staff",
        "is_active",
    )

    search_fields = (
        "email",
        "first_name",
        "last_name",
    )


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "purpose",
        "otp",
        "is_used",
        "expires_at",
    )

    list_filter = (
        "purpose",
        "is_used",
    )

@admin.register(CustomerProfile)
class CustomerProfileAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "gender",
        "loyalty_points",
        "profile_completed",
    )

    list_filter = (
        "gender",
        "profile_completed",
    )

    search_fields = (
        "user__email",
    )

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "full_name",
        "division",
        "district",
        "is_default",
    )

    list_filter = (
        "division",
        "is_default",
    )

    search_fields = (
        "user__email",
        "full_name",
        "phone_number",
    )

@admin.register(LoginHistory)
class LoginHistoryAdmin(admin.ModelAdmin):

    list_display = (
        "user",
        "ip_address",
        "successful",
        "login_time",
    )

    list_filter = (
        "successful",
    )

    search_fields = (
        "user__email",
        "ip_address",
    )

    readonly_fields = (
        "login_time",
    )