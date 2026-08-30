from django.db.models import ProtectedError, Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..permissions import IsPOSStaff, CanEditProducts


class LookupListCreateView(GenericAPIView):
    """
    Base for simple name(+is_active) lookup lists -- every role can
    view (needed for filter dropdowns), only Admin/Manager can add.
    Subclasses set `queryset` and `serializer_class`.
    """

    pagination_class = None  # small lists; frontend dropdowns want the whole set

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanEditProducts()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        qs = self.queryset.all()
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(Q(name__icontains=search))
        return qs

    def get(self, request):
        return Response(self.serializer_class(self.get_queryset(), many=True).data)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(self.serializer_class(obj).data, status=status.HTTP_201_CREATED)


class LookupDetailView(GenericAPIView):
    """
    PATCH/DELETE for a single lookup row -- Admin/Manager only.

    Category/Brand/TaxRate all use SET_NULL on the product FK (same
    pattern as CustomerGroup), so deleting one never blocks on
    products still using it -- they just become untagged. The
    ProtectedError catch below is defensive only, in case a subclass
    ever points at a PROTECT relation instead.
    """

    permission_classes = [IsAuthenticated, CanEditProducts]
    protected_error_message = "This is still referenced elsewhere and can't be deleted."

    def get_queryset(self):
        return self.queryset.all()

    def _get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def patch(self, request, pk):
        obj = self._get_object(pk)
        serializer = self.serializer_class(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(self.serializer_class(obj).data)

    def delete(self, request, pk):
        obj = self._get_object(pk)
        try:
            obj.delete()
        except ProtectedError:
            return Response(
                {"detail": self.protected_error_message},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)
