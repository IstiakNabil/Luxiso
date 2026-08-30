from django.db import models

from .core import get_document_prefix, DocumentType
from .purchase import Purchase, PaymentMethod
from .sales import Sale


class PurchasePayment(models.Model):
    """
    One payment transaction against a Purchase. Purchase.paid_amount
    is kept as the running total (sum of these) for quick access
    elsewhere (payment_status, due_amount) -- this table is the
    ledger Purchase Payment Report actually reads, since a purchase
    can be paid off in more than one instalment over time.
    """

    purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, related_name="payments")

    reference_no = models.CharField(max_length=50, unique=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_on = models.DateTimeField()
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    # Holds whichever detail applies to the chosen method -- bank
    # account no. for Bank Transfer, transaction no. for bKash/Nagad/
    # Card, cheque no. for Cheque. One generic field rather than one
    # column per method.
    payment_reference = models.CharField(max_length=100, blank=True)
    payment_note = models.TextField(blank=True)
    attached_document = models.FileField(
        upload_to="pos/purchase_payments/", blank=True, null=True
    )

    created_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="pos_purchase_payments_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-paid_on", "-id"]

    def __str__(self):
        return self.reference_no

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_no:
            year = self.paid_on.year if self.paid_on else self.created_at.year
            self.reference_no = f"{get_document_prefix(DocumentType.PURCHASE_PAYMENT)}{year}/{self.id:04d}"
            super().save(update_fields=["reference_no"])


class SalePayment(models.Model):
    """Mirror of PurchasePayment, for Sale."""

    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="payments")

    reference_no = models.CharField(max_length=50, unique=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_on = models.DateTimeField()
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    payment_reference = models.CharField(max_length=100, blank=True)
    payment_note = models.TextField(blank=True)
    attached_document = models.FileField(upload_to="pos/sale_payments/", blank=True, null=True)

    created_by = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True,
        related_name="pos_sale_payments_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-paid_on", "-id"]

    def __str__(self):
        return self.reference_no

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_no:
            year = self.paid_on.year if self.paid_on else self.created_at.year
            self.reference_no = f"{get_document_prefix(DocumentType.SALE_PAYMENT)}{year}/{self.id:04d}"
            super().save(update_fields=["reference_no"])
