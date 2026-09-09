"""
POS is the only place a product gets created. This is the one
function that turns a POSProduct into what the storefront actually
serves -- call it after any create/update in pos/views/products.py.

Not published (publish_online=False) means "not for sale online" --
if a storefront mirror already exists (was published before), it's
deactivated rather than deleted, so past orders referencing it via
OrderItem/ProductVariant.pos_source still resolve correctly.
"""

from decimal import Decimal

from django.db import transaction
from django.utils.text import slugify


class PublishValidationError(Exception):
    """Raised when a product can't be published online as configured
    (e.g. no storefront category chosen yet)."""


@transaction.atomic
def sync_product_to_storefront(pos_product):
    from products.models import Product, ProductVariant, ProductImage, ProductFeature
    from pos.models import StockLevel

    if not pos_product.publish_online:
        storefront = getattr(pos_product, "storefront_product", None)
        if storefront and storefront.is_active:
            storefront.is_active = False
            storefront.save(update_fields=["is_active"])
        return storefront

    if not pos_product.storefront_category_id:
        raise PublishValidationError(
            "Choose a storefront category before publishing this product online."
        )

    variants = list(pos_product.variants.select_related("color", "size").all())
    if not variants:
        raise PublishValidationError("Add at least one variant before publishing online.")

    selling_prices = [v.selling_price for v in variants if v.selling_price is not None]
    base_price = max(selling_prices) if selling_prices else Decimal("0")

    storefront, created = Product.objects.update_or_create(
        pos_source=pos_product,
        defaults=dict(
            category=pos_product.storefront_category,
            product_type=pos_product.storefront_type,
            name=pos_product.name,
            short_description=pos_product.short_description,
            description=pos_product.description,
            fitting=pos_product.fitting,
            fabric_and_care=pos_product.fabric_and_care,
            shipping_and_return=pos_product.shipping_and_return,
            regular_price=base_price,
            discount_price=pos_product.online_discount_price,
            is_featured=pos_product.is_featured,
            is_new_arrival=pos_product.is_new_arrival,
            is_on_sale=pos_product.is_on_sale,
            is_active=pos_product.is_active,
        ),
    )
    if not storefront.slug:
        storefront.slug = _unique_slug(Product, pos_product.name, exclude_pk=storefront.pk)
        storefront.save(update_fields=["slug"])

    # Features and images are fully owned by the POS side; the
    # storefront copies are wiped and rebuilt each sync rather than
    # diffed, same as the create-only editing pattern the rest of
    # this app already uses for variants.
    storefront.features.all().delete()
    ProductFeature.objects.bulk_create(
        [
            ProductFeature(product=storefront, feature=f.feature, display_order=f.display_order)
            for f in pos_product.features.all()
        ]
    )

    storefront.images.all().delete()
    ProductImage.objects.bulk_create(
        [
            ProductImage(
                product=storefront,
                image=img.image,
                image_type=img.image_type,
                display_order=img.display_order,
            )
            for img in pos_product.images.all()
        ]
    )

    for pos_variant in variants:
        if not (pos_variant.color_id and pos_variant.size_id):
            raise PublishValidationError(
                f"Variant '{pos_variant.display_name}' needs both a color and a size to publish online."
            )

        storefront_variant, _ = ProductVariant.objects.update_or_create(
            pos_source=pos_variant,
            defaults=dict(
                product=storefront,
                color=pos_variant.color,
                size=pos_variant.size,
                sku=pos_variant.sku,
                price_override=pos_variant.selling_price,
                is_active=pos_variant.is_active,
            ),
        )
        stock_level = StockLevel.objects.filter(variant=pos_variant).first()
        storefront_variant.stock = int(stock_level.quantity) if stock_level else 0
        storefront_variant.save(update_fields=["stock"])

    return storefront


def _unique_slug(Product, name, exclude_pk=None):
    base = slugify(name)
    slug = base
    n = 1
    qs = Product.objects.exclude(pk=exclude_pk) if exclude_pk else Product.objects.all()
    while qs.filter(slug=slug).exists():
        n += 1
        slug = f"{base}-{n}"
    return slug
