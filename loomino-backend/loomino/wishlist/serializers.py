from rest_framework import serializers

from .models import WishlistItem
from products.models import ProductVariant

from api.products.serializers import ProductVariantSerializer


class WishlistItemSerializer(serializers.ModelSerializer):

    product_variant = ProductVariantSerializer(
        read_only=True
    )

    product_name = serializers.SerializerMethodField()

    product_slug = serializers.SerializerMethodField()

    product_image = serializers.SerializerMethodField()

    class Meta:

        model = WishlistItem

        fields = (
            "id",
            "product_variant",
            "product_name",
            "product_slug",
            "product_image",
            "created_at",
        )

    def get_product_name(self, obj):

        return obj.product_variant.product.name

    def get_product_slug(self, obj):

        return obj.product_variant.product.slug

    def get_product_image(self, obj):

        image = obj.product_variant.product.images.first()

        if not image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                image.image.url
            )

        return image.image.url


class AddWishlistSerializer(serializers.Serializer):

    product_variant_id = serializers.IntegerField()