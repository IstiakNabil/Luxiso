from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
)
import random
from products.models import Product
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):

    email = models.EmailField(
        unique=True
    )

    first_name = models.CharField(
        max_length=100
    )

    last_name = models.CharField(
        max_length=100
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True
    )

    profile_image = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True
    )

    is_email_verified = models.BooleanField(
        default=False
    )

    is_staff = models.BooleanField(
        default=False
    )

    is_active = models.BooleanField(
        default=True
    )

    date_joined = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    objects = UserManager()

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "first_name",
        "last_name",
    ]

    def __str__(self):
        return self.email

class EmailOTP(models.Model):

    PURPOSE_CHOICES = (
        ("registration", "Registration"),
        ("password_reset", "Password Reset"),
        ("email_change", "Email Change"),
    )

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="customer_profile"
    )

    otp = models.CharField(
        max_length=6
    )

    purpose = models.CharField(
        max_length=20,
        choices=PURPOSE_CHOICES
    )

    is_used = models.BooleanField(
        default=False
    )

    attempts = models.PositiveIntegerField(
        default=0
    )

    expires_at = models.DateTimeField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.user.email} - {self.purpose}"

class CustomerProfile(models.Model):
    GENDER_CHOICES = (
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="email_otps"
    )

    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        blank=True
    )

    date_of_birth = models.DateField(
        blank=True,
        null=True
    )

    loyalty_points = models.PositiveIntegerField(
        default=0
    )

    newsletter_subscription = models.BooleanField(
        default=False
    )

    profile_completed = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.email} Profile"

class Address(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses"
    )

    full_name = models.CharField(
        max_length=150
    )

    phone_number = models.CharField(
        max_length=20
    )

    country = models.CharField(
        max_length=100,
        default="Bangladesh"
    )

    division = models.CharField(
        max_length=100
    )

    district = models.CharField(
        max_length=100
    )

    area = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    postal_code = models.CharField(
        max_length=20
    )

    address_line = models.TextField()

    landmark = models.CharField(
        max_length=255,
        blank=True
    )

    is_default = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.email} - {self.full_name}"

class LoginHistory(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="login_history"
    )

    ip_address = models.GenericIPAddressField()

    device = models.CharField(
        max_length=255,
        blank=True
    )

    browser = models.CharField(
        max_length=255,
        blank=True
    )

    operating_system = models.CharField(
        max_length=255,
        blank=True
    )

    login_time = models.DateTimeField(
        auto_now_add=True
    )

    logout_time = models.DateTimeField(
        blank=True,
        null=True
    )

    successful = models.BooleanField(
        default=True
    )

    def __str__(self):
        return f"{self.user.email} - {self.login_time}"
