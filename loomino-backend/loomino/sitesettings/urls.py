from django.urls import path

from .views import (
    AdminSiteSettingAPIView,
    PublicSiteSettingAPIView,
)

urlpatterns = [
    path(
        "settings/",
        PublicSiteSettingAPIView.as_view(),
        name="public-site-settings",
    ),
    path(
        "settings/admin/",
        AdminSiteSettingAPIView.as_view(),
        name="admin-site-settings",
    ),
]
