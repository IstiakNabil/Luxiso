from django.db import migrations


def ean13_check_digit(twelve_digits):
    """
    Duplicated from pos.models.catalog rather than imported -- a data
    migration must keep working even if that helper is later moved or
    changed, so it can't depend on today's application code.
    """
    total = 0
    for index, char in enumerate(twelve_digits):
        weight = 1 if index % 2 == 0 else 3
        total += int(char) * weight
    return str((10 - (total % 10)) % 10)


def backfill_barcodes(apps, schema_editor):
    """
    Variants created before the barcode field existed have NULL and
    would never scan at the till. Generate the same in-store EAN-13
    (GS1 prefix 20 + zero-padded id + check digit) the model now
    assigns on create.
    """
    POSVariant = apps.get_model("pos", "POSVariant")
    for variant in POSVariant.objects.filter(barcode__isnull=True).iterator():
        body = f"20{variant.id:010d}"
        variant.barcode = body + ean13_check_digit(body)
        variant.save(update_fields=["barcode"])


def clear_barcodes(apps, schema_editor):
    POSVariant = apps.get_model("pos", "POSVariant")
    POSVariant.objects.update(barcode=None)


class Migration(migrations.Migration):

    dependencies = [
        ("pos", "0016_business_receipt_footer_text_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_barcodes, clear_barcodes),
    ]
