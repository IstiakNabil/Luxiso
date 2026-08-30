from rest_framework import serializers

from .models import Review
from products.models import Product


# ============================================================
# PUBLIC — Review
# ============================================================

class ReviewSerializer(serializers.ModelSerializer):

    user = serializers.StringRelatedField(
        read_only=True
    )

    class Meta:

        model = Review

        fields = (

            "id",

            "user",

            "rating",

            "title",

            "review",

            "is_verified_purchase",

            "created_at",

        )

        read_only_fields = (

            "id",

            "user",

            "is_verified_purchase",

            "created_at",

        )


# ============================================================
# PUBLIC — Create Review
# ============================================================

class CreateReviewSerializer(serializers.ModelSerializer):

    class Meta:

        model = Review

        fields = (

            "product",

            "rating",

            "title",

            "review",

        )


# ============================================================
# ADMIN — Review Product
# ============================================================

class AdminReviewProductSerializer(serializers.ModelSerializer):

    thumbnail = serializers.SerializerMethodField()

    class Meta:

        model = Product

        fields = (

            "id",

            "name",

            "slug",

            "thumbnail",

        )

    def get_thumbnail(self, obj):

        image = obj.images.order_by(
            "display_order",
            "id",
        ).first()

        if not image:

            return None

        request = self.context.get(
            "request"
        )

        if request:

            return request.build_absolute_uri(
                image.image.url
            )

        return image.image.url


# ============================================================
# ADMIN — Review Reviewer
# ============================================================

class AdminReviewReviewerSerializer(serializers.Serializer):

    name = serializers.SerializerMethodField()

    email = serializers.EmailField(
        read_only=True
    )

    def get_name(self, obj):

        full_name = (
            f"{obj.first_name} {obj.last_name}"
        ).strip()

        if full_name:

            return full_name

        return obj.email


# ============================================================
# ADMIN — Review List / Detail
# ============================================================

class AdminReviewSerializer(serializers.ModelSerializer):

    product = AdminReviewProductSerializer(
        read_only=True
    )

    reviewer = AdminReviewReviewerSerializer(
        source="user",
        read_only=True,
    )

    review_text = serializers.CharField(
        source="review",
        read_only=True,
    )

    class Meta:

        model = Review

        fields = (

            "id",

            "product",

            "reviewer",

            "rating",

            "title",

            "review_text",

            "status",

            "created_at",

        )

        read_only_fields = (

            "id",

            "product",

            "reviewer",

            "rating",

            "title",

            "review_text",

            "created_at",

        )


# ============================================================
# ADMIN — Review Status Update
# ============================================================

class AdminReviewStatusUpdateSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = Review

        fields = (

            "status",

        )

    def update(
        self,
        instance,
        validated_data,
    ):

        status_value = validated_data.get(
            "status",
            instance.status,
        )

        instance.status = status_value

        instance.is_approved = (
            status_value == Review.STATUS_PUBLISHED
        )

        instance.save(
            update_fields=(
                "status",
                "is_approved",
            )
        )

        return instance