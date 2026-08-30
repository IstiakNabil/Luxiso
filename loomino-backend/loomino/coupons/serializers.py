from rest_framework import serializers
from django.utils import timezone
from rest_framework import serializers

from .models import Coupon

class ApplyCouponSerializer(serializers.Serializer):

    code = serializers.CharField(
        max_length=50
    )

    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2
    )

# ============================================================
# ADMIN — Coupon CRUD
# ============================================================

class AdminCouponSerializer(serializers.ModelSerializer):

    type = serializers.ChoiceField(
        choices=(
            ("percent", "Percent"),
            ("fixed", "Fixed"),
        ),
        write_only=True,
    )

    value = serializers.DecimalField(
        source="discount_value",
        max_digits=10,
        decimal_places=2,
    )

    cart_min_value = serializers.DecimalField(
        source="minimum_order_amount",
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True,
    )

    expiry_date = serializers.DateTimeField(
        source="valid_until",
    )

    status = serializers.SerializerMethodField()

    class Meta:

        model = Coupon

        fields = (

            "id",

            "code",

            "description",

            "type",

            "value",

            "cart_min_value",

            "maximum_discount_amount",

            "usage_limit",

            "used_count",

            "is_active",

            "status",

            "valid_from",

            "expiry_date",

            "created_at",

            "updated_at",

        )

        read_only_fields = (

            "id",

            "used_count",

            "status",

            "created_at",

            "updated_at",

        )

    def to_representation(self, instance):

        representation = super().to_representation(
            instance
        )

        representation["type"] = (
            "percent"
            if instance.discount_type == "percentage"
            else "fixed"
        )

        return representation

    def get_status(self, obj):

        now = timezone.now()

        if not obj.is_active:
            return "inactive"

        if obj.valid_until < now:
            return "expired"

        if obj.valid_from > now:
            return "scheduled"

        if obj.used_count >= obj.usage_limit:
            return "usage_limit_reached"

        return "active"

    def validate_code(self, value):

        return value.strip().upper()

    def validate_value(self, value):

        if value <= 0:

            raise serializers.ValidationError(
                "Coupon value must be greater than zero."
            )

        return value

    def validate_cart_min_value(self, value):

        if value is not None and value < 0:

            raise serializers.ValidationError(
                "Minimum cart value cannot be negative."
            )

        return value

    def validate(self, attrs):

        api_type = attrs.pop(
            "type",
            None,
        )

        if api_type is not None:

            attrs["discount_type"] = (
                "percentage"
                if api_type == "percent"
                else "fixed"
            )

        discount_type = attrs.get(
            "discount_type",
            getattr(
                self.instance,
                "discount_type",
                None,
            ),
        )

        discount_value = attrs.get(
            "discount_value",
            getattr(
                self.instance,
                "discount_value",
                None,
            ),
        )

        valid_from = attrs.get(
            "valid_from",
            getattr(
                self.instance,
                "valid_from",
                None,
            ),
        )

        valid_until = attrs.get(
            "valid_until",
            getattr(
                self.instance,
                "valid_until",
                None,
            ),
        )

        usage_limit = attrs.get(
            "usage_limit",
            getattr(
                self.instance,
                "usage_limit",
                None,
            ),
        )

        if (
            discount_type == "percentage"
            and discount_value is not None
            and discount_value > 100
        ):

            raise serializers.ValidationError(
                {
                    "value": (
                        "Percentage discount cannot "
                        "be greater than 100."
                    )
                }
            )

        if (
            valid_from is not None
            and valid_until is not None
            and valid_until <= valid_from
        ):

            raise serializers.ValidationError(
                {
                    "expiry_date": (
                        "Expiry date must be later "
                        "than the valid-from date."
                    )
                }
            )

        if (
            usage_limit is not None
            and usage_limit < 1
        ):

            raise serializers.ValidationError(
                {
                    "usage_limit": (
                        "Usage limit must be at least 1."
                    )
                }
            )

        return attrs