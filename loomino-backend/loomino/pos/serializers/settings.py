from rest_framework import serializers
from django.db import transaction

from ..models import Business, Location, DocumentPrefix, DocumentType, DEFAULT_PREFIXES


class BusinessSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = [
            "id",
            "name",
            "logo",
            "email",
            "phone",
            "address",
            "start_date",
            "currency_code",
            "currency_symbol",
            "currency_symbol_placement",
            "timezone",
            "fiscal_year_start_month",
            "default_profit_percent",
            "stock_accounting_method",
            "transaction_edit_days",
            "date_format",
            "time_format",
            "low_stock_alert_enabled",
            "stock_expiry_alert_days",
            "receipt_paper_width",
            "receipt_footer_text",
            "receipt_show_logo",
        ]
        read_only_fields = ["id"]


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = [
            "id",
            "name",
            "location_id",
            "landmark",
            "city",
            "zip_code",
            "state",
            "country",
            "address",
            "phone",
            "is_active",
            "is_online_channel",
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value

    def _apply_online_channel(self, business, exclude_pk=None):
        """Only one Location can be the online channel -- unset it on
        every other Location for this business *before* this row is
        saved with the flag on, since the DB's unique constraint is
        checked immediately per-statement, not deferred. Doing this
        after would briefly leave two rows flagged and fail."""
        qs = Location.objects.filter(business=business, is_online_channel=True)
        if exclude_pk is not None:
            qs = qs.exclude(pk=exclude_pk)
        qs.update(is_online_channel=False)

    def create(self, validated_data):
        with transaction.atomic():
            if validated_data.get("is_online_channel"):
                self._apply_online_channel(validated_data["business"])
            instance = super().create(validated_data)
        return instance

    def update(self, instance, validated_data):
        with transaction.atomic():
            if validated_data.get("is_online_channel"):
                self._apply_online_channel(instance.business, exclude_pk=instance.pk)
            instance = super().update(instance, validated_data)
        return instance


class DocumentPrefixSerializer(serializers.Serializer):
    """
    One row per DocumentType -- built from a plain dict since the
    effective prefix is either a saved DocumentPrefix row or the
    hardcoded default, not always a real model instance.
    """

    document_type = serializers.CharField()
    document_type_display = serializers.CharField()
    prefix = serializers.CharField()
    is_customized = serializers.BooleanField()

    @staticmethod
    def build_all():
        saved = {row.document_type: row.prefix for row in DocumentPrefix.objects.all()}
        return [
            {
                "document_type": dt.value,
                "document_type_display": dt.label,
                "prefix": saved.get(dt.value, DEFAULT_PREFIXES[dt]),
                "is_customized": dt.value in saved,
            }
            for dt in DocumentType
        ]
