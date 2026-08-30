from rest_framework import serializers

from .models import NewsletterSubscriber


# ============================================================
# PUBLIC — Newsletter Subscription
# ============================================================

class NewsletterSubscribeSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = NewsletterSubscriber

        fields = (

            "email",

        )

    def validate_email(
        self,
        value,
    ):

        return value.strip().lower()


# ============================================================
# ADMIN — Newsletter Subscriber
# ============================================================

class AdminNewsletterSubscriberSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = NewsletterSubscriber

        fields = (

            "id",

            "email",

            "subscribed_at",

        )

        read_only_fields = (

            "id",

            "email",

            "subscribed_at",

        )