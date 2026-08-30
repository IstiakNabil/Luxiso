from django.urls import path

from .views import ( CreateReviewAPIView,
                     ProductReviewListAPIView,
                     UpdateReviewAPIView,
                     DeleteReviewAPIView,
                     AdminReviewListAPIView,
                     AdminReviewRetrieveUpdateDestroyAPIView,)

urlpatterns = [

    path(
        "",
        CreateReviewAPIView.as_view(),
        name="create-review",
    ),

path(
    "product/<slug:slug>/",
    ProductReviewListAPIView.as_view(),
    name="product-reviews",
),

path(
    "<int:pk>/",
    UpdateReviewAPIView.as_view(),
    name="review-update",
),

path(
    "<int:pk>/delete/",
    DeleteReviewAPIView.as_view(),
    name="review-delete",
),

path(
    "admin/",
    AdminReviewListAPIView.as_view(),
    name="admin-review-list",
),

path(
    "admin/<int:pk>/",
    AdminReviewRetrieveUpdateDestroyAPIView.as_view(),
    name="admin-review-detail",
),

]