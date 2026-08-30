from django.urls import path

from .views import( ApplyCouponAPIView,
                   AdminCouponListCreateAPIView,
AdminCouponRetrieveUpdateDestroyAPIView,
AdminCouponToggleActiveAPIView,
)
urlpatterns = [

    path(
        "apply/",
        ApplyCouponAPIView.as_view(),
        name="apply-coupon",
    ),

    # ============================================================
# ADMIN — Coupon Endpoints
# ============================================================

path(
    "admin/",
    AdminCouponListCreateAPIView.as_view(),
    name="admin-coupon-list-create",
),

path(
    "admin/<int:pk>/",
    AdminCouponRetrieveUpdateDestroyAPIView.as_view(),
    name="admin-coupon-detail",
),

path(
    "admin/<int:pk>/toggle-active/",
    AdminCouponToggleActiveAPIView.as_view(),
    name="admin-coupon-toggle-active",
),

]