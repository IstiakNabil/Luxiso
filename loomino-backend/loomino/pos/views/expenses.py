from decimal import Decimal, InvalidOperation

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..models import Expense, ExpenseCategory, PaymentStatus
from ..pagination import POSResultsPagination
from ..permissions import IsPOSStaff, CanManageExpenses
from ..serializers.expenses import (
    ExpenseCategorySerializer,
    ExpenseListSerializer,
    ExpenseDetailSerializer,
    ExpenseWriteSerializer,
)


class ExpenseCategoryListCreateView(GenericAPIView):
    """
    GET/POST /api/pos/expenses/categories/

    Returns every category flat (both top-level and sub) -- the
    frontend filters client-side: parent === null for the top-level
    "Expense Category" dropdown, parent === <selected id> for "Sub
    category". Small, rarely-changing list, same pattern as
    Category/Brand/TaxRate.
    """

    pagination_class = None
    serializer_class = ExpenseCategorySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanManageExpenses()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        return ExpenseCategory.objects.select_related("parent").all()

    def get(self, request):
        return Response(self.serializer_class(self.get_queryset(), many=True).data)

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return Response(self.serializer_class(category).data, status=status.HTTP_201_CREATED)


class ExpenseCategoryDetailView(GenericAPIView):
    """PATCH/DELETE /api/pos/expenses/categories/{id}/ -- Admin/Manager only."""

    permission_classes = [IsAuthenticated, CanManageExpenses]
    serializer_class = ExpenseCategorySerializer

    def get_queryset(self):
        return ExpenseCategory.objects.all()

    def patch(self, request, pk):
        category = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.serializer_class(category, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        category = serializer.save()
        return Response(self.serializer_class(category).data)

    def delete(self, request, pk):
        category = get_object_or_404(self.get_queryset(), pk=pk)
        category.delete()  # SET_NULL on Expense.category/subcategory -- expenses survive, uncategorized
        return Response(status=status.HTTP_204_NO_CONTENT)


class ExpenseListCreateView(GenericAPIView):
    """
    GET  /api/pos/expenses/
    POST /api/pos/expenses/

    Expenses never touch stock, so unlike Purchase/Sale there's no
    stock-moving side effect here and no delete restriction tied to
    inventory integrity -- just a straightforward money record.
    """

    pagination_class = POSResultsPagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), CanManageExpenses()]
        return [IsAuthenticated(), IsPOSStaff()]

    def get_queryset(self):
        qs = Expense.objects.select_related(
            "location", "category", "subcategory", "expense_for_user",
            "expense_for_contact", "created_by",
        )
        params = self.request.query_params

        search = params.get("search", "").strip()
        if search:
            qs = qs.filter(reference_no__icontains=search)

        for param, field in [
            ("location", "location_id"),
            ("category", "category_id"),
            ("subcategory", "subcategory_id"),
            ("payment_status", "payment_status"),
            ("expense_for_contact", "expense_for_contact_id"),
        ]:
            value = params.get(param)
            if value:
                qs = qs.filter(**{field: value})

        date_from = params.get("date_from")
        date_to = params.get("date_to")
        if date_from:
            qs = qs.filter(expense_date__date__gte=date_from)
        if date_to:
            qs = qs.filter(expense_date__date__lte=date_to)

        return qs

    def get(self, request):
        page = self.paginate_queryset(self.get_queryset())
        serializer = ExpenseListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = ExpenseWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data.get("amount", Decimal("0"))
        tax_rate = serializer.validated_data.get("tax_rate")
        tax = amount * tax_rate.rate / 100 if tax_rate else Decimal("0")

        try:
            paid_amount = Decimal(str(request.data.get("paid_amount", "0")) or "0")
        except InvalidOperation:
            return Response(
                {"paid_amount": ["Not a valid number."]}, status=status.HTTP_400_BAD_REQUEST
            )

        total_payable = amount + tax
        if total_payable <= 0:
            payment_status = PaymentStatus.PAID
        elif paid_amount <= 0:
            payment_status = PaymentStatus.DUE
        elif paid_amount >= total_payable:
            payment_status = PaymentStatus.PAID
        else:
            payment_status = PaymentStatus.PARTIAL

        expense = serializer.save(
            created_by=request.user,
            tax=tax,
            paid_amount=min(paid_amount, total_payable) if total_payable > 0 else paid_amount,
            payment_status=payment_status,
        )

        return Response(
            ExpenseDetailSerializer(expense, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ExpenseDetailView(GenericAPIView):
    """GET/PATCH/DELETE /api/pos/expenses/{id}/"""

    def get_permissions(self):
        if self.request.method == "GET":
            return [IsAuthenticated(), IsPOSStaff()]
        return [IsAuthenticated(), CanManageExpenses()]

    def get_queryset(self):
        return Expense.objects.select_related("location", "category", "subcategory", "tax_rate")

    def _get_object(self, pk):
        return get_object_or_404(self.get_queryset(), pk=pk)

    def get(self, request, pk):
        expense = self._get_object(pk)
        return Response(ExpenseDetailSerializer(expense, context={"request": request}).data)

    def patch(self, request, pk):
        expense = self._get_object(pk)
        serializer = ExpenseWriteSerializer(expense, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        amount = serializer.validated_data.get("amount", expense.amount)
        tax_rate = serializer.validated_data.get("tax_rate", expense.tax_rate)
        tax = amount * tax_rate.rate / 100 if tax_rate else Decimal("0")

        expense = serializer.save(tax=tax)
        return Response(ExpenseDetailSerializer(expense, context={"request": request}).data)

    def delete(self, request, pk):
        expense = self._get_object(pk)
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
