# Renames Product.is_modiweek -> Product.is_on_sale.
#
# The auto-generated migration also bundled unrelated
# AlterField "id -> BigAutoField" churn across several other
# models (pre-existing app-config drift, already handled in an
# earlier migration) — trimmed here to keep this migration
# scoped to the actual rename.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0007_alter_brand_id_alter_category_id_alter_color_id_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='product',
            old_name='is_modiweek',
            new_name='is_on_sale',
        ),
    ]
