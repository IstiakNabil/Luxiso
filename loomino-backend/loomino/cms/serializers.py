from rest_framework import serializers

from .models import OfferBanner, SiteBanner


class PublicSiteBannerSerializer(serializers.ModelSerializer):

    label = serializers.CharField(
        source="get_key_display", read_only=True
    )

    class Meta:
        model = SiteBanner
        fields = (
            "key",
            "label",
            "image",
            "eyebrow",
            "heading",
            "body",
            "cta_label",
        )


class AdminSiteBannerSerializer(serializers.ModelSerializer):

    label = serializers.CharField(
        source="get_key_display", read_only=True
    )

    class Meta:
        model = SiteBanner
        fields = (
            "id",
            "key",
            "label",
            "image",
            "eyebrow",
            "heading",
            "body",
            "cta_label",
            "updated_at",
        )
        read_only_fields = ("id", "key", "updated_at")


class AdminOfferBannerSerializer(serializers.ModelSerializer):

    class Meta:
        model = OfferBanner
        fields = (
            "id",
            "title",
            "subtitle",
            "placement_type",
            "image",
            "display_order",
            "is_active",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
