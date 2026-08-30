from django.db.models import ProtectedError, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Unit
from ..pagination import POSResultsPagination
from ..permissions import IsPOSStaff, CanEditProducts
from ..serializers.units import UnitSerializer


class UnitListCreateView(GenericAPIView):
    """
    GET  /api/pos/products/units/       -- Units table
    POST /api/pos/products/units/       -- Add unit (Admin/Manager only)
    """

    serializer_class = UnitSerializer
    pagination_class = POSResultsPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanEditProducts()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        qs = Unit.objects.all()
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(short_name__icontains=search))
        return qs

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        serializer = self.serializer_class(page, many=True)
        return self.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        unit = serializer.save()
        return Response(self.serializer_class(unit).data, status=status.HTTP_201_CREATED)


class UnitDetailView(GenericAPIView):
    """
    GET    /api/pos/products/units/{id}/
    PATCH  /api/pos/products/units/{id}/  -- Admin/Manager only
    DELETE /api/pos/products/units/{id}/  -- Admin/Manager only

    DELETE is blocked (clean 400, not a 500) if any product uses this
    unit -- reassign those products to a different unit first.
    """

    serializer_class = UnitSerializer

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated(), IsPOSStaff()]
        return [IsAuthenticated(), CanEditProducts()]

    def get_queryset(self):
        return Unit.objects.all()

    def _get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def get(self, request, pk):
        return Response(self.serializer_class(self._get_object(pk)).data)

    def patch(self, request, pk):
        unit = self._get_object(pk)
        serializer = self.serializer_class(unit, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        unit = serializer.save()
        return Response(self.serializer_class(unit).data)

    def delete(self, request, pk):
        unit = self._get_object(pk)
        try:
            unit.delete()
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "This unit is used by one or more products and can't be "
                        "deleted. Reassign those products to a different unit first."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
