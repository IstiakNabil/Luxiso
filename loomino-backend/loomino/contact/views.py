from rest_framework import (
    generics,
    status,
)

from rest_framework.filters import (
    SearchFilter,
    OrderingFilter,
)

from rest_framework.permissions import (
    AllowAny,
    IsAdminUser,
)

from rest_framework.response import Response

from rest_framework.views import APIView

from .models import ContactMessage

from .serializers import (
    ContactMessageCreateSerializer,
    AdminContactMessageSerializer,
)


# ============================================================
# PUBLIC POST / ADMIN GET — Contact Messages
# ============================================================

class ContactMessageListCreateAPIView(
    generics.ListCreateAPIView
):

    queryset = (
        ContactMessage.objects.all()
    )

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (

        "sender_name",

        "sender_email",

        "phone",

        "subject",

        "message",

    )

    ordering_fields = (

        "created_at",

        "sender_name",

        "subject",

    )

    ordering = (
        "-created_at",
    )

    def get_permissions(self):

        if self.request.method == "POST":

            return [
                AllowAny()
            ]

        return [
            IsAdminUser()
        ]

    def get_serializer_class(self):

        if self.request.method == "POST":

            return (
                ContactMessageCreateSerializer
            )

        return (
            AdminContactMessageSerializer
        )


# ============================================================
# ADMIN — Delete Contact Message
# ============================================================

class AdminContactMessageDeleteAPIView(
    generics.DestroyAPIView
):

    permission_classes = [IsAdminUser]

    queryset = (
        ContactMessage.objects.all()
    )

    lookup_field = "pk"