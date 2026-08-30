from rest_framework import serializers
from django.db.models import Avg

from products.models import (
    Product,
    ProductImage,
    ProductVariant,
    Category,
    ProductType,
    Color,
    Size,
)


# ============================================================
# Public Product List
# ============================================================

class ProductListSerializer(serializers.ModelSerializer):

    average_rating = serializers.FloatField(
        read_only=True
    )

    review_count = serializers.IntegerField(
        read_only=True
    )

    thumbnail = serializers.SerializerMethodField()

    category = serializers.CharField(
        source="category.name"
    )

    product_type = serializers.CharField(
        source="product_type.name",
        default=None
    )

    price = serializers.SerializerMethodField()

    in_stock = serializers.SerializerMethodField()

    default_variant_id = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "price",
            "thumbnail",
            "category",
            "product_type",
            "is_featured",
            "is_new_arrival",
            "in_stock",
            "is_on_sale",
            "default_variant_id",
            "average_rating",
            "review_count",
        )

    def get_thumbnail(self, obj):

        image = obj.images.first()

        if image:

            request = self.context.get("request")

            if request:
                return request.build_absolute_uri(
                    image.image.url
                )

            return image.image.url

        return None

    def get_price(self, obj):

        if obj.discount_price:
            return obj.discount_price

        return obj.regular_price

    def get_in_stock(self, obj):

        return obj.variants.filter(
            stock__gt=0,
            is_active=True,
        ).exists()

    def get_default_variant_id(self, obj):

        variant = obj.variants.filter(
            stock__gt=0,
            is_active=True,
        ).first()

        if not variant:

            variant = obj.variants.filter(
                is_active=True,
            ).first()

        return variant.id if variant else None


# ============================================================
# Public Product Images
# ============================================================

class ProductImageSerializer(serializers.ModelSerializer):

    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage

        fields = (
            "id",
            "image",
            "image_type",
            "display_order",
        )

    def get_image(self, obj):

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.image.url
            )

        return obj.image.url


# ============================================================
# Public Categories
# ============================================================

class CategorySerializer(serializers.ModelSerializer):

    product_count = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = Category

        fields = (
            "id",
            "name",
            "slug",
            "product_count",
        )


# ============================================================
# Public Types
# ============================================================

class TypeSerializer(serializers.ModelSerializer):

    product_count = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = ProductType

        fields = (
            "id",
            "name",
            "slug",
            "product_count",
        )


# ============================================================
# Public Colors
# ============================================================

class ColorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Color

        fields = (
            "id",
            "name",
            "hex_code",
        )


# ============================================================
# Public Sizes
# ============================================================

class SizeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Size

        fields = (
            "id",
            "name",
        )


# ============================================================
# Public Product Variants
# ============================================================

class ProductVariantSerializer(serializers.ModelSerializer):

    color = ColorSerializer(
        read_only=True
    )

    size = SizeSerializer(
        read_only=True
    )

    price = serializers.SerializerMethodField()

    available = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant

        fields = (
            "id",
            "sku",
            "color",
            "size",
            "price",
            "stock",
            "available",
        )

    def get_price(self, obj):

        return obj.selling_price

    def get_available(self, obj):

        return obj.stock > 0


# ============================================================
# Public Product Detail
# ============================================================

class ProductDetailSerializer(serializers.ModelSerializer):

    average_rating = serializers.FloatField(
        read_only=True
    )

    review_count = serializers.IntegerField(
        read_only=True
    )

    category = serializers.CharField(
        source="category.name"
    )

    product_type = serializers.CharField(
        source="product_type.name",
        default=None
    )

    images = ProductImageSerializer(
        many=True,
        read_only=True,
    )

    variants = ProductVariantSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "short_description",
            "description",
            "fitting",
            "fabric_and_care",
            "shipping_and_return",
            "regular_price",
            "discount_price",
            "category",
            "product_type",
            "is_featured",
            "is_new_arrival",
            "is_on_sale",
            "average_rating",
            "review_count",
            "images",
            "variants",
        )


def get_average_rating(self, obj):

    average = obj.reviews.filter(
        is_approved=True
    ).aggregate(
        average=Avg("rating")
    )["average"]

    return round(
        average,
        1
    ) if average else 0


def get_review_count(self, obj):

    return obj.reviews.filter(
        is_approved=True
    ).count()


# ============================================================
# ADMIN — Product List
# ============================================================

