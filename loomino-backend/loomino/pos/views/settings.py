from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Business, Location, DocumentPrefix, DocumentType
from ..permissions import IsPOSStaff, CanManageSettings
from ..serializers.settings import (
    BusinessSettingsSerializer,
    LocationSerializer,
    DocumentPrefixSerializer,
)


class BusinessSettingsView(APIView):
    """GET/PATCH /api/pos/settings/business/ -- the singleton Business record."""

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated(), IsPOSStaff()]
        return [IsAuthenticated(), CanManageSettings()]

    def get(self, request):
        business = Business.get_solo()
        return Response(BusinessSettingsSerializer(business).data)

    def patch(self, request):
        business = Business.get_solo()
        serializer = BusinessSettingsSerializer(business, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        business = serializer.save()
        return Response(BusinessSettingsSerializer(business).data)


class LocationListCreateView(GenericAPIView):
    """GET/POST /api/pos/settings/locations/"""

    serializer_class = LocationSerializer
    pagination_class = None

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanManageSettings()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        return Location.objects.all()

    def get(self, request):
        return Response(self.serializer_class(self.get_queryset(), many=True).data)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        location = serializer.save(business=Business.get_solo())
        return Response(self.serializer_class(location).data, status=status.HTTP_201_CREATED)


class LocationDetailView(GenericAPIView):
    """
    PATCH/DELETE /api/pos/settings/locations/{id}/

    Delete is blocked if the location has any stock, purchases, or
    sales tied to it (PROTECT on those FKs already enforces this at
    the DB level) -- caught here and turned into a clear message
    instead of a raw IntegrityError.
    """

    permission_classes = [IsAuthenticated, CanManageSettings]
    serializer_class = LocationSerializer

    def get_queryset(self):
        return Location.objects.all()

    def patch(self, request, pk):
        location = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.serializer_class(location, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        location = serializer.save()
        return Response(self.serializer_class(location).data)

    def delete(self, request, pk):
        location = get_object_or_404(self.get_queryset(), pk=pk)
        try:
            location.delete()
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "This location has stock, purchases, or sales tied to it and "
                        "can't be deleted. Deactivate it instead."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentPrefixListView(APIView):
    """
    GET  /api/pos/settings/prefixes/
    PATCH /api/pos/settings/prefixes/  -- {document_type, prefix}

    One row per DocumentType always -- rows only exist in the DB for
    types that have been customized away from their default.
    """

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated(), IsPOSStaff()]
        return [IsAuthenticated(), CanManageSettings()]

    def get(self, request):
        return Response(DocumentPrefixSerializer.build_all())

    def patch(self, request):
        document_type = request.data.get("document_type")
        prefix = request.data.get("prefix", "").strip()

        valid_types = {c.value for c in DocumentType}
        if document_type not in valid_types:
            return Response(
                {"document_type": ["Not a valid document type."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not prefix:
            return Response({"prefix": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)

        DocumentPrefix.objects.update_or_create(
            document_type=document_type, defaults={"prefix": prefix}
        )
        return Response(DocumentPrefixSerializer.build_all())
