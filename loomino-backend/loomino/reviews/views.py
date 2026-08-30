from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework import generics
from orders.models import OrderItem
from products.models import Product
from .models import Review
from .serializers import (
    CreateReviewSerializer,
ReviewSerializer,
)
from drf_spectacular.utils import extend_schema

from rest_framework import generics
from rest_framework.filters import (
    SearchFilter,
    OrderingFilter,
)
from rest_framework.permissions import IsAdminUser

from reviews.models import Review

from .serializers import (
    AdminReviewSerializer,
    AdminReviewStatusUpdateSerializer,
)

@extend_schema(
    tags=["Reviews"],
    summary="Create Review",
    description="Create a new review for a product.",
)
class CreateReviewAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = CreateReviewSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        product = serializer.validated_data["product"]

        purchased = OrderItem.objects.filter(

            order__user=request.user,

            product_variant__product=product,

            order__status="delivered",

        ).exists()

        if not purchased:

            return Response(
                {
                    "message": "You can only review purchased products."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Review.objects.filter(
            user=request.user,
            product=product,
        ).exists():

            return Response(
                {
                    "message": "You already reviewed this product."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save(

            user=request.user,

            is_verified_purchase=True,

        )

        return Response(
            {
                "message": "Review submitted successfully."
            },
            status=status.HTTP_201_CREATED,
        )


@extend_schema(
    tags=["Reviews"],
    summary="Product Reviews",
    description="Retrieve a list of reviews for a product.",
)
class ProductReviewListAPIView(generics.ListAPIView):

    serializer_class = ReviewSerializer

    # The project's DRF default is IsAuthenticated — this view
    # needs to stay public even for guests, or the storefront's
    # global 401-refresh interceptor force-redirects a guest to
    # /login the moment reviews load on a product page.
    permission_classes = [AllowAny]

    def get_queryset(self):

        return Review.objects.filter(

            product__slug=self.kwargs["slug"],

            is_approved=True,

        ).select_related(

            "user",

            "product",

        ).order_by(

            "-created_at",

        )


@extend_schema(
    tags=["Reviews"],
    summary="Update Review",
    description="Update an existing review for a product.",
)
class UpdateReviewAPIView(generics.UpdateAPIView):

    serializer_class = CreateReviewSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Review.objects.filter(
            user=self.request.user
        )


@extend_schema(
    tags=["Reviews"],
    summary="Delete Review",
    description="Delete an existing review for a product.",
)
class DeleteReviewAPIView(generics.DestroyAPIView):

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Review.objects.filter(
            user=self.request.user
        )
    
# ============================================================
# ADMIN — Review List
# ============================================================

class AdminReviewListAPIView(
    generics.ListAPIView
):

    serializer_class = AdminReviewSerializer

    permission_classes = [IsAdminUser]

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (
        "product__name",
        "user__first_name",
        "user__last_name",
        "user__email",
        "title",
        "review",
    )

    ordering_fields = (
        "created_at",
        "rating",
        "status",
    )

    ordering = (
        "-created_at",
    )

    def get_queryset(self):

        return (
            Review.objects.all()
            .select_related(
                "product",
                "user",
            )
            .prefetch_related(
                "product__images",
            )
        )


# ============================================================
# ADMIN — Review Update / Delete
# ============================================================

class AdminReviewRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    permission_classes = [IsAdminUser]

    queryset = (
        Review.objects.all()
        .select_related(
            "product",
            "user",
        )
        .prefetch_related(
            "product__images",
        )
    )

    lookup_field = "pk"

    def get_serializer_class(self):

        if self.request.method in (
            "PUT",
            "PATCH",
        ):
            return AdminReviewStatusUpdateSerializer

        return AdminReviewSerializer