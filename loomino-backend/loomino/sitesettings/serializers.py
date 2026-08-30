from rest_framework import serializers

from .models import SiteSetting


class PublicSiteSettingSerializer(serializers.ModelSerializer):
    """
    The storefront-safe subset. Excludes internal fields like the
    admin notification email — that should never be exposed
    publicly.
    """

    class Meta:
        model = SiteSetting
        fields = (
            "app_name",
            "email_address",
            "phone_number",
            "hotline_number",
            "currency_name",
            "currency_symbol",
            "delivery_charge",
            "facebook_url",
            "instagram_url",
            "twitter_url",
            "youtube_url",
            "linkedin_url",
            "privacy_policy_link",
            "terms_conditions_link",
            "service_hours",
            "physical_address",
            "google_map_embed_url",
        )


class AdminSiteSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSetting
        exclude = ("id",)
        read_only_fields = ("updated_at",)
