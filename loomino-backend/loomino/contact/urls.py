from django.urls import path

from .views import (
    ContactMessageListCreateAPIView,
    AdminContactMessageDeleteAPIView,
)


urlpatterns = [

    path(
        "messages/",
        ContactMessageListCreateAPIView.as_view(),
        name="contact-message-list-create",
    ),

    path(
        "messages/<int:pk>/",
        AdminContactMessageDeleteAPIView.as_view(),
        name="admin-contact-message-delete",
    ),

]