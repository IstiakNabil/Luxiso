from rest_framework import serializers

from accounts.models import User
from ..models import POSStaffProfile, Location
from ..role_matrix import PERMISSION_LABELS, role_permissions


class AccountSearchResultSerializer(serializers.ModelSerializer):
    """Row shown while searching accounts.User to attach a POS role to."""

    name = serializers.SerializerMethodField()
    has_pos_profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "name", "phone_number", "has_pos_profile"]

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()

    def get_has_pos_profile(self, obj):
        return hasattr(obj, "pos_profile")


class LocationMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id", "name"]


class POSStaffProfileListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.email")
    name = serializers.SerializerMethodField()
    email = serializers.CharField(source="user.email")
    locations = LocationMiniSerializer(many=True, read_only=True)

    class Meta:
        model = POSStaffProfile
        fields = [
            "id",
            "username",
            "name",
            "email",
            "phone",
            "role",
            "role_display",
            "locations",
            "is_active",
        ]

    role_display = serializers.CharField(source="get_role_display", read_only=True)

    def get_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()


class POSStaffProfileDetailSerializer(POSStaffProfileListSerializer):
    user_id = serializers.IntegerField(source="user.id", read_only=True)
    location_ids = serializers.PrimaryKeyRelatedField(
        source="locations", many=True, read_only=True
    )
    permissions = serializers.SerializerMethodField()

    class Meta(POSStaffProfileListSerializer.Meta):
        fields = POSStaffProfileListSerializer.Meta.fields + [
            "user_id",
            "location_ids",
            "permissions",
        ]

    def get_permissions(self, obj):
        return role_permissions(obj.role)


class POSStaffProfileCreateSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    locations = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.filter(is_active=True), many=True, required=False
    )

    class Meta:
        model = POSStaffProfile
        fields = ["user", "role", "locations", "phone", "is_active"]

    def validate_user(self, user):
        if hasattr(user, "pos_profile"):
            raise serializers.ValidationError(
                "This account already has POS access. Edit their existing profile instead."
            )
        return user


class POSStaffProfileUpdateSerializer(serializers.ModelSerializer):
    """
    The `user` link is intentionally not editable here -- reassigning
    a profile to a different account is a delete-and-recreate, not an
    edit, so we don't accidentally hand someone else's role to the
    wrong person via a stray PATCH.
    """

    locations = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.filter(is_active=True), many=True, required=False
    )

    class Meta:
        model = POSStaffProfile
        fields = ["role", "locations", "phone", "is_active"]


class RolePermissionSerializer(serializers.Serializer):
    role = serializers.CharField()
    role_display = serializers.CharField()
    permissions = serializers.SerializerMethodField()

    def get_permissions(self, obj):
        return [
            {"key": key, "label": label, "granted": role_permissions(obj["role"])[key]}
            for key, label in PERMISSION_LABELS.items()
        ]
