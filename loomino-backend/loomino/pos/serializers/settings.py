from rest_framework import serializers

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
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value


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
