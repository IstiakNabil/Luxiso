from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Wishlist
from .serializers import WishlistItemSerializer
from products.models import ProductVariant
from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem
from .serializers import (
    WishlistItemSerializer,
    AddWishlistSerializer,
)
from drf_spectacular.utils import extend_schema



@extend_schema(
    tags=["Wishlist"],
    summary="Get Wishlist",
    description="Get the wishlist items for the authenticated user.",
)
class WishlistAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user
        )

        serializer = WishlistItemSerializer(
    		wishlist.items.select_related(
      		 "product_variant",
       		 "product_variant__product",
       		 "product_variant__color",
       		 "product_variant__size",
   	 ).prefetch_related(
        	"product_variant__product__images",
   	 ),
   	 many=True,
   	 context={"request": request},	
	)

        return Response(serializer.data)

@extend_schema(
    tags=["Wishlist"],
    summary="Add to Wishlist",
    description="Add a product variant to the wishlist for the authenticated user.",
)
class AddWishlistAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = AddWishlistSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user
        )

        variant = get_object_or_404(
            ProductVariant,
            id=serializer.validated_data["product_variant_id"],
            is_active=True,
        )
        if WishlistItem.objects.filter(
            wishlist=wishlist,
            product_variant=variant,
        ).exists():

            return Response(
                {
                    "message": "Product already in wishlist."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        WishlistItem.objects.create(
            wishlist=wishlist,
            product_variant=variant,
        )

        return Response(
            {
                "message": "Added to wishlist."
            },
            status=status.HTTP_201_CREATED,
        )

@extend_schema(
    tags=["Wishlist"],
    summary="Remove from Wishlist",
    description="Remove a product variant from the wishlist for the authenticated user.",
)
class RemoveWishlistAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, variant_id):

        wishlist = get_object_or_404(
            Wishlist,
            user=request.user,
        )

        item = get_object_or_404(
            WishlistItem,
            wishlist=wishlist,
            product_variant_id=variant_id,
        )

        item.delete()

        return Response(
            {
                "message": "Removed from wishlist."
            },
            status=status.HTTP_200_OK,
        )