class AdminProductListSerializer(serializers.ModelSerializer):

    category = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    primary_category = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    thumbnail = serializers.SerializerMethodField()

    total_stock = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",
            "category",
            "thumbnail",
            "regular_price",
            "discount_price",
            "is_active",
            "total_stock",
            "primary_category",
        )

    def get_thumbnail(self, obj):

        image = obj.images.first()

        if not image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                image.image.url
            )

        return image.image.url


# ============================================================
# ADMIN — Product Create / Retrieve / Update
# ============================================================

class AdminProductSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    type_name = serializers.CharField(
        source="product_type.name",
        read_only=True,
    )

    thumbnail = serializers.SerializerMethodField(
        read_only=True
    )

    total_stock = serializers.IntegerField(
        read_only=True
    )

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "slug",

            "category",
            "category_name",

            "product_type",
            "type_name",

            "short_description",
            "description",
            "fitting",
            "fabric_and_care",
            "shipping_and_return",

            "regular_price",
            "discount_price",

            "is_featured",
            "is_new_arrival",
            "is_on_sale",
            "is_active",

            "thumbnail",
            "total_stock",

            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "category_name",
            "type_name",
            "thumbnail",
            "total_stock",
            "created_at",
            "updated_at",
        )

        extra_kwargs = {
            "slug": {
                "required": False,
                "allow_blank": True,
            }
        }

    def get_thumbnail(self, obj):

        image = obj.images.first()

        if not image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                image.image.url
            )

        return image.image.url

    def validate(self, attrs):

        regular_price = attrs.get(
            "regular_price",
            getattr(
                self.instance,
                "regular_price",
                None,
            )
        )

        discount_price = attrs.get(
            "discount_price",
            getattr(
                self.instance,
                "discount_price",
                None,
            )
        )

        if (
            discount_price is not None
            and regular_price is not None
            and discount_price > regular_price
        ):
            raise serializers.ValidationError(
                {
                    "discount_price": (
                        "Discount price cannot be greater "
                        "than regular price."
                    )
                }
            )
        
    

        return attrs
    

# ============================================================
# ADMIN — Categories
# ============================================================

class AdminCategorySerializer(serializers.ModelSerializer):

    banner_image = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    icon_image = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    product_count = serializers.IntegerField(
        read_only=True,
    )

    class Meta:

        model = Category

        fields = (
            "id",
            "name",
            "slug",
            "description",
            "banner_image",
            "icon_image",
            "display_order",
            "is_active",
            "product_count",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "product_count",
            "created_at",
            "updated_at",
        )

        extra_kwargs = {

            "slug": {
                "required": False,
                "allow_blank": True,
            },

        }

# ============================================================
# ADMIN — Colors
# ============================================================

class AdminColorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Color

        fields = (
            "id",
            "name",
            "hex_code",
            "is_active",
        )

        read_only_fields = (
            "id",
        )

    def validate_hex_code(self, value):

        value = value.strip()

        if not value.startswith("#"):
            value = f"#{value}"

        if len(value) != 7:
            raise serializers.ValidationError(
                "Hex code must be in the format #RRGGBB."
            )

        hex_value = value[1:]

        if not all(
            character in "0123456789ABCDEFabcdef"
            for character in hex_value
        ):
            raise serializers.ValidationError(
                "Hex code contains invalid characters."
            )

        return value.upper()
    
# ============================================================
# ADMIN — Sizes
# ============================================================

class AdminSizeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Size

        fields = (
            "id",
            "name",
            "display_order",
            "is_active",
        )

        read_only_fields = (
            "id",
        )

# ============================================================
# ADMIN — Variant Nested Product
# ============================================================

class AdminVariantProductSerializer(serializers.ModelSerializer):

    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = (
            "id",
            "name",
            "thumbnail",
        )

    def get_thumbnail(self, obj):

        image = obj.images.order_by(
            "display_order",
            "id",
        ).first()

        if not image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                image.image.url
            )

        return image.image.url


# ============================================================
# ADMIN — Variant Nested Color
# ============================================================

class AdminVariantColorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Color

        fields = (
            "id",
            "name",
            "hex_code",
        )


# ============================================================
# ADMIN — Variant Nested Size
# ============================================================

class AdminVariantSizeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Size

        fields = (
            "id",
            "name",
        )


# ============================================================
# ADMIN — Variant List / Detail Response
# ============================================================

