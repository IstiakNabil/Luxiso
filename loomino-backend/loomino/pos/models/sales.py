from django.db import models

from .catalog import POSVariant
from .contacts import Contact
from .core import Location, get_document_prefix, DocumentType
from .lookups import TaxRate
from .purchase import PaymentStatus, DiscountType, PaymentMethod


class SaleStatus(models.TextChoices):
    FINAL = "final", "Final"
    DRAFT = "draft", "Draft"
    QUOTATION = "quotation", "Quotation"
    SUSPENDED = "suspended", "Suspended"


class ShippingStatus(models.TextChoices):
    ORDERED = "ordered", "Ordered"
    PACKED = "packed", "Packed"
    SHIPPED = "shipped", "Shipped"
    DELIVERED = "delivered", "Delivered"
    CANCELLED = "cancelled", "Cancelled"


class Sale(models.Model):
    """
    Covers Add Sale, Add Draft, and Add Quotation -- all three are
    this same model, distinguished only by `status`. A Draft or
    Quotation does NOT move stock (see ProductSaleCreateView); only a
    Final sale does, the mirror image of how Purchase increases it.

    "Sales Order" on the Home dashboard, and the "All Sales"/"List
    Sell Return" pages, all read from here.
    """

    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="sales"
    )
    customer = models.ForeignKey(
        Contact,
        on_delete=models.SET_NULL,
        related_name="sales",
        null=True,
        blank=True,
        help_text="Blank = walk-in customer.",
    )

    invoice_no = models.CharField(max_length=50, unique=True, blank=True)
    sale_date = models.DateTimeField()
    pay_term_days = models.PositiveIntegerField(null=True, blank=True)

    status = models.CharField(
        max_length=15, choices=SaleStatus.choices, default=SaleStatus.FINAL
    )
    shipping_status = models.CharField(
        max_length=15, choices=ShippingStatus.choices, blank=True
    )
    payment_status = models.CharField(
        max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.DUE
    )

    attached_document = models.FileField(
        upload_to="pos/sales/documents/", blank=True, null=True
    )

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    discount_type = models.CharField(
        max_length=10, choices=DiscountType.choices, default=DiscountType.NONE
    )
    discount_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=0,
        help_text="Raw input: a percentage (0-100) if discount_type=percentage, else a flat amount.",
    )
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    tax_rate = models.ForeignKey(
        TaxRate, on_delete=models.SET_NULL, null=True, blank=True, related_name="sales"
    )
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    notes = models.TextField(blank=True)

    shipping_details = models.CharField(max_length=255, blank=True)
    shipping_address = models.TextField(blank=True)
    shipping_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    delivered_to = models.CharField(max_length=150, blank=True)
    shipping_documents = models.FileField(
        upload_to="pos/sales/shipping/", blank=True, null=True
    )

    additional_expenses_note = models.CharField(max_length=255, blank=True)
    additional_expenses_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH
    )
    paid_on = models.DateTimeField(null=True, blank=True)
    payment_note = models.TextField(blank=True)

    total_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipped_quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    added_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_sales_added",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-sale_date", "-id"]

    def __str__(self):
        return self.invoice_no

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.invoice_no:
            document_type = {
                "final": DocumentType.SALE_FINAL,
                "draft": DocumentType.SALE_DRAFT,
                "quotation": DocumentType.SALE_QUOTATION,
                "suspended": DocumentType.SALE_SUSPENDED,
            }.get(self.status, DocumentType.SALE_FINAL)
            self.invoice_no = f"{get_document_prefix(document_type)}{self.id:05d}"
            super().save(update_fields=["invoice_no"])

    @property
    def due_amount(self):
        return self.total - self.paid_amount

    @property
    def quantity_remaining(self):
        return self.total_quantity - self.shipped_quantity

    @property
    def customer_name(self):
        return self.customer.name if self.customer else "Walk-in Customer"

    @property
    def customer_phone(self):
        return self.customer.phone if self.customer else ""


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey(POSVariant, on_delete=models.PROTECT)

    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"{self.variant} x{self.quantity}"


class SaleReturn(models.Model):
    """Mirror of PurchaseReturn -- powers the Total Sell Return dashboard card and List Sell Return."""

    reference_no = models.CharField(max_length=50, unique=True, blank=True)
    sale = models.ForeignKey(Sale, on_delete=models.PROTECT, related_name="returns")
    location = models.ForeignKey(Location, on_delete=models.PROTECT)

    return_date = models.DateTimeField()
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
        related_name="pos_sale_returns_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-return_date", "-id"]

    def __str__(self):
        return f"Return on {self.sale.invoice_no}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_no:
            self.reference_no = f"{get_document_prefix(DocumentType.SALE_RETURN)}{self.id:07d}"
            super().save(update_fields=["reference_no"])

    @property
    def due_amount(self):
        return self.total - self.paid_amount


class SaleReturnItem(models.Model):
    sale_return = models.ForeignKey(
        SaleReturn, on_delete=models.CASCADE, related_name="items"
    )
    variant = models.ForeignKey(POSVariant, on_delete=models.PROTECT)

    quantity = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.variant} x{self.quantity}"
