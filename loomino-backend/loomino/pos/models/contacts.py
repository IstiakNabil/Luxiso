from django.db import models

from .core import get_document_prefix, DocumentType


class ContactType(models.TextChoices):
    CUSTOMER = "customer", "Customer"
    SUPPLIER = "supplier", "Supplier"
    BOTH = "both", "Both"


class CustomerGroup(models.Model):
    """Simple grouping for customers (e.g. VIP, Wholesale) -- filterable, no pricing logic yet."""

    name = models.CharField(max_length=100, unique=True)
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Contact(models.Model):
    """
    Customers and suppliers for the POS. Independent from
    accounts.User/CustomerProfile on purpose -- POS walk-in customers
    are not website accounts.

    Purchase.supplier is PROTECT; Sale.customer is SET_NULL (to allow
    walk-in sales with no customer at all), so the API layer checks
    for sale history explicitly before allowing a delete -- see
    ContactDetailView.delete().
    """

    contact_code = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        help_text="Auto-generated on save if left blank (e.g. CO0001).",
    )
    contact_type = models.CharField(max_length=10, choices=ContactType.choices)

    name = models.CharField(max_length=150)
    business_name = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True, default="Bangladesh")

    tax_number = models.CharField(max_length=50, blank=True)

    customer_group = models.ForeignKey(
        CustomerGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contacts",
    )

    # Credit limit is only meaningful for customers/both -- 0 means
    # "no limit enforced", not "no credit allowed".
    credit_limit = models.DecimalField(
        max_digits=12, decimal_places=2, default=0, blank=True
    )
    pay_term_days = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Payment due within this many days of invoice/purchase. Blank = no term.",
    )
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # Wallet-style credit from overpayments. Manually adjustable for
    # now -- there's no per-payment ledger yet to derive this from
    # automatically; that lands when Purchases/Sell get full payment
    # tracking.
    advance_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    custom_field_1 = models.CharField(max_length=255, blank=True)
    custom_field_2 = models.CharField(max_length=255, blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.contact_code:
            # Uniform "CO" prefix regardless of type -- matches the
            # reference system, which doesn't distinguish customer vs
            # supplier in the code itself.
            self.contact_code = f"{get_document_prefix(DocumentType.CONTACT)}{self.id:04d}"
            super().save(update_fields=["contact_code"])
