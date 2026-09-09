from django.db import models
from django.utils.text import slugify

from .core import Location
from .units import Unit
from .lookups import Category, Brand, TaxRate
from products.models import Color, Size, Category as StorefrontCategory, ProductType


class BarcodeType(models.TextChoices):
    C128 = "c128", "Code 128 (C128)"
    C39 = "c39", "Code 39 (C39)"
    EAN13 = "ean13", "EAN-13"
    EAN8 = "ean8", "EAN-8"
    UPCA = "upca", "UPC-A"
    UPCE = "upce", "UPC-E"


class POSProduct(models.Model):
    """
    In-store product catalog. Entirely separate from products.Product
    (the online storefront) -- no shared stock, no sync.

    "Single" vs "Variable" isn't a stored field -- it's derived from
    has_variants (see product_type property), same underlying model
    either way so Purchase/Sale/Stock never need to branch on it.

    `locations` (which branches sell this at all) is deliberately
    separate from StockLevel (how much is actually in stock at each
    branch) -- tagging a product to a location here doesn't imply any
    stock exists yet. Real quantities arrive via Purchases, Stock
    Adjustments, or Import Opening Stock, not at product-creation time.
    """

    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    barcode_type = models.CharField(
        max_length=10, choices=BarcodeType.choices, default=BarcodeType.C128
    )
    unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="products",
        help_text="Every product should have a unit; nullable only for skeleton/legacy rows.",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    subcategory = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sub_products",
        help_text="Must be a subcategory of `category`, if set.",
    )
    brand = models.ForeignKey(
        Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name="products"
    )
    tax_rate = models.ForeignKey(
        TaxRate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    locations = models.ManyToManyField(
        Location,
        related_name="available_products",
        blank=True,
        help_text="Which branches sell this product -- not a stock quantity.",
    )

    image = models.ImageField(upload_to="pos/products/", blank=True, null=True)
    brochure = models.FileField(upload_to="pos/products/brochures/", blank=True, null=True)

    description = models.TextField(blank=True)
    weight = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)

    has_variants = models.BooleanField(default=False)

    manage_stock = models.BooleanField(
        default=True,
        help_text="Off for services/items that don't need stock tracking at all.",
    )
    enable_serial_tracking = models.BooleanField(
        default=False,
        help_text="Capture a description/IMEI/serial number per unit sold (used by Sell later).",
    )

    # Fallback alert threshold if a variant doesn't set its own.
    alert_quantity = models.DecimalField(
        max_digits=12, decimal_places=2, default=0
    )

    custom_field_1 = models.CharField(max_length=255, blank=True)
    custom_field_2 = models.CharField(max_length=255, blank=True)
    custom_field_3 = models.CharField(max_length=255, blank=True)
    custom_field_4 = models.CharField(max_length=255, blank=True)

    not_for_selling = models.BooleanField(
        default=False,
        help_text="Raw material / internal-use item -- excluded from the Sell screen.",
    )

    is_active = models.BooleanField(default=True)

    # --- Online storefront fields ---------------------------------
    # POS is the only place a product is created; when publish_online
    # is on, this row is mirrored into products.Product/ProductVariant
    # (see core.stock_service / the storefront sync helper) so the
    # storefront never has its own product-creation path.
    slug = models.SlugField(max_length=255, unique=True, null=True, blank=True)

    publish_online = models.BooleanField(
        default=True,
        help_text="If on, this product (and its variants) is created/kept in sync on the storefront.",
    )

    # Deliberately separate from `category`/`brand` above -- those
    # drive internal POS reporting; these drive storefront browsing
    # (Shop All filters), which uses a different taxonomy.
    storefront_category = models.ForeignKey(
        StorefrontCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_products",
    )
    storefront_type = models.ForeignKey(
        ProductType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_products",
    )

    short_description = models.CharField(max_length=300, blank=True)
    fitting = models.TextField(blank=True)
    fabric_and_care = models.TextField(blank=True)
    shipping_and_return = models.TextField(blank=True)

    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_on_sale = models.BooleanField(default=False)

    online_discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="If set, shown/charged online instead of the variant's selling_price.",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def product_type(self):
        return "Variable" if self.has_variants else "Single"


class POSProductImage(models.Model):
    """Storefront gallery images for a POSProduct. Separate from the
    single `POSProduct.image` field (used as the internal POS/receipt
    thumbnail) so adding online gallery photos doesn't disturb it."""

    IMAGE_TYPES = (
        ("cover", "Cover"),
        ("hover", "Hover"),
        ("gallery", "Gallery"),
    )

    product = models.ForeignKey(POSProduct, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="pos/products/gallery/")
    image_type = models.CharField(max_length=20, choices=IMAGE_TYPES, default="gallery")
    display_order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order"]

    def __str__(self):
        return f"{self.product.name} - {self.image_type}"


class POSProductFeature(models.Model):
    """Storefront bullet-point features for a POSProduct."""

    product = models.ForeignKey(POSProduct, on_delete=models.CASCADE, related_name="features")
    feature = models.CharField(max_length=255)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order"]

    def __str__(self):
        return f"{self.product.name} - {self.feature}"


def ean13_check_digit(twelve_digits: str) -> str:
    """
    EAN-13's mandatory 13th digit. Digits in odd positions (1st, 3rd,
    ... 1-indexed) are weighted 1 and even positions weighted 3; the
    check digit is whatever brings the weighted sum up to a multiple
    of 10. Get this wrong and no scanner in the world reads the
    barcode, so it's computed here rather than guessed.
    """
    if len(twelve_digits) != 12 or not twelve_digits.isdigit():
        raise ValueError("EAN-13 body must be exactly 12 digits.")
    total = 0
    for index, char in enumerate(twelve_digits):
        weight = 1 if index % 2 == 0 else 3
        total += int(char) * weight
    return str((10 - (total % 10)) % 10)


