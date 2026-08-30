from django.core.management.base import BaseCommand

import random
import shutil
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.utils.text import slugify

from products.models import (
    Product,
    ProductImage,
    ProductVariant,
    Category,
    ProductType,
    Color,
    Size,
)


class Command(BaseCommand):
    def seed_products(self):

        category = list(Category.objects.all())
        types = list(ProductType.objects.all())
        colors = list(Color.objects.all())
        sizes = list(Size.objects.all())

        product_names = [
            "Classic Oxford Shirt",
            "Essential Crew Neck Tee",
            "Premium Polo Shirt",
            "Slim Fit Jeans",
            "Oversized Hoodie",
            "Bomber Jacket",
            "Cargo Pants",
            "Linen Casual Shirt",
            "Relaxed Joggers",
            "Denim Jacket",
        ]

        seed_folder = Path(settings.MEDIA_ROOT) / "seed"
        product_folder = Path(settings.MEDIA_ROOT) / "products"

        product_folder.mkdir(parents=True, exist_ok=True)

        for index, name in enumerate(product_names, start=1):

            product, created = Product.objects.get_or_create(
                slug=slugify(name),
                defaults={
                    "name": name,
                    "category": random.choice(category),
                    "product_type": random.choice(types),
                    "short_description": f"{name} short description.",
                    "description": f"This is a premium quality {name.lower()}.",
                    "regular_price": Decimal(random.randint(1200, 4500)),
                    "discount_price": Decimal(random.randint(900, 3500)),
                    "is_featured": random.choice([True, False]),
                    "is_new_arrival": random.choice([True, False]),
                },
            )

            image_name = f"img-{index}.jpg"

            source = seed_folder / image_name
            destination = product_folder / image_name

            if source.exists():
                shutil.copy2(source, destination)

                with open(destination, "rb") as image_file:
                    ProductImage.objects.get_or_create(
                        product=product,
                        image=f"products/{image_name}",
                        defaults={
                            "image_type": "cover",
                            "display_order": 1,
                        },
                    )

            selected_colors = random.sample(colors, 2)
            selected_sizes = random.sample(sizes, 2)

            for color in selected_colors:

                for size in selected_sizes:
                    ProductVariant.objects.get_or_create(
                        product=product,
                        color=color,
                        size=size,
                        defaults={
                            "sku": f"LMN-{product.id}-{color.id}-{size.id}",
                            "stock": random.randint(5, 60),
                        },
                    )

        self.stdout.write(
            self.style.SUCCESS("✓ Products, Images & Variants created")
        )



    help = "Seed the database with sample data"

    def handle(self, *args, **options):

        self.stdout.write(self.style.WARNING("Starting database seeding...\n"))

        self.seed_categories()
        self.seed_types()
        self.seed_colors()
        self.seed_sizes()

        self.stdout.write(
            self.style.SUCCESS(
                "\nBasic data seeded successfully!"
            )
        )

        self.seed_products()

    def seed_categories(self):

        categories = [
            "Shirts",
            "T-Shirts",
            "Polo Shirts",
            "Jeans",
            "Trousers",
            "Shorts",
            "Jackets",
            "Hoodies",
            "Sweaters",
            "Accessories",
        ]

        for category in categories:

            Category.objects.get_or_create(
                name=category,
                defaults={
                    "description": f"{category} category",
                },
            )

        self.stdout.write(
            self.style.SUCCESS("✓ Categories created")
        )

    def seed_types(self):

        types = [
            "Kurti",
            "Saree",
            "Shrug",
            "Kameez",
            "Punjabi",
            "Shirt",
            "Jeans",
            "Blazer",
        ]

        for type_name in types:

            ProductType.objects.get_or_create(
                name=type_name,
                defaults={
                    "description": f"{type_name} type",
                },
            )

        self.stdout.write(
            self.style.SUCCESS("✓ Types created")
        )

    def seed_colors(self):

        colors = [
            ("Black", "#000000"),
            ("White", "#FFFFFF"),
            ("Gray", "#808080"),
            ("Navy", "#001F54"),
            ("Blue", "#0000FF"),
            ("Red", "#FF0000"),
            ("Green", "#008000"),
            ("Brown", "#8B4513"),
            ("Beige", "#F5F5DC"),
            ("Olive", "#808000"),
        ]

        for name, hex_code in colors:

            Color.objects.get_or_create(
                name=name,
                defaults={
                    "hex_code": hex_code,
                },
            )

        self.stdout.write(
            self.style.SUCCESS("✓ Colors created")
        )

    def seed_sizes(self):

        sizes = [
            ("XS", 1),
            ("S", 2),
            ("M", 3),
            ("L", 4),
            ("XL", 5),
            ("XXL", 6),
        ]

        for name, order in sizes:

            Size.objects.get_or_create(
                name=name,
                defaults={
                    "display_order": order,
                },
            )

        self.stdout.write(
            self.style.SUCCESS("✓ Sizes created")
        )