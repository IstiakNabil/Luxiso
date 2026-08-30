from django.db import models

from .catalog import POSVariant
from .core import Location, get_document_prefix, DocumentType


class AdjustmentType(models.TextChoices):
    NORMAL = "normal", "Normal"
    ABNORMAL = "abnormal", "Abnormal"


class StockAdjustment(models.Model):
    """
    Normal = stock written off (damage, loss, theft) -- decreases
    StockLevel. Abnormal = a correction upward (stock found that
    wasn't recorded) -- increases it. Saving writes a StockMovement
    per line either way, same pattern as Purchase/Sale/Returns.

    reference_no auto-generates (SA{year}/{seq:04d}) only when left
    blank -- real usage shows plenty of manually-typed reference
    numbers too, so this must stay editable, not forced.
    """

    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="stock_adjustments"
    )
    reference_no = models.CharField(max_length=50, unique=True, blank=True)
    adjustment_date = models.DateTimeField()
    adjustment_type = models.CharField(
        max_length=10, choices=AdjustmentType.choices, default=AdjustmentType.NORMAL
    )

    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_amount_recovered = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    reason = models.TextField(blank=True)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_stock_adjustments_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-adjustment_date", "-id"]

    def __str__(self):
        return self.reference_no

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_no:
            year = self.adjustment_date.year if self.adjustment_date else self.created_at.year
            self.reference_no = f"{get_document_prefix(DocumentType.STOCK_ADJUSTMENT)}{year}/{self.id:04d}"
            super().save(update_fields=["reference_no"])


class StockAdjustmentItem(models.Model):
    stock_adjustment = models.ForeignKey(
        StockAdjustment, on_delete=models.CASCADE, related_name="items"
    )
    variant = models.ForeignKey(POSVariant, on_delete=models.PROTECT)

    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.variant} x{self.quantity}"
