from django.db import models
from django.utils.text import slugify


class Category(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    # Existing image field kept for backward compatibility.
    image = models.ImageField(
        upload_to="categories/",
        blank=True,
        null=True,
    )

    banner_image = models.ImageField(
        upload_to="categories/banners/",
        blank=True,
        null=True,
    )

    icon_image = models.ImageField(
        upload_to="categories/icons/",
        blank=True,
        null=True,
    )

    display_order = models.PositiveIntegerField(
        default=0,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "display_order",
            "name",
        ]

        verbose_name = "Category"
        verbose_name_plural = "Categories"

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(
                self.name
            )

        super().save(
            *args,
            **kwargs
        )

    def __str__(self):

        return self.name

class ProductType(models.Model):
    """
    A clothing/accessory type (e.g. "Shirt", "Jeans", "Punjabi").
    Was originally "Brand" — renamed in place, keeping all
    existing rows, when the storefront filter switched from
    brand-based to type-based browsing.

    A Type can belong to multiple Categories (e.g. "Jeans"
    under both Men and Women), which drives the Shop All
    filter: with no Category selected, all Types show; once a
    Category is selected, only Types linked to it show.
    """

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = models.ImageField(upload_to="brands/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    categories = models.ManyToManyField(
        Category,
        blank=True,
        related_name="types",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Type"
        verbose_name_plural = "Types"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)
    hex_code = models.CharField(max_length=7, unique=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Color"
        verbose_name_plural = "Colors"

    def __str__(self):
        return self.name



class Size(models.Model):
    name = models.CharField(max_length=20, unique=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order"]
        verbose_name = "Size"
        verbose_name_plural = "Sizes"

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="products"
    )

    product_type = models.ForeignKey(
        ProductType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products"
    )

    name = models.CharField(max_length=255)

    slug = models.SlugField(
        max_length=255,
        unique=True,
        blank=True
    )

    short_description = models.CharField(
        max_length=300,
        blank=True
    )

    description = models.TextField()

    fitting = models.TextField(
        blank=True
    )

    fabric_and_care = models.TextField(
        blank=True
    )

    shipping_and_return = models.TextField(
        blank=True
    )

    regular_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    discount_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    is_featured = models.BooleanField(default=False)
    is_new_arrival = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_on_sale = models.BooleanField(
    default=False
     )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class ProductImage(models.Model):
    IMAGE_TYPES = (
        ("cover", "Cover"),
        ("hover", "Hover"),
        ("gallery", "Gallery"),
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images"
    )

    image = models.ImageField(upload_to="products/")

    image_type = models.CharField(
        max_length=20,
        choices=IMAGE_TYPES,
        default="gallery"
    )

    display_order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order"]

    def __str__(self):
        return f"{self.product.name} - {self.image_type}"

class ProductVariant(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="variants"
    )

    color = models.ForeignKey(
        Color,
        on_delete=models.CASCADE,
        related_name="variants"
    )

    size = models.ForeignKey(
        Size,
        on_delete=models.CASCADE,
        related_name="variants"
    )

    sku = models.CharField(
        max_length=100,
        unique=True
    )

    stock = models.PositiveIntegerField(default=0)

    price_override = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["product", "color", "size"]
        unique_together = ("product", "color", "size")

    def __str__(self):
        return f"{self.product.name} - {self.color.name} - {self.size.name}"

    @property
    def selling_price(self):
        if self.price_override:
            return self.price_override

        if self.product.discount_price:
            return self.product.discount_price

        return self.product.regular_price

class ProductFeature(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="features"
    )

    feature = models.CharField(max_length=255)

    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order"]

    def __str__(self):
        return self.feature