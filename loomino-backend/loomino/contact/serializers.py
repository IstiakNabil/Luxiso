from rest_framework import serializers

from .models import ContactMessage


# ============================================================
# PUBLIC — Submit Contact Message
# ============================================================

class ContactMessageCreateSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = ContactMessage

        fields = (

            "sender_name",

            "sender_email",

            "phone",

            "subject",

            "message",

        )

    def validate_sender_name(
        self,
        value,
    ):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Name is required."
            )

        return value

    def validate_subject(
        self,
        value,
    ):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Subject is required."
            )

        return value

    def validate_message(
        self,
        value,
    ):

        value = value.strip()

        if not value:

            raise serializers.ValidationError(
                "Message is required."
            )

        return value


# ============================================================
# ADMIN — Contact Message List
# ============================================================

class AdminContactMessageSerializer(
    serializers.ModelSerializer
):

    sender = serializers.SerializerMethodField()

    message_snippet = serializers.SerializerMethodField()

    class Meta:

        model = ContactMessage

        fields = (

            "id",

            "sender",

            "subject",

            "message_snippet",

            "created_at",

        )

        read_only_fields = fields

    def get_sender(
        self,
        obj,
    ):

        return {

            "name": obj.sender_name,

            "email": obj.sender_email,

            "phone": (
                obj.phone
                if obj.phone
                else None
            ),

        }

    def get_message_snippet(
        self,
        obj,
    ):

        if len(obj.message) <= 150:

            return obj.message

        return (
            obj.message[:150].rstrip()
            + "..."
        )