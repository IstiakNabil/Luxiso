from django.urls import path

from .views import (
    NewsletterSubscribeAPIView,
    AdminNewsletterSubscriberListAPIView,
    AdminNewsletterSubscriberDeleteAPIView,
)


urlpatterns = [

    # ========================================================
    # PUBLIC — Subscribe
    # ========================================================

    path(
        "subscribe/",
        NewsletterSubscribeAPIView.as_view(),
        name="newsletter-subscribe",
    ),


    # ========================================================
    # ADMIN — Subscribers
    # ========================================================

    path(
        "subscribers/",
        AdminNewsletterSubscriberListAPIView.as_view(),
        name="admin-newsletter-subscriber-list",
    ),

    path(
        "subscribers/<int:pk>/",
        AdminNewsletterSubscriberDeleteAPIView.as_view(),
        name="admin-newsletter-subscriber-delete",
    ),

]