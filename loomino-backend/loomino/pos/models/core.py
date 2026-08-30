from django.conf import settings
from django.db import models

from ..roles import POSRole
from ..role_matrix import ROLE_PERMISSIONS


class StockAccountingMethod(models.TextChoices):
    FIFO = "fifo", "FIFO (First In First Out)"
    LIFO = "lifo", "LIFO (Last In First Out)"
    AVERAGE = "average", "Weighted Average"


class CurrencySymbolPlacement(models.TextChoices):
    BEFORE = "before", "Before amount"
    AFTER = "after", "After amount"


class DateFormat(models.TextChoices):
    DMY_DASH = "dd-mm-yyyy", "dd-mm-yyyy"
    MDY_SLASH = "mm/dd/yyyy", "mm/dd/yyyy"
    YMD_DASH = "yyyy-mm-dd", "yyyy-mm-dd"


class TimeFormat(models.TextChoices):
    H12 = "12h", "12 Hour"
    H24 = "24h", "24 Hour"


class ReceiptPaperWidth(models.TextChoices):
    MM58 = "58mm", "Thermal 58mm"
    MM80 = "80mm", "Thermal 80mm"
    A4 = "a4", "A4 / Letter"


class Business(models.Model):
    """
    Singleton POS settings record. Deliberately holds nothing that
    says "Loomino" anywhere -- rebranding this system for a new
    client is a data edit here, not a code change.

    Enforced as a singleton via save()/get_solo(); there is always
    exactly one row, pk=1.

    stock_accounting_method is stored as a configured preference but
    NOT actually enforced -- this system prices stock with a single
    pooled purchase/selling price per variant, not true lot-level
    FIFO/LIFO/average costing (see the Items Report scoping
    conversation). Selecting a method here doesn't change how
    Purchases/Sales compute cost today; it's ready for when that's
    built. date_format/time_format are similarly a stored preference
    -- applied where the frontend already reads them, not yet
    guaranteed to be threaded through every date display in the app.
    """

    name = models.CharField(max_length=150, default="My Business")
    logo = models.ImageField(upload_to="pos/business/", blank=True, null=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)

    currency_code = models.CharField(max_length=10, default="BDT")
    currency_symbol = models.CharField(max_length=5, default="\u09f3")  # ৳
    currency_symbol_placement = models.CharField(
        max_length=10, choices=CurrencySymbolPlacement.choices, default=CurrencySymbolPlacement.BEFORE
    )
    timezone = models.CharField(max_length=50, default="Asia/Dhaka")

    # Month (1-12) the fiscal year starts on. 1 = Jan-Dec, matching
    # the reference dashboard's "Sales Current Financial Year" chart.
    fiscal_year_start_month = models.PositiveSmallIntegerField(default=1)

    default_profit_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    stock_accounting_method = models.CharField(
        max_length=10, choices=StockAccountingMethod.choices, default=StockAccountingMethod.FIFO
    )
    transaction_edit_days = models.PositiveIntegerField(
        default=30, help_text="Not yet enforced -- stored for when transaction editing is built."
    )
    date_format = models.CharField(
        max_length=10, choices=DateFormat.choices, default=DateFormat.DMY_DASH
    )
    time_format = models.CharField(
        max_length=3, choices=TimeFormat.choices, default=TimeFormat.H12
    )

    low_stock_alert_enabled = models.BooleanField(default=True)
    stock_expiry_alert_days = models.PositiveIntegerField(
        default=30,
        help_text="Batches expiring within this many days show on the Stock Expiry Alert widget.",
    )

    receipt_paper_width = models.CharField(
        max_length=5,
        choices=ReceiptPaperWidth.choices,
        default=ReceiptPaperWidth.MM80,
        help_text="Drives the print CSS width for customer/seller receipts.",
    )
    receipt_footer_text = models.CharField(
        max_length=255, blank=True, help_text="e.g. 'Thank you for shopping with us!'"
    )
    receipt_show_logo = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Business Settings"
        verbose_name_plural = "Business Settings"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass  # singleton row is never deleted

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return self.name


