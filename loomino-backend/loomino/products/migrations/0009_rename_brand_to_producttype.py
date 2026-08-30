# Renames Brand -> ProductType (keeping all existing rows —
# e.g. "Levi's", "Michael Kors" — untouched, just relabeled),
# renames Product.brand -> Product.product_type, and adds the
# new Category M2M that drives the Shop All filter dependency
# (no category selected = all types; a category selected =
# only types linked to it).
#
# Hand-written rather than relying on `makemigrations`'
# interactive rename-detection prompt, which isn't reliable in
# a non-interactive shell — writing RenameModel/RenameField
# explicitly guarantees this is a data-preserving rename, not
# a drop-and-recreate.

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0008_rename_is_modiweek_product_is_on_sale'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Brand',
            new_name='ProductType',
        ),
        migrations.AlterModelOptions(
            name='producttype',
            options={
                'ordering': ['name'],
                'verbose_name': 'Type',
                'verbose_name_plural': 'Types',
            },
        ),
        migrations.RenameField(
            model_name='product',
            old_name='brand',
            new_name='product_type',
        ),
        migrations.AlterField(
            model_name='product',
            name='product_type',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='products',
                to='products.producttype',
            ),
        ),
        migrations.AddField(
            model_name='producttype',
            name='categories',
            field=models.ManyToManyField(
                blank=True,
                related_name='types',
                to='products.category',
            ),
        ),
    ]
