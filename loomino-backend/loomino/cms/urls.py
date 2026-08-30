from django.urls import path

from .views import (
    AdminOfferBannerListCreateAPIView,
    AdminOfferBannerRetrieveUpdateDestroyAPIView,
    AdminOfferBannerToggleActiveAPIView,
    PublicSiteBannerListAPIView,
    AdminSiteBannerListAPIView,
    AdminSiteBannerUpdateAPIView,
)

urlpatterns = [

    # Public — what the storefront actually renders
    path(
        "site-banners/",
        PublicSiteBannerListAPIView.as_view(),
        name="public-site-banner-list",
    ),

    # Site Banners (fixed-slot images admins can replace)
    path(
        "site-banners/admin/",
        AdminSiteBannerListAPIView.as_view(),
        name="admin-site-banner-list",
    ),

    path(
        "site-banners/admin/<str:key>/",
        AdminSiteBannerUpdateAPIView.as_view(),
        name="admin-site-banner-update",
    ),

    # Offer Banners
    path(
        "banners/admin/",
        AdminOfferBannerListCreateAPIView.as_view(),
        name="admin-offer-banner-list",
    ),

    path(
        "banners/admin/<int:pk>/",
        AdminOfferBannerRetrieveUpdateDestroyAPIView.as_view(),
        name="admin-offer-banner-detail",
    ),

    path(
        "banners/admin/<int:pk>/toggle-active/",
        AdminOfferBannerToggleActiveAPIView.as_view(),
        name="admin-offer-banner-toggle-active",
    ),

]
