from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import OfferBanner, SiteBanner
from .serializers import (
    AdminOfferBannerSerializer,
    PublicSiteBannerSerializer,
    AdminSiteBannerSerializer,
)


def _all_site_banners():
    """
    Makes sure a row exists for every known KEY_CHOICES slot, so
    the frontend always sees the full fixed set (with a null
    image until an admin uploads one) instead of having to
    handle "slot doesn't exist yet".
    """
    existing_keys = set(
        SiteBanner.objects.values_list("key", flat=True)
    )
    missing = [
        SiteBanner(key=key)
        for key, _ in SiteBanner.KEY_CHOICES
        if key not in existing_keys
    ]
    if missing:
        SiteBanner.objects.bulk_create(missing)
    return SiteBanner.objects.all()


# ============================================================
# Public (storefront-facing)
# ============================================================

class PublicSiteBannerListAPIView(APIView):
    """All fixed site-banner slots and their current image, if
    any has been uploaded. No auth required."""

    permission_classes = [AllowAny]

    def get(self, request):
        banners = _all_site_banners()
        data = PublicSiteBannerSerializer(
            banners,
            many=True,
            context={"request": request},
        ).data
        return Response(data)


# ============================================================
# Site Banners (fixed-slot images: Collection tiles, etc.)
# ============================================================

class AdminSiteBannerListAPIView(APIView):

    permission_classes = [IsAdminUser]

    def get(self, request):
        banners = _all_site_banners()
        data = AdminSiteBannerSerializer(
            banners,
            many=True,
            context={"request": request},
        ).data
        return Response(data)


class AdminSiteBannerUpdateAPIView(APIView):
    """Replace the image for one fixed slot, looked up by key
    (e.g. "collection_kurti") rather than a numeric id, since
    the key is the stable, meaningful identifier here."""

    permission_classes = [IsAdminUser]

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def patch(self, request, key):
        valid_keys = dict(SiteBanner.KEY_CHOICES)
        if key not in valid_keys:
            return Response(
                {"detail": "Unknown banner key."},
                status=status.HTTP_404_NOT_FOUND,
            )
        banner, _ = SiteBanner.objects.get_or_create(key=key)
        serializer = AdminSiteBannerSerializer(
            banner,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


# ============================================================
# Offer Banners
# ============================================================

class AdminOfferBannerListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = AdminOfferBannerSerializer

    permission_classes = [IsAdminUser]

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    pagination_class = None

    queryset = OfferBanner.objects.all()


class AdminOfferBannerRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AdminOfferBannerSerializer

    permission_classes = [IsAdminUser]

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    queryset = OfferBanner.objects.all()


class AdminOfferBannerToggleActiveAPIView(APIView):

    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            banner = OfferBanner.objects.get(pk=pk)
        except OfferBanner.DoesNotExist:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        banner.is_active = not banner.is_active
        banner.save(update_fields=["is_active"])
        return Response(
            AdminOfferBannerSerializer(banner).data
        )
