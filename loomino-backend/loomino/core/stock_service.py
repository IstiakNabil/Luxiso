"""
Single choke point for every stock-quantity change in the system --
POS sales, POS returns, purchases, purchase returns, stock
adjustments, and online orders/cancellations all go through
deduct_stock()/restock() here.

StockLevel (pos.models) holds ONE shared quantity per variant --
there is no per-location split. A sale at any physical location and
an online order both deplete the exact same number. `location` is
still required on every call and still written onto the StockMovement
row, purely so reports can answer "how much sold via which location /
online vs offline" -- it no longer partitions the stock itself.

Nothing else should ever write to StockLevel.quantity or
ProductVariant.stock directly -- the latter is a synced read-cache the
storefront's existing filters/annotations depend on as a real DB
field, kept correct automatically by _sync_storefront_stock().
"""

from decimal import Decimal

from django.db import transaction


class InsufficientStockError(Exception):
    pass


def get_online_location():
    """The Location used to label online orders' stock movements for
    reporting (e.g. distinguishing an online sale from a till sale at
    a specific branch) -- stock itself is shared, so this no longer
    selects which pool an order draws from."""
    from pos.models import Location

    return Location.objects.get(is_online_channel=True)


@transaction.atomic
def _apply_movement(
    *,
    variant,
    location,
    delta,
    movement_type,
    reference_type,
    reference_id,
    note="",
    created_by=None,
):
    """delta is signed: negative for a sale/deduction, positive for a restock."""
    from pos.models import StockLevel, StockMovement

    stock_level, _ = StockLevel.objects.select_for_update().get_or_create(variant=variant)
    new_qty = stock_level.quantity + delta
    if new_qty < 0:
        raise InsufficientStockError(f"Only {stock_level.quantity} of {variant} in stock.")

    stock_level.quantity = new_qty
    stock_level.save(update_fields=["quantity"])

    StockMovement.objects.create(
        variant=variant,
        location=location,
        movement_type=movement_type,
        quantity=abs(delta),
        reference_type=reference_type,
        reference_id=reference_id,
        note=note,
        created_by=created_by,
    )

    _sync_storefront_stock(variant)


def deduct_stock(
    *, variant, location, quantity, movement_type, reference_type, reference_id, note="", created_by=None
):
    """Raises InsufficientStockError if there isn't enough on hand.
    `location` is required for the movement record even though the
    stock pool itself is shared."""
    _apply_movement(
        variant=variant,
        location=location,
        delta=-Decimal(quantity),
        movement_type=movement_type,
        reference_type=reference_type,
        reference_id=reference_id,
        note=note,
        created_by=created_by,
    )


def restock(
    *, variant, location, quantity, movement_type, reference_type, reference_id, note="", created_by=None
):
    _apply_movement(
        variant=variant,
        location=location,
        delta=Decimal(quantity),
        movement_type=movement_type,
        reference_type=reference_type,
        reference_id=reference_id,
        note=note,
        created_by=created_by,
    )


def _sync_storefront_stock(pos_variant):
    """Keep ProductVariant.stock -- a real DB column the storefront's
    existing Sum("variants__stock") annotations and filters rely on
    -- equal to the one shared StockLevel for this variant. A no-op
    for variants that haven't been published to the storefront yet."""
    from pos.models import StockLevel

    storefront_variant = getattr(pos_variant, "storefront_variant", None)
    if not storefront_variant:
        return

    stock_level = StockLevel.objects.filter(variant=pos_variant).first()
    storefront_variant.stock = int(stock_level.quantity) if stock_level else 0
    storefront_variant.save(update_fields=["stock"])
