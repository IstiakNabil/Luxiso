from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from ..models import POSStaffProfile, POSRole
from ..pagination import POSResultsPagination
from ..permissions import IsPOSStaff, IsPOSAdmin
from ..serializers.user_management import (
    AccountSearchResultSerializer,
    POSStaffProfileListSerializer,
    POSStaffProfileDetailSerializer,
    POSStaffProfileCreateSerializer,
    POSStaffProfileUpdateSerializer,
    RolePermissionSerializer,
)


def _active_admin_count(exclude_id=None):
    qs = POSStaffProfile.objects.filter(role=POSRole.ADMIN, is_active=True)
    if exclude_id:
        qs = qs.exclude(id=exclude_id)
    return qs.count()


class AccountSearchListView(ListAPIView):
    """
    GET /api/pos/user-management/accounts/?q=

    Powers the "Add" flow's account picker. Requires at least 2
    characters so it doesn't dump every e-commerce customer on an
    empty query -- this searches the same accounts.User table the
    storefront uses.
    """

    permission_classes = [IsAuthenticated, IsPOSAdmin]
    serializer_class = AccountSearchResultSerializer
    pagination_class = POSResultsPagination

    def get_queryset(self):
        q = self.request.query_params.get("q", "").strip()
        if len(q) < 2:
            return User.objects.none()
        return User.objects.filter(
            Q(email__icontains=q)
            | Q(first_name__icontains=q)
            | Q(last_name__icontains=q)
        ).order_by("first_name", "last_name")[:50]


class POSStaffProfileListCreateView(GenericAPIView):
    """
    GET  /api/pos/user-management/users/       -- the Users table
    POST /api/pos/user-management/users/       -- attach a role to an existing account
    """

    permission_classes = [IsAuthenticated, IsPOSAdmin]
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = POSStaffProfile.objects.select_related("user").prefetch_related(
            "locations"
        )
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(user__email__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
            )
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        return qs.order_by("user__first_name", "user__last_name")

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        serializer = POSStaffProfileListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = POSStaffProfileCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return Response(
            POSStaffProfileDetailSerializer(profile).data,
            status=status.HTTP_201_CREATED,
        )


class POSStaffProfileDetailView(GenericAPIView):
    """
    GET    /api/pos/user-management/users/{id}/
    PATCH  /api/pos/user-management/users/{id}/
    DELETE /api/pos/user-management/users/{id}/

    DELETE removes only the POSStaffProfile row -- the underlying
    accounts.User (their e-commerce login, if any) is never touched.
    """

    permission_classes = [IsAuthenticated, IsPOSAdmin]
    queryset = POSStaffProfile.objects.select_related("user").prefetch_related(
        "locations"
    )

    def get(self, request, pk):
        profile = self._get_object(pk)
        return Response(POSStaffProfileDetailSerializer(profile).data)

    def patch(self, request, pk):
        profile = self._get_object(pk)

        would_demote = (
            profile.role == POSRole.ADMIN
            and (
                request.data.get("role", POSRole.ADMIN) != POSRole.ADMIN
                or request.data.get("is_active") is False
            )
        )
        if would_demote and _active_admin_count(exclude_id=profile.id) == 0:
            return Response(
                {"detail": "You can't remove the last active Admin. Promote another user first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = POSStaffProfileUpdateSerializer(
            profile, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        profile = serializer.save()
        return Response(POSStaffProfileDetailSerializer(profile).data)

    def delete(self, request, pk):
        profile = self._get_object(pk)

        if profile.role == POSRole.ADMIN and _active_admin_count(
            exclude_id=profile.id
        ) == 0:
            return Response(
                {"detail": "You can't remove the last active Admin. Promote another user first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        profile.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def _get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)


class RolesReferenceView(APIView):
    """
    GET /api/pos/user-management/roles/

    Read-only -- there is no create/edit/delete for roles, they're
    fixed. Any active POS staff member can view this (it's just
    documentation of what each role can do), not only Admins.
    """

    permission_classes = [IsAuthenticated, IsPOSStaff]

    def get(self, request):
        data = [
            {"role": role.value, "role_display": role.label}
            for role in POSRole
        ]
        serializer = RolePermissionSerializer(data, many=True)
        return Response(serializer.data)
