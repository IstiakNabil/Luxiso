from rest_framework import serializers

from django.db.models import Sum

from ..models import Sale, SaleItem, SaleReturn, SaleReturnItem, Contact, Location, TaxRate


class SaleListSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source="location.name", read_only=True)
    customer_name = serializers.CharField(read_only=True)
    customer_phone = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_status_display = serializers.CharField(
        source="get_payment_status_display", read_only=True
    )
    shipping_status_display = serializers.CharField(
        source="get_shipping_status_display", read_only=True
    )
    added_by = serializers.SerializerMethodField()
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Sale
        fields = [
            "id", "invoice_no", "sale_date", "location_name", "customer_name",
            "customer_phone", "status", "status_display", "payment_status",
            "payment_status_display", "shipping_status", "shipping_status_display",
            "total", "paid_amount", "due_amount", "total_quantity", "added_by",
        ]

    def get_added_by(self, obj):
        if not obj.added_by:
            return ""
        return f"{obj.added_by.first_name} {obj.added_by.last_name}".strip()


class SaleItemDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.variant_name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)

    class Meta:
        model = SaleItem
        fields = [
            "id", "variant", "product_name", "variant_name", "sku",
            "quantity", "unit_price", "discount_amount", "subtotal",
        ]


class SaleDetailSerializer(serializers.ModelSerializer):
    items = SaleItemDetailSerializer(many=True, read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True)
    customer_name = serializers.CharField(read_only=True)
    customer_phone = serializers.CharField(read_only=True)
    tax_name = serializers.CharField(source="tax_rate.name", default=None, read_only=True)
    attached_document_url = serializers.SerializerMethodField()
    shipping_documents_url = serializers.SerializerMethodField()

    class Meta:
        model = Sale
        fields = [
            "id", "invoice_no", "sale_date", "pay_term_days", "location", "location_name",
            "customer", "customer_name", "customer_phone", "status", "shipping_status",
            "payment_status", "attached_document_url", "subtotal", "discount_type",
            "discount_amount", "discount", "tax_rate", "tax_name", "tax", "notes",
            "shipping_details", "shipping_address", "shipping_charges", "delivered_to",
            "shipping_documents_url", "additional_expenses_note", "additional_expenses_amount",
            "total", "paid_amount", "payment_method", "paid_on", "payment_note",
            "due_amount", "total_quantity", "shipped_quantity", "quantity_remaining",
            "items", "created_at",
        ]

    def get_attached_document_url(self, obj):
        request = self.context.get("request")
        if obj.attached_document and hasattr(obj.attached_document, "url"):
            return (
                request.build_absolute_uri(obj.attached_document.url)
                if request else obj.attached_document.url
            )
        return None

    def get_shipping_documents_url(self, obj):
        request = self.context.get("request")
        if obj.shipping_documents and hasattr(obj.shipping_documents, "url"):
            return (
                request.build_absolute_uri(obj.shipping_documents.url)
                if request else obj.shipping_documents.url
            )
        return None


class SaleWriteSerializer(serializers.ModelSerializer):
    """
    Order-level fields only, shared by Add Sale / Add Draft / Add
    Quotation (they differ only in `status`). Line items and
    stock/price side-effects are handled in the view, same pattern as
    Purchase.
    """

    customer = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(), required=False, allow_null=True
    )
    location = serializers.PrimaryKeyRelatedField(queryset=Location.objects.all())
    tax_rate = serializers.PrimaryKeyRelatedField(
        queryset=TaxRate.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Sale
        fields = [
            "customer", "location", "invoice_no", "sale_date", "pay_term_days", "status",
            "attached_document", "discount_type", "discount_amount", "tax_rate",
            "notes", "shipping_details", "shipping_address", "shipping_charges",
            "delivered_to", "shipping_documents", "additional_expenses_note",
            "additional_expenses_amount", "payment_method", "paid_on", "payment_note",
        ]


class SaleReturnListSerializer(serializers.ModelSerializer):
    parent_sale_invoice = serializers.CharField(source="sale.invoice_no", read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True)
    customer_name = serializers.CharField(source="sale.customer_name", read_only=True)
    payment_status_display = serializers.CharField(
        source="get_payment_status_display", read_only=True
    )
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SaleReturn
        fields = [
            "id", "return_date", "reference_no", "parent_sale_invoice", "location_name",
            "customer_name", "payment_status", "payment_status_display", "total", "due_amount",
        ]


class SaleReturnItemDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.variant_name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)

    class Meta:
        model = SaleReturnItem
        fields = ["id", "variant", "product_name", "variant_name", "sku", "quantity", "unit_price", "line_total"]


class SaleReturnDetailSerializer(serializers.ModelSerializer):
    items = SaleReturnItemDetailSerializer(many=True, read_only=True)
    location_name = serializers.CharField(source="location.name", read_only=True)
    parent_sale_invoice = serializers.CharField(source="sale.invoice_no", read_only=True)
    customer_name = serializers.CharField(source="sale.customer_name", read_only=True)
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SaleReturn
        fields = [
            "id", "reference_no", "sale", "parent_sale_invoice", "customer_name", "location",
            "location_name", "return_date", "total", "paid_amount", "payment_status",
            "due_amount", "reason", "items", "created_at",
        ]


class ReturnableSaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.variant_name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)
    already_returned = serializers.SerializerMethodField()
    returnable_quantity = serializers.SerializerMethodField()

    class Meta:
        model = SaleItem
        fields = [
            "id", "variant", "product_name", "variant_name", "sku",
            "quantity", "unit_price", "already_returned", "returnable_quantity",
        ]

    def get_already_returned(self, obj):
        total = SaleReturnItem.objects.filter(
            sale_return__sale=obj.sale, variant=obj.variant
        ).aggregate(total=Sum("quantity"))["total"]
        return total or 0

    def get_returnable_quantity(self, obj):
        return obj.quantity - self.get_already_returned(obj)
