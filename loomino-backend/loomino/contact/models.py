from django.db import models


class ContactMessage(models.Model):

    sender_name = models.CharField(
        max_length=150,
    )

    sender_email = models.EmailField()

    phone = models.CharField(
        max_length=30,
        blank=True,
    )

    subject = models.CharField(
        max_length=255,
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:

        ordering = (
            "-created_at",
        )

    def __str__(self):

        return (
            f"{self.sender_name} - "
            f"{self.subject}"
        )