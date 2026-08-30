from django.db import models
from django.conf import settings

from products.models import Product

STATUS_PENDING = "pending"
STATUS_PUBLISHED = "published"
STATUS_REJECTED = "rejected"

STATUS_CHOICES = (
    (STATUS_PENDING, "Pending"),
    (STATUS_PUBLISHED, "Published"),
    (STATUS_REJECTED, "Rejected"),
)

class Review(models.Model):

    STATUS_PENDING = STATUS_PENDING
    STATUS_PUBLISHED = STATUS_PUBLISHED
    STATUS_REJECTED = STATUS_REJECTED

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )

    RATING_CHOICES = (
        (1, "1 Star"),
        (2, "2 Stars"),
        (3, "3 Stars"),
        (4, "4 Stars"),
        (5, "5 Stars"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews"
    )

    rating = models.PositiveSmallIntegerField(
        choices=RATING_CHOICES
    )

    title = models.CharField(
        max_length=255
    )

    review = models.TextField()

    is_verified_purchase = models.BooleanField(
        default=False
    )

    is_approved = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product"],
                name="unique_user_product_review",
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.product.name}"