from decimal import Decimal

from django.db.models import Sum
from rest_framework import serializers

from ..models import (
    Purchase,
    PurchaseItem,
    PurchaseReturn,
    PurchaseReturnItem,
    Contact,
    Location,
    TaxRate,
)


class PurchaseListSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source="location.name", read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_status_display = serializers.CharField(
        source="get_payment_status_display", read_only=True
    )
    added_by = serializers.SerializerMethodField()
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Purchase
        fields = [
            "id",
            "reference_no",
            "purchase_date",
            "location_name",
            "supplier_name",
            "status",
            "status_display",
            "payment_status",
            "payment_status_display",
            "total",
            "due_amount",
            "added_by",
        ]

    def get_added_by(self, obj):
        if not obj.created_by:
            return ""
        return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()


class PurchaseItemDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.variant_name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)
    profit_margin_percent = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseItem
        fields = [
            "id",
            "variant",
            "product_name",
            "variant_name",
            "sku",
            "quantity",
            "unit_cost",
            "discount_percent",
            "unit_cost_after_discount",
            "line_total",
            "selling_price",
            "profit_margin_percent",
            "mfg_date",
            "exp_date",
        ]

    def get_profit_margin_percent(self, obj):
        if not obj.selling_price or not obj.unit_cost_after_discount:
            return None
        if obj.unit_cost_after_discount == 0:
            return None
        margin = (obj.selling_price - obj.unit_cost_after_discount) / obj.unit_cost_after_discount * 100
        return f"{margin:.2f}"


class PurchaseDetailSerializer(serializers.ModelSerializer):
    items = PurchaseItemDetailSerializer(many=True, read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True)
    supplier_name = serializers.CharField(source="supplier.name", read_only=True)
    tax_name = serializers.CharField(source="tax_rate.name", default=None, read_only=True)
    attached_document_url = serializers.SerializerMethodField()

    class Meta:
        model = Purchase
        fields = [
            "id",
            "reference_no",
            "purchase_date",
            "pay_term_days",
            "location",
            "location_name",
            "supplier",
            "supplier_name",
            "status",
            "payment_status",
            "attached_document_url",
            "subtotal",
            "discount_type",
            "discount_amount",
            "discount",
            "tax_rate",
            "tax_name",
            "tax",
            "shipping_details",
            "shipping_charges",
            "additional_expenses_note",
            "additional_expenses_amount",
            "total",
            "paid_amount",
            "payment_method",
            "paid_on",
            "payment_note",
            "due_amount",
            "notes",
            "items",
            "created_at",
        ]

    def get_attached_document_url(self, obj):
        request = self.context.get("request")
        if obj.attached_document and hasattr(obj.attached_document, "url"):
            return (
                request.build_absolute_uri(obj.attached_document.url)
                if request
                else obj.attached_document.url
            )
        return None


class PurchaseWriteSerializer(serializers.ModelSerializer):
    """
    Order-level fields only. Line items and stock/price side-effects
    are handled in the view (see ProductPurchaseCreateView.post) since
    items arrive as a JSON-encoded string alongside the multipart
    attached_document upload.
    """

    supplier = serializers.PrimaryKeyRelatedField(queryset=Contact.objects.all())
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    tax_rate = serializers.PrimaryKeyRelatedField(
        queryset=TaxRate.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Purchase
        fields = [
            "supplier",
            "location",
            "reference_no",
            "purchase_date",
            "pay_term_days",
            "status",
            "attached_document",
            "discount_type",
            "discount_amount",
            "tax_rate",
            "shipping_details",
            "shipping_charges",
            "additional_expenses_note",
            "additional_expenses_amount",
            "payment_method",
            "paid_on",
            "payment_note",
            "notes",
        ]


class PurchaseReturnListSerializer(serializers.ModelSerializer):
    parent_purchase_reference = serializers.CharField(
        source="purchase.reference_no", read_only=True
    )
    location_name = serializers.CharField(source="location.name", read_only=True)
    supplier_name = serializers.CharField(source="purchase.supplier.name", read_only=True)
    payment_status_display = serializers.CharField(
        source="get_payment_status_display", read_only=True
    )
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseReturn
        fields = [
            "id",
            "return_date",
            "reference_no",
            "parent_purchase_reference",
            "location_name",
            "supplier_name",
            "payment_status",
            "payment_status_display",
            "total",
            "due_amount",
        ]


class PurchaseReturnItemDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.variant_name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)

    class Meta:
        model = PurchaseReturnItem
        fields = [
            "id", "variant", "product_name", "variant_name", "sku",
            "quantity", "unit_cost", "line_total",
        ]


class PurchaseReturnDetailSerializer(serializers.ModelSerializer):
    items = PurchaseReturnItemDetailSerializer(many=True, read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True)
    parent_purchase_reference = serializers.CharField(
        source="purchase.reference_no", read_only=True
    )
    supplier_name = serializers.CharField(source="purchase.supplier.name", read_only=True)
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseReturn
        fields = [
            "id", "reference_no", "purchase", "parent_purchase_reference", "supplier_name",
            "location", "location_name", "return_date", "total", "paid_amount",
            "payment_status", "due_amount", "reason", "items", "created_at",
        ]


class PurchasableItemSerializer(serializers.ModelSerializer):
    """
    Powers the Add Purchase Return item picker: for a chosen Purchase,
    shows each original line plus how much of it has already been
    returned, so the person can't return more than remains.
    """

    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.variant_name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)
    already_returned = serializers.SerializerMethodField()
    returnable_quantity = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseItem
        fields = [
            "id", "variant", "product_name", "variant_name", "sku",
            "quantity", "unit_cost_after_discount", "already_returned", "returnable_quantity",
        ]

    def get_already_returned(self, obj):
        total = PurchaseReturnItem.objects.filter(
            purchase_return__purchase=obj.purchase, variant=obj.variant
        ).aggregate(total=Sum("quantity"))["total"]
        return total or 0

    def get_returnable_quantity(self, obj):
        return obj.quantity - self.get_already_returned(obj)
