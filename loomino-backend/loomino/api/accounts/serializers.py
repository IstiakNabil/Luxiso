from rest_framework import serializers
import random
from django.utils import timezone
from datetime import timedelta
from django.core.mail import send_mail
from accounts.models import EmailOTP
from accounts.models import User, Address
from rest_framework_simplejwt.tokens import RefreshToken
from api.products.serializers import ProductListSerializer


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    confirm_password = serializers.CharField(
        write_only=True,
    )

    class Meta:

        model = User

        fields = (
            "email",
            "first_name",
            "last_name",
            "password",
            "confirm_password",
        )

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:

            raise serializers.ValidationError(
                {
                    "password": "Passwords do not match."
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        otp = str(random.randint(100000, 999999))

        EmailOTP.objects.update_or_create(
            user=user,
            defaults={
                "otp": otp,
                "purpose": "registration",
                "expires_at": timezone.now() + timedelta(minutes=10),
                "is_used": False,
                "attempts": 0,
            }
        )

        send_mail(
            subject="Loomino Email Verification",
            message=f"Your verification code is: {otp}",
            from_email=None,
            recipient_list=[user.email],
        )

        return user

class VerifyEmailSerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(
        max_length=6
    )

    def validate(self, attrs):

        try:
            user = User.objects.get(
                email=attrs["email"]
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "email": "User not found."
                }
            )

        try:
            email_otp = EmailOTP.objects.get(
                user=user,
                purpose="registration",
                is_used=False,
            )

        except EmailOTP.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "otp": "Invalid OTP."
                }
            )

        if email_otp.expires_at < timezone.now():

            raise serializers.ValidationError(
                {
                    "otp": "OTP has expired."
                }
            )

        if email_otp.otp != attrs["otp"]:

            email_otp.attempts += 1
            email_otp.save()

            raise serializers.ValidationError(
                {
                    "otp": "Incorrect OTP."
                }
            )

        attrs["user"] = user
        attrs["email_otp"] = email_otp

        return attrs

    def save(self):

        user = self.validated_data["user"]

        email_otp = self.validated_data["email_otp"]

        user.is_email_verified = True
        user.save()

        email_otp.is_used = True
        email_otp.save()

        return user
class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            raise serializers.ValidationError(
                {
                    "message": "Invalid email or password."
                }
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                {
                    "message": "Invalid email or password."
                }
            )

        if not user.is_active:
            raise serializers.ValidationError(
                {
                    "message": "This account is inactive."
                }
            )

        if not user.is_email_verified:
            raise serializers.ValidationError(
                {
                    "message": "Please verify your email first."
                }
            )

        refresh = RefreshToken.for_user(user)

        attrs["user"] = user
        attrs["refresh"] = str(refresh)
        attrs["access"] = str(refresh.access_token)

        return attrs


class LogoutSerializer(serializers.Serializer):

    refresh = serializers.CharField()

    def save(self):

        try:
            token = RefreshToken(
                self.validated_data["refresh"]
            )

            token.blacklist()

        except Exception:

            raise serializers.ValidationError(
                {
                    "message": "Invalid refresh token."
                }
            )

class ForgotPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate(self, attrs):

        try:
            user = User.objects.get(
                email=attrs["email"]
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "email": "No account found with this email."
                }
            )

        attrs["user"] = user

        return attrs

    def save(self):

        user = self.validated_data["user"]

        otp = str(random.randint(100000, 999999))

        EmailOTP.objects.update_or_create(

            user=user,

            defaults={

                "otp": otp,

                "purpose": "password_reset",

                "expires_at": timezone.now() + timedelta(minutes=10),

                "is_used": False,

                "attempts": 0,

            }

        )

        send_mail(

            subject="Loomino Password Reset",

            message=f"Your password reset OTP is: {otp}",

            from_email=None,

            recipient_list=[user.email],

        )

        return user

class ResetPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(
        max_length=6
    )

    password = serializers.CharField(
        min_length=8,
        write_only=True
    )

    confirm_password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:

            raise serializers.ValidationError(
                {
                    "password": "Passwords do not match."
                }
            )

        try:

            user = User.objects.get(
                email=attrs["email"]
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "email": "User not found."
                }
            )

        try:

            email_otp = EmailOTP.objects.get(
                user=user,
                purpose="password_reset",
                is_used=False,
            )

        except EmailOTP.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "otp": "Invalid OTP."
                }
            )

        if email_otp.expires_at < timezone.now():

            raise serializers.ValidationError(
                {
                    "otp": "OTP has expired."
                }
            )

        if email_otp.otp != attrs["otp"]:

            email_otp.attempts += 1
            email_otp.save()

            raise serializers.ValidationError(
                {
                    "otp": "Incorrect OTP."
                }
            )

        attrs["user"] = user
        attrs["email_otp"] = email_otp

        return attrs

    def save(self):

        user = self.validated_data["user"]

        email_otp = self.validated_data["email_otp"]

        user.set_password(
            self.validated_data["password"]
        )

        user.save()

        email_otp.is_used = True
        email_otp.save()

        return user

class ResendOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate(self, attrs):

        try:
            user = User.objects.get(
                email=attrs["email"]
            )

        except User.DoesNotExist:

            raise serializers.ValidationError(
                {
                    "email": "User not found."
                }
            )

        if user.is_email_verified:

            raise serializers.ValidationError(
                {
                    "message": "Email is already verified."
                }
            )

        attrs["user"] = user

        return attrs

    def save(self):

        user = self.validated_data["user"]

        otp = str(random.randint(100000, 999999))

        EmailOTP.objects.update_or_create(

            user=user,

            defaults={

                "otp": otp,

                "purpose": "registration",

                "expires_at": timezone.now() + timedelta(minutes=10),

                "is_used": False,

                "attempts": 0,

            }

        )

        send_mail(

            subject="Loomino Email Verification",

            message=f"Your new verification code is: {otp}",

            from_email=None,

            recipient_list=[user.email],

        )

        return user

class ProfileSerializer(serializers.ModelSerializer):

    is_staff = serializers.BooleanField(
        read_only=True
    )

    is_superuser = serializers.BooleanField(
        read_only=True
    )

    class Meta:
        model = User

        fields = (
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "date_joined",
            "is_email_verified",
            "is_staff",
            "is_superuser",
        )

        read_only_fields = (
            "email",
            "date_joined",
            "is_email_verified",
            "is_staff",
            "is_superuser",
        )

class AddressSerializer(serializers.ModelSerializer):

    class Meta:

        model = Address

        fields = (

            "id",

            "full_name",

            "phone_number",

            "country",

            "division",

            "district",

            "area",

            "postal_code",

            "address_line",

            "landmark",

            "is_default",

            "created_at",

        )

        read_only_fields = (

            "id",

            "is_default",

            "created_at",

        )
