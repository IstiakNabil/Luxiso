from django.db.models import Sum, F, DecimalField, Value, OuterRef, Subquery
from django.db.models.functions import Coalesce
from rest_framework import serializers

from ..models import Contact, CustomerGroup, Sale, Purchase, SaleReturn, PurchaseReturn, PaymentStatus

DECIMAL_ZERO = DecimalField(max_digits=12, decimal_places=2)


def with_contact_totals(queryset):
    """
    Annotates total_sale_due / total_purchase_due / total_sell_return /
    total_purchase_return via correlated subqueries, never a combined
    Sum() across multiple reverse relations on one queryset -- that
    causes a SQL join fan-out that silently inflates every total
    (every sale row cross-joins against every purchase/return row for
    the same contact). Each total gets its own isolated subquery.
    """
    sale_due = (
        Sale.objects.filter(customer=OuterRef("pk"))
        .exclude(payment_status=PaymentStatus.PAID)
        .values("customer")
        .annotate(total=Sum(F("total") - F("paid_amount")))
        .values("total")
    )
    purchase_due = (
        Purchase.objects.filter(supplier=OuterRef("pk"))
        .exclude(payment_status=PaymentStatus.PAID)
        .values("supplier")
        .annotate(total=Sum(F("total") - F("paid_amount")))
        .values("total")
    )
    sell_return = (
        SaleReturn.objects.filter(sale__customer=OuterRef("pk"))
        .values("sale__customer")
        .annotate(total=Sum("total"))
        .values("total")
    )
    purchase_return = (
        PurchaseReturn.objects.filter(purchase__supplier=OuterRef("pk"))
        .values("purchase__supplier")
        .annotate(total=Sum("total"))
        .values("total")
    )

    def _coalesced(subquery):
        return Coalesce(
            Subquery(subquery, output_field=DECIMAL_ZERO), Value(0), output_field=DECIMAL_ZERO
        )

    return queryset.annotate(
        total_sale_due=_coalesced(sale_due),
        total_purchase_due=_coalesced(purchase_due),
        total_sell_return=_coalesced(sell_return),
        total_purchase_return=_coalesced(purchase_return),
    )


class CustomerGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerGroup
        fields = ["id", "name", "description", "is_active"]


class ContactListSerializer(serializers.ModelSerializer):
    total_sale_due = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_purchase_due = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_sell_return = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_purchase_return = serializers.DecimalField(max_digits=12, decimal_places=2)
    customer_group_name = serializers.CharField(
        source="customer_group.name", read_only=True, default=None
    )
    pay_term = serializers.SerializerMethodField()

    class Meta:
        model = Contact
        fields = [
            "id",
            "contact_code",
            "contact_type",
            "name",
            "business_name",
            "email",
            "tax_number",
            "credit_limit",
            "pay_term",
            "opening_balance",
            "advance_balance",
            "created_at",
            "customer_group",
            "customer_group_name",
            "address",
            "phone",
            "city",
            "is_active",
            "total_sale_due",
            "total_purchase_due",
            "total_sell_return",
            "total_purchase_return",
        ]

    def get_pay_term(self, obj):
        return f"{obj.pay_term_days} Days" if obj.pay_term_days else "No Term"


class ContactDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = [
            "id",
            "contact_code",
            "contact_type",
            "name",
            "business_name",
            "phone",
            "email",
            "address",
            "city",
            "country",
            "tax_number",
            "customer_group",
            "credit_limit",
            "pay_term_days",
            "opening_balance",
            "advance_balance",
            "custom_field_1",
            "custom_field_2",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["contact_code", "created_at"]


class ContactWriteSerializer(serializers.ModelSerializer):
    customer_group = serializers.PrimaryKeyRelatedField(
        queryset=CustomerGroup.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Contact
        fields = [
            "contact_type",
            "name",
            "business_name",
            "phone",
            "email",
            "address",
            "city",
            "country",
            "tax_number",
            "customer_group",
            "credit_limit",
            "pay_term_days",
            "opening_balance",
            "advance_balance",
            "custom_field_1",
            "custom_field_2",
            "is_active",
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name is required.")
        return value
