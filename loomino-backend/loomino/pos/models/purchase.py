from django.db import models

from .catalog import POSVariant
from .contacts import Contact
from .core import Location, get_document_prefix, DocumentType
from .lookups import TaxRate


class PurchaseStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    ORDERED = "ordered", "Ordered"
    PARTIAL = "partial", "Partial"
    RECEIVED = "received", "Received"


class PaymentStatus(models.TextChoices):
    DUE = "due", "Due"
    PARTIAL = "partial", "Partial"
    PAID = "paid", "Paid"


class DiscountType(models.TextChoices):
    NONE = "none", "None"
    PERCENTAGE = "percentage", "Percentage"
    FIXED = "fixed", "Fixed"


class PaymentMethod(models.TextChoices):
    CASH = "cash", "Cash"
    CARD = "card", "Card"
    BANK_TRANSFER = "bank_transfer", "Bank Transfer"
    BKASH = "bkash", "bKash"
    NAGAD = "nagad", "Nagad"
    CHEQUE = "cheque", "Cheque"
    OTHER = "other", "Other"


class Purchase(models.Model):
    """
    A full purchase order: line items (see PurchaseItem), order-level
    discount/tax/shipping/other-expenses, and a single payment
    recorded at save time. Saving a Purchase is the point where stock
    actually increases -- see ProductPurchaseCreateView, which writes
    StockLevel/StockMovement rows and optionally updates each
    variant's purchase/selling price and expiry batch in one
    transaction alongside creating these rows.
    """

    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="purchases"
    )
    supplier = models.ForeignKey(
        Contact, on_delete=models.PROTECT, related_name="purchases"
    )

    reference_no = models.CharField(max_length=50, unique=True, blank=True)
    purchase_date = models.DateTimeField()
    pay_term_days = models.PositiveIntegerField(null=True, blank=True)

    status = models.CharField(
        max_length=15, choices=PurchaseStatus.choices, default=PurchaseStatus.PENDING
    )
    payment_status = models.CharField(
        max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.DUE
    )

    attached_document = models.FileField(
        upload_to="pos/purchases/documents/", blank=True, null=True
    )

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    discount_type = models.CharField(
        max_length=10, choices=DiscountType.choices, default=DiscountType.NONE
    )
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        help_text="Raw input: a percentage (0-100) if discount_type=percentage, else a flat amount.",
    )
    discount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, help_text="Computed discount amount."
    )

    tax_rate = models.ForeignKey(
        TaxRate, on_delete=models.SET_NULL, null=True, blank=True, related_name="purchases"
    )
    tax = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, help_text="Computed tax amount."
    )

    shipping_details = models.CharField(max_length=255, blank=True)
    shipping_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    additional_expenses_note = models.CharField(max_length=255, blank=True)
    additional_expenses_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH
    )
    paid_on = models.DateTimeField(null=True, blank=True)
    payment_note = models.TextField(blank=True)

    notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_purchases_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-purchase_date", "-id"]

    def __str__(self):
        return self.reference_no

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_no:
            self.reference_no = f"{get_document_prefix(DocumentType.PURCHASE)}{self.id:05d}"
            super().save(update_fields=["reference_no"])

    @property
    def due_amount(self):
        return self.total - self.paid_amount


class PurchaseItem(models.Model):
    """
    unit_cost is entered before discount; unit_cost_after_discount and
    line_total are computed and stored at save time (not derived on
    every read) so a purchase's totals stay fixed even if the
    variant's price changes later.
    """

    purchase = models.ForeignKey(
        Purchase, on_delete=models.CASCADE, related_name="items"
    )
    variant = models.ForeignKey(POSVariant, on_delete=models.PROTECT)

    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    discount_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    unit_cost_after_discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    line_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # If provided, this purchase also updates the variant's selling
    # price going forward -- matches the reference form's inline
    # "Unit Selling Price" column.
    selling_price = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True
    )

    mfg_date = models.DateField(null=True, blank=True)
    exp_date = models.DateField(null=True, blank=True)

    # Kept for backward compatibility with earlier code/tests that
    # reference PurchaseItem.subtotal; always equal to line_total.
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.variant} x{self.quantity}"


class PurchaseReturn(models.Model):
    """
    Powers the Total Purchase Return dashboard card and the List
    Purchase Return page. Creating one selects specific items/
    quantities from an existing Purchase (see PurchaseReturnItem) --
    saving decreases stock and writes a StockMovement, the reverse of
    what the original Purchase did.
    """

    reference_no = models.CharField(max_length=50, unique=True, blank=True)
    purchase = models.ForeignKey(
        Purchase, on_delete=models.PROTECT, related_name="returns"
    )
    location = models.ForeignKey(Location, on_delete=models.PROTECT)

    return_date = models.DateField()
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status = models.CharField(
        max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.DUE
    )
    reason = models.TextField(blank=True)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_purchase_returns_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-return_date", "-id"]

    def __str__(self):
        return f"Return on {self.purchase.reference_no}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_no:
            self.reference_no = f"{get_document_prefix(DocumentType.PURCHASE_RETURN)}{self.id:05d}"
            super().save(update_fields=["reference_no"])

    @property
    def due_amount(self):
        return self.total - self.paid_amount


class PurchaseReturnItem(models.Model):
    """
    One returned line. unit_cost defaults to the original
    PurchaseItem's unit_cost_after_discount when creating a return,
    but is stored independently so a return's total stays fixed even
    if the original purchase item is later changed.
    """

    purchase_return = models.ForeignKey(
        PurchaseReturn, on_delete=models.CASCADE, related_name="items"
    )
    variant = models.ForeignKey(POSVariant, on_delete=models.PROTECT)

    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_cost = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.variant} x{self.quantity}"
