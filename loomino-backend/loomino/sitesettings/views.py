from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SiteSetting
from .serializers import (
    AdminSiteSettingSerializer,
    PublicSiteSettingSerializer,
)


class PublicSiteSettingAPIView(APIView):
    """The storefront-safe settings. No auth required."""

    permission_classes = [AllowAny]

    def get(self, request):
        setting = SiteSetting.load()
        return Response(
            PublicSiteSettingSerializer(setting).data
        )


class AdminSiteSettingAPIView(APIView):
    """Read and update the full settings singleton."""

    permission_classes = [IsAdminUser]

    def get(self, request):
        setting = SiteSetting.load()
        return Response(
            AdminSiteSettingSerializer(setting).data
        )

    def patch(self, request):
        setting = SiteSetting.load()
        serializer = AdminSiteSettingSerializer(
            setting,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
