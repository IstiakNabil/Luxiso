from django.urls import path
from .views import (
    RegisterAPIView,
    VerifyEmailAPIView,
    LoginAPIView,
    LogoutAPIView,
    ForgotPasswordAPIView,
    ResetPasswordAPIView,
    ResendOTPAPIView,
ProfileAPIView,
AddressListCreateAPIView,
    AddressUpdateAPIView,
AddressDeleteAPIView,
SetDefaultAddressAPIView,
)
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path(
        "register/",
        RegisterAPIView.as_view(),
        name="register",
    ),

    path(
        "verify-email/",
        VerifyEmailAPIView.as_view(),
        name="verify-email",
    ),

    path(
        "login/",
        LoginAPIView.as_view(),
        name="login",
    ),

    path(
    "refresh/",
    TokenRefreshView.as_view(),
    name="token_refresh",
    ),


    path(
    "logout/",
    LogoutAPIView.as_view(),
    name="logout",
    ),
    path(
    "forgot-password/",
    ForgotPasswordAPIView.as_view(),
    name="forgot-password",
    ),
    path(
    "reset-password/",
    ResetPasswordAPIView.as_view(),
    name="reset-password",
    ),
    path(
    "resend-otp/",
    ResendOTPAPIView.as_view(),
    name="resend-otp",
    ),
path(
    "profile/",
    ProfileAPIView.as_view(),
    name="profile",
),

path(
    "addresses/",
    AddressListCreateAPIView.as_view(),
    name="address-list-create",
),

path(
    "addresses/<int:pk>/",
    AddressUpdateAPIView.as_view(),
    name="address-update",
),

path(
    "addresses/<int:pk>/delete/",
    AddressDeleteAPIView.as_view(),
    name="address-delete",
),

path(
    "addresses/<int:pk>/default/",
    SetDefaultAddressAPIView.as_view(),
    name="address-default",
),


]