class AdminProductVariantSerializer(serializers.ModelSerializer):

    product = AdminVariantProductSerializer(
        read_only=True
    )

    color = AdminVariantColorSerializer(
        read_only=True
    )

    size = AdminVariantSizeSerializer(
        read_only=True
    )

    price = serializers.SerializerMethodField()

    unit_price = serializers.DecimalField(
        source="product.regular_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    regular_price = serializers.DecimalField(
        source="product.regular_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    images = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant

        fields = (
            "id",
            "product",
            "color",
            "size",
            "price",
            "unit_price",
            "regular_price",
            "stock",
            "sku",
            "images",
            "is_active",
        )

    def get_price(self, obj):

        return obj.selling_price

    def get_images(self, obj):

        product_images = obj.product.images.all()

        front_image = None
        back_image = None

        for image in product_images:

            if image.image_type == "front" and front_image is None:
                front_image = image

            elif image.image_type == "back" and back_image is None:
                back_image = image

        request = self.context.get("request")

        def build_image_url(image):

            if not image:
                return None

            if request:
                return request.build_absolute_uri(
                    image.image.url
                )

            return image.image.url

        return {
            "front": build_image_url(
                front_image
            ),
            "back": build_image_url(
                back_image
            ),
        }


# ============================================================
# ADMIN — Variant Create / Update
# ============================================================

class AdminProductVariantWriteSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = ProductVariant

        fields = (
            "id",
            "product",
            "color",
            "size",
            "sku",
            "price_override",
            "stock",
            "is_active",
        )

        read_only_fields = (
            "id",
        )

        extra_kwargs = {

            "price_override": {
                "required": False,
                "allow_null": True,
            },

            "is_active": {
                "required": False,
            },

        }

    def validate_stock(self, value):

        if value < 0:
            raise serializers.ValidationError(
                "Stock cannot be negative."
            )

        return value

    def validate_price_override(self, value):

        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Price override cannot be negative."
            )

        return value

    def validate(self, attrs):

        product = attrs.get(
            "product",
            getattr(
                self.instance,
                "product",
                None,
            )
        )

        color = attrs.get(
            "color",
            getattr(
                self.instance,
                "color",
                None,
            )
        )

        size = attrs.get(
            "size",
            getattr(
                self.instance,
                "size",
                None,
            )
        )

        if product and color and size:

            existing_variant = (
                ProductVariant.objects.filter(
                    product=product,
                    color=color,
                    size=size,
                )
            )

            if self.instance:
                existing_variant = (
                    existing_variant.exclude(
                        pk=self.instance.pk
                    )
                )

            if existing_variant.exists():
                raise serializers.ValidationError(
                    {
                        "non_field_errors": [
                            (
                                "A variant with this product, "
                                "color and size already exists."
                            )
                        ]
                    }
                )

        return attrs

# ============================================================
# Admin — Product Images
# ============================================================

class AdminProductImageSerializer(
    serializers.ModelSerializer
):

    image_url = serializers.SerializerMethodField()

    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    class Meta:

        model = ProductImage

        fields = (
            "id",
            "product",
            "product_name",
            "image",
            "image_url",
            "image_type",
            "display_order",
            "created_at",
        )

        read_only_fields = (
            "id",
            "product_name",
            "image_url",
            "created_at",
        )

        extra_kwargs = {

            "image_type": {
                "required": False,
            },

            "display_order": {
                "required": False,
            },

        }

    def get_image_url(self, obj):

        if not obj.image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.image.url
            )

        return obj.image.url


# ============================================================
# Admin — Types
# ============================================================

class AdminTypeSerializer(serializers.ModelSerializer):

    product_count = serializers.IntegerField(
        read_only=True
    )

    logo_url = serializers.SerializerMethodField()

    categories = serializers.PrimaryKeyRelatedField(
        many=True,
        required=False,
        queryset=Category.objects.all(),
    )

    class Meta:

        model = ProductType

        fields = (
            "id",
            "name",
            "slug",
            "logo",
            "logo_url",
            "description",
            "is_active",
            "categories",
            "product_count",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "slug",
            "logo_url",
            "product_count",
            "created_at",
            "updated_at",
        )

        extra_kwargs = {

            "logo": {
                "required": False,
                "allow_null": True,
            },

            "description": {
                "required": False,
                "allow_blank": True,
                "allow_null": True,
            },

            "is_active": {
                "required": False,
            },

        }

    def get_logo_url(self, obj):

        if not obj.logo:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.logo.url
            )

        return obj.logo.url

    def validate_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Type name cannot be empty."
            )

        qs = ProductType.objects.filter(
            name__iexact=value
        )

        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                "A type with this name already exists."
            )

        return value
