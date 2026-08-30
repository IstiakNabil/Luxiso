from django.db import models


class Unit(models.Model):
    """
    Measurement unit for products (e.g. Pieces, Kilogram, Gram).
    Must exist before a product can reference it -- this is the first
    Products sub-page for a reason: everything else in Products
    depends on units already being set up.
    """

    name = models.CharField(max_length=50, unique=True)
    short_name = models.CharField(max_length=20)
    allow_decimal = models.BooleanField(
        default=False,
        help_text="Can quantities of this unit be fractional (e.g. 1.5 kg)?",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