def build_internal_ean13(variant_id: int) -> str:
    """
    GS1 reserves prefixes 20-29 for in-store ("restricted
    distribution") barcodes -- codes a shop generates for its own
    products that are never sold through another retailer. Using 20
    here keeps these from ever colliding with a real manufacturer's
    barcode.
    """
    body = f"20{variant_id:010d}"
    return body + ean13_check_digit(body)


class POSVariant(models.Model):
    """
    Every POSProduct has at least one variant, even non-variant items
    (variant_name left blank), so Purchase/Sale/Stock always point at
    a variant -- mirrors the online store's Product/ProductVariant
    split and keeps the stock/pricing tables uniform.

    variant_name stays the free-text display label ("Red / M"). The
    optional `size`/`color` columns exist so a structured breakdown
    can be adopted later without redesigning anything -- nothing
    reads them yet; variant_name remains the source of truth for
    display.
    """

    product = models.ForeignKey(
        POSProduct, on_delete=models.CASCADE, related_name="variants"
    )

    # Structured color/size -- the same lookup tables the storefront
    # uses for its swatches/dropdowns, so a POS-created variant needs
    # no translation to display correctly online.
    color = models.ForeignKey(
        Color, on_delete=models.PROTECT, null=True, blank=True, related_name="pos_variants"
    )
    size = models.ForeignKey(
        Size, on_delete=models.PROTECT, null=True, blank=True, related_name="pos_variants"
    )
    variant_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Optional free-text override label -- for non-fashion/no-variant items only.",
    )
    sku = models.CharField(max_length=100, unique=True)
    barcode = models.CharField(
        max_length=13,
        blank=True,
        unique=True,
        null=True,
        help_text="Auto-generated in-store EAN-13 (GS1 prefix 20). Scannable by any retail scanner.",
    )

    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    selling_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    alert_quantity = models.DecimalField(
        max_digits=12, decimal_places=2, blank=True, null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        # Needs the PK, so it runs after the first save -- same
        # pattern as every reference_no in this app.
        if is_new and not self.barcode:
            self.barcode = build_internal_ean13(self.id)
            super().save(update_fields=["barcode"])

    class Meta:
        ordering = ["product", "color", "size"]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "color", "size"], name="unique_pos_variant_color_size"
            )
        ]

    def __str__(self):
        return self.display_name

    @property
    def display_name(self):
        if self.color_id and self.size_id:
            return f"{self.product.name} - {self.color.name} / {self.size.name}"
        label = self.variant_name or self.product.name
        return f"{self.product.name} - {label}" if self.variant_name else self.product.name

    @property
    def effective_alert_quantity(self):
        return (
            self.alert_quantity
            if self.alert_quantity is not None
            else self.product.alert_quantity
        )


class Batch(models.Model):
    """
    Optional expiry-tracked batch of a variant at a location. Powers
    the Stock Expiry Alert widget. Not every product needs batches --
    quantity here is tracked separately from StockLevel, which is the
    authoritative running total.
    """

    variant = models.ForeignKey(
        POSVariant, on_delete=models.CASCADE, related_name="batches"
    )
    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="batches"
    )

    batch_number = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["expiry_date"]

    def __str__(self):
        return f"{self.variant} - batch {self.batch_number or self.pk}"


class StockLevel(models.Model):
    """
    Authoritative current stock of a variant, shared across every
    location and the online storefront alike -- there's a single
    number per variant, not one per (variant, location). Every
    Purchase, Sale, Stock Adjustment, and online order writes a
    StockMovement row (which still records which Location the
    transaction happened at, for reporting) and updates this single
    running total -- StockLevel is never edited by hand outside that
    flow.
    """

    variant = models.ForeignKey(
        POSVariant, on_delete=models.CASCADE, related_name="stock_levels", unique=True
    )
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["variant"]

    def __str__(self):
        return f"{self.variant}: {self.quantity}"


class StockMovementType(models.TextChoices):
    OPENING_STOCK = "opening_stock", "Opening Stock"
    PURCHASE = "purchase", "Purchase"
    SALE = "sale", "Sale"
    PURCHASE_RETURN = "purchase_return", "Purchase Return"
    SALE_RETURN = "sale_return", "Sale Return"
    ADJUSTMENT_INCREASE = "adjustment_increase", "Adjustment (Increase)"
    ADJUSTMENT_DECREASE = "adjustment_decrease", "Adjustment (Decrease)"
    TRANSFER_IN = "transfer_in", "Transfer In"
    TRANSFER_OUT = "transfer_out", "Transfer Out"


class StockMovement(models.Model):
    """Immutable ledger row. StockLevel is derived from summing these."""

    variant = models.ForeignKey(
        POSVariant, on_delete=models.CASCADE, related_name="movements"
    )
    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="movements"
    )
    movement_type = models.CharField(max_length=25, choices=StockMovementType.choices)

    # Always stored positive; direction is implied by movement_type.
    quantity = models.DecimalField(max_digits=12, decimal_places=2)

    reference_type = models.CharField(max_length=30, blank=True)
    reference_id = models.PositiveIntegerField(blank=True, null=True)
    note = models.TextField(blank=True)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_stock_movements",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.variant} ({self.quantity})"
