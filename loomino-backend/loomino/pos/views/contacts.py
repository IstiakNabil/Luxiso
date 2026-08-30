import csv
import io

from django.db.models import Q, ProtectedError
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Contact, ContactType, CustomerGroup
from ..pagination import POSResultsPagination
from ..permissions import IsPOSStaff, IsPOSAdminOrManager
from ..serializers.contacts import (
    ContactListSerializer,
    ContactDetailSerializer,
    ContactWriteSerializer,
    CustomerGroupSerializer,
    with_contact_totals,
)

IMPORT_COLUMNS = [
    "name",
    "contact_type",
    "business_name",
    "phone",
    "email",
    "address",
    "city",
    "country",
    "tax_number",
    "credit_limit",
    "opening_balance",
]


class ContactListCreateView(GenericAPIView):
    """
    GET  /api/pos/contacts/?type=customer|supplier   -- Customers / Suppliers pages
    POST /api/pos/contacts/

    A "both" contact shows on BOTH the Customers and Suppliers pages
    -- ?type=customer matches contact_type in (customer, both), and
    ?type=supplier matches (supplier, both). Every active role can
    create/edit (a Cashier needs to add a walk-in customer); only
    delete is restricted, see ContactDetailView.
    """

    permission_classes = [IsAuthenticated, IsPOSStaff]
    pagination_class = POSResultsPagination

    def get_queryset(self):
        qs = with_contact_totals(Contact.objects.select_related("customer_group"))

        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(business_name__icontains=search)
                | Q(phone__icontains=search)
                | Q(email__icontains=search)
                | Q(contact_code__icontains=search)
            )

        contact_type = self.request.query_params.get("type")
        if contact_type == ContactType.CUSTOMER:
            qs = qs.filter(contact_type__in=[ContactType.CUSTOMER, ContactType.BOTH])
        elif contact_type == ContactType.SUPPLIER:
            qs = qs.filter(contact_type__in=[ContactType.SUPPLIER, ContactType.BOTH])
        elif contact_type:
            qs = qs.filter(contact_type=contact_type)

        group_id = self.request.query_params.get("customer_group")
        if group_id:
            qs = qs.filter(customer_group_id=group_id)

        return qs

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        serializer = ContactListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = ContactWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact = serializer.save()
        return Response(
            ContactDetailSerializer(contact).data, status=status.HTTP_201_CREATED
        )


class ContactDetailView(GenericAPIView):
    """
    GET    /api/pos/contacts/{id}/
    PATCH  /api/pos/contacts/{id}/
    DELETE /api/pos/contacts/{id}/  -- Admin/Manager only

    DELETE is blocked (clean 400, not a 500) if the contact has any
    Purchase or Sale history -- deactivate instead.
    """

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAuthenticated(), IsPOSAdminOrManager()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        return Contact.objects.all()

    def _get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def get(self, request, pk):
        contact = self._get_object(pk)
        return Response(ContactDetailSerializer(contact).data)

    def patch(self, request, pk):
        contact = self._get_object(pk)
        serializer = ContactWriteSerializer(contact, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        contact = serializer.save()
        return Response(ContactDetailSerializer(contact).data)

    def delete(self, request, pk):
        contact = self._get_object(pk)

        # Purchase.supplier is PROTECT (caught below), but Sale.customer
        # is SET_NULL by design (walk-in sales support), so a
        # customer's sale history wouldn't trip a DB-level
        # ProtectedError even though deleting them would silently
        # orphan real money they owe. Check explicitly.
        if contact.sales.exists():
            return Response(
                {
                    "detail": (
                        "This contact has sale history and can't be deleted. "
                        "Set them to Inactive instead."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            contact.delete()
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "This contact has purchase history and can't be "
                        "deleted. Set them to Inactive instead."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class CustomerGroupListCreateView(GenericAPIView):
    """GET/POST /api/pos/contacts/customer-groups/"""

    permission_classes = [IsAuthenticated, IsPOSStaff]
    serializer_class = CustomerGroupSerializer

    def get_queryset(self):
        return CustomerGroup.objects.all()

    def get(self, request):
        return Response(self.serializer_class(self.get_queryset(), many=True).data)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(self.serializer_class(group).data, status=status.HTTP_201_CREATED)


class CustomerGroupDetailView(GenericAPIView):
    """PATCH/DELETE /api/pos/contacts/customer-groups/{id}/ -- Admin/Manager only"""

    permission_classes = [IsAuthenticated, IsPOSAdminOrManager]
    serializer_class = CustomerGroupSerializer

    def get_queryset(self):
        return CustomerGroup.objects.all()

    def patch(self, request, pk):
        group = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.serializer_class(group, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(self.serializer_class(group).data)

    def delete(self, request, pk):
        group = get_object_or_404(self.get_queryset(), pk=pk)
        group.delete()  # SET_NULL on Contact.customer_group -- contacts survive, ungrouped
        return Response(status=status.HTTP_204_NO_CONTENT)


class ContactImportTemplateView(APIView):
    """
    GET /api/pos/contacts/import/template/ -- downloadable blank CSV.

    Uses a raw HttpResponse rather than DRF's Response -- Response
    always passes content through the configured renderer (JSON by
    default here), which would JSON-encode the CSV text as a quoted
    string instead of serving it as a real file.
    """

    permission_classes = [IsAuthenticated, IsPOSStaff]

    def get(self, request):
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(IMPORT_COLUMNS)
        writer.writerow(
            ["Jane Doe", "customer", "", "01700000000", "", "", "Dhaka", "Bangladesh", "", "0", "0"]
        )
        response = HttpResponse(buffer.getvalue(), content_type="text/csv")
        response["Content-Disposition"] = "attachment; filename=contacts_import_template.csv"
        return response


class ContactImportView(APIView):
    """
    POST /api/pos/contacts/import/  (multipart, field name "file")

    Row-by-row: valid rows are created, invalid rows are collected
    with their row number and error so one bad row doesn't sink the
    whole batch. contact_type defaults to "customer" if the column is
    blank or missing.
    """

    permission_classes = [IsAuthenticated, IsPOSAdminOrManager]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {"detail": "Attach a CSV file under the 'file' field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            decoded = file.read().decode("utf-8-sig")
        except UnicodeDecodeError:
            return Response(
                {"detail": "Could not read the file as UTF-8 CSV."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reader = csv.DictReader(io.StringIO(decoded))
        created = 0
        failed = []

        for i, row in enumerate(reader, start=2):  # row 1 is the header
            data = {k: (v or "").strip() for k, v in row.items() if k in IMPORT_COLUMNS}
            data.setdefault("contact_type", "customer")
            if not data.get("contact_type"):
                data["contact_type"] = "customer"

            serializer = ContactWriteSerializer(data=data)
            if serializer.is_valid():
                serializer.save()
                created += 1
            else:
                failed.append({"row": i, "errors": serializer.errors})

        return Response({"created": created, "failed": failed})
