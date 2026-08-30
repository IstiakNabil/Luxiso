from django.shortcuts import render

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

from .models import NewsletterSubscriber

from .serializers import (
    NewsletterSubscribeSerializer,
    AdminNewsletterSubscriberSerializer,
)


# ============================================================
# PUBLIC — Subscribe to Newsletter
# ============================================================

class NewsletterSubscribeAPIView(
    generics.CreateAPIView
):

    serializer_class = (
        NewsletterSubscribeSerializer
    )

    permission_classes = [AllowAny]

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        subscriber = serializer.save()

        return Response(
            {
                "message": (
                    "Successfully subscribed "
                    "to the newsletter."
                ),
                "subscriber": {
                    "id": subscriber.id,
                    "email": subscriber.email,
                    "subscribed_at": (
                        subscriber.subscribed_at
                    ),
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# ADMIN — Newsletter Subscriber List
# ============================================================

class AdminNewsletterSubscriberListAPIView(
    generics.ListAPIView
):

    serializer_class = (
        AdminNewsletterSubscriberSerializer
    )

    permission_classes = [IsAdminUser]

    queryset = (
        NewsletterSubscriber.objects.all()
    )

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (
        "email",
    )

    ordering_fields = (
        "email",
        "subscribed_at",
    )

    ordering = (
        "-subscribed_at",
    )


# ============================================================
# ADMIN — Delete Newsletter Subscriber
# ============================================================

class AdminNewsletterSubscriberDeleteAPIView(
    generics.DestroyAPIView
):

    permission_classes = [IsAdminUser]

    queryset = (
        NewsletterSubscriber.objects.all()
    )

    lookup_field = "pk"