class Location(models.Model):
    """A branch / outlet / warehouse. Stock is always tracked per Location."""

    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name="locations"
    )

    name = models.CharField(max_length=150, unique=True)
    location_id = models.CharField(
        max_length=50, blank=True, help_text="Optional external/legacy code for this branch."
    )
    landmark = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class POSStaffProfile(models.Model):
    """
    Links an existing accounts.User to the POS system with a fixed
    role. A user with no POSStaffProfile has no POS access at all --
    e-commerce admin status on the same account is irrelevant here,
    and vice versa, by design (see POSRoute on the frontend).
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="pos_profile",
    )

    role = models.CharField(max_length=20, choices=POSRole.choices)

    locations = models.ManyToManyField(
        Location,
        related_name="staff",
        blank=True,
        help_text="Locations this user is permitted to operate in. Admins may still be scoped.",
    )

    phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "POS Staff Profile"

    def __str__(self):
        return f"{self.user.email} ({self.get_role_display()})"

    def _has_perm(self, key):
        return key in ROLE_PERMISSIONS.get(self.role, set())

    # --- fixed permission matrix -------------------------------------
    # Cashier: Sell, Contacts (customers), read-only Products/Stock.
    # Manager: everything except User Management and Settings.
    # Admin: everything.
    # Backed by pos.role_matrix.ROLE_PERMISSIONS -- the single source
    # of truth also used by the read-only Roles reference page.

    @property
    def can_manage_users(self):
        return self._has_perm("can_manage_users")

    @property
    def can_manage_settings(self):
        return self._has_perm("can_manage_settings")

    @property
    def can_manage_purchases(self):
        return self._has_perm("can_manage_purchases")

    @property
    def can_manage_stock_adjustments(self):
        return self._has_perm("can_manage_stock_adjustments")

    @property
    def can_manage_expenses(self):
        return self._has_perm("can_manage_expenses")

    @property
    def can_edit_products(self):
        return self._has_perm("can_edit_products")

    @property
    def can_sell(self):
        return self._has_perm("can_sell")

    @property
    def can_manage_contacts(self):
        return self._has_perm("can_manage_contacts")

    @property
    def can_view_reports(self):
        return self._has_perm("can_view_reports")


class DocumentType(models.TextChoices):
    PURCHASE = "purchase", "Purchase"
    PURCHASE_RETURN = "purchase_return", "Purchase Return"
    SALE_FINAL = "sale_final", "Sale (Final)"
    SALE_DRAFT = "sale_draft", "Sale Draft"
    SALE_QUOTATION = "sale_quotation", "Quotation"
    SALE_SUSPENDED = "sale_suspended", "Suspended Sale"
    SALE_RETURN = "sale_return", "Sell Return"
    STOCK_ADJUSTMENT = "stock_adjustment", "Stock Adjustment"
    EXPENSE = "expense", "Expense"
    PURCHASE_PAYMENT = "purchase_payment", "Purchase Payment"
    SALE_PAYMENT = "sale_payment", "Sale Payment"
    CONTACT = "contact", "Contact Code"
    PRODUCT_SKU = "product_sku", "Product SKU"


# Fallback used when a business hasn't customized a given document
# type's prefix yet -- so nothing needs to be pre-seeded for every
# business, and existing reference numbers already in the database
# keep meaning what they always meant.
DEFAULT_PREFIXES = {
    DocumentType.PURCHASE: "PO",
    DocumentType.PURCHASE_RETURN: "PR",
    DocumentType.SALE_FINAL: "INV",
    DocumentType.SALE_DRAFT: "DFT",
    DocumentType.SALE_QUOTATION: "QTN",
    DocumentType.SALE_SUSPENDED: "SUS",
    DocumentType.SALE_RETURN: "CN",
    DocumentType.STOCK_ADJUSTMENT: "SA",
    DocumentType.EXPENSE: "EXP",
    DocumentType.PURCHASE_PAYMENT: "PP",
    DocumentType.SALE_PAYMENT: "SP",
    DocumentType.CONTACT: "CO",
    DocumentType.PRODUCT_SKU: "PR",
}


class DocumentPrefix(models.Model):
    """
    One editable row per document type -- Settings > Prefixes. Only
    the prefix letters are configurable; digit-padding width per
    document type is fixed to keep this change contained.
    """

    document_type = models.CharField(max_length=20, choices=DocumentType.choices, unique=True)
    prefix = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.get_document_type_display()}: {self.prefix}"


def get_document_prefix(document_type: str) -> str:
    """
    Looked up by every model's reference-number auto-generation
    instead of a hardcoded literal. One query per call rather than a
    cached lookup -- reference numbers are only generated once per
    document, at creation, so this never runs in a hot loop.
    """
    row = DocumentPrefix.objects.filter(document_type=document_type).first()
    if row:
        return row.prefix
    return DEFAULT_PREFIXES.get(document_type, "")
