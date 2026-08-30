from rest_framework import serializers

from ..models import Unit


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name", "short_name", "allow_decimal"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value

    def validate_short_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Short name is required.")
        return value
