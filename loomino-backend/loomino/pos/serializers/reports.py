from django.db.models import Sum
from rest_framework import serializers

from ..models import PurchasePayment, SalePayment, PurchaseItem, PurchaseReturnItem, SaleItem


class PurchasePaymentReportSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="purchase.supplier.name", read_only=True)
    purchase_reference_no = serializers.CharField(source="purchase.reference_no", read_only=True)
    payment_method_display = serializers.CharField(
        source="get_payment_method_display", read_only=True
    )
    attached_document_url = serializers.SerializerMethodField()

    class Meta:
        model = PurchasePayment
        fields = [
            "id", "reference_no", "paid_on", "amount", "supplier_name",
            "payment_method", "payment_method_display", "payment_reference",
            "purchase", "purchase_reference_no", "attached_document_url",
        ]

    def get_attached_document_url(self, obj):
        request = self.context.get("request")
        if obj.attached_document and hasattr(obj.attached_document, "url"):
            return (
                request.build_absolute_uri(obj.attached_document.url)
                if request else obj.attached_document.url
            )
        return None


class SalePaymentReportSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="sale.customer_name", read_only=True)
    customer_group_name = serializers.CharField(
        source="sale.customer.customer_group.name", default=None, read_only=True
    )
    sale_invoice_no = serializers.CharField(source="sale.invoice_no", read_only=True)
    payment_method_display = serializers.CharField(
        source="get_payment_method_display", read_only=True
    )
    attached_document_url = serializers.SerializerMethodField()

    class Meta:
        model = SalePayment
        fields = [
            "id", "reference_no", "paid_on", "amount", "customer_name", "customer_group_name",
            "payment_method", "payment_method_display", "payment_reference",
            "sale", "sale_invoice_no", "attached_document_url",
        ]

    def get_attached_document_url(self, obj):
        request = self.context.get("request")
        if obj.attached_document and hasattr(obj.attached_document, "url"):
            return (
                request.build_absolute_uri(obj.attached_document.url)
                if request else obj.attached_document.url
            )
        return None


class ProductPurchaseReportSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.variant_name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)
    supplier_name = serializers.CharField(source="purchase.supplier.name", read_only=True)
    reference_no = serializers.CharField(source="purchase.reference_no", read_only=True)
    date = serializers.DateTimeField(source="purchase.purchase_date", read_only=True)
    unit_name = serializers.CharField(
        source="variant.product.unit.short_name", default="", read_only=True
    )
    total_unit_adjusted = serializers.SerializerMethodField()

    class Meta:
        model = PurchaseItem
        fields = [
            "id", "product_name", "variant_name", "sku", "supplier_name",
            "purchase", "reference_no", "date", "quantity", "unit_name",
            "total_unit_adjusted", "unit_cost_after_discount", "line_total",
        ]

    def get_total_unit_adjusted(self, obj):
        # "returned" quantity is annotated on the queryset (see the
        # view) via a correlated subquery -- fall back to a direct
        # query only if this serializer is ever used without that
        # annotation.
        if hasattr(obj, "returned_quantity"):
            return obj.returned_quantity
        from ..models import PurchaseReturnItem
        total = PurchaseReturnItem.objects.filter(
            purchase_return__purchase_id=obj.purchase_id, variant_id=obj.variant_id
        ).aggregate(total=Sum("quantity"))["total"]
        return total or 0


class StockReportRowSerializer(serializers.Serializer):
    """
    Backed by a plain dict built in the view (see StockReportView) --
    one row per (variant, location) with values requiring several
    correlated aggregates that are cleaner to assemble in Python than
    to force into a single ORM annotation.
    """

    sku = serializers.CharField()
    product_name = serializers.CharField()
    location_name = serializers.CharField()
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    current_stock = serializers.DecimalField(max_digits=12, decimal_places=2)
    unit_name = serializers.CharField()
    stock_value_by_purchase_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    stock_value_by_sale_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    potential_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_unit_sold = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_unit_transferred = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_unit_adjusted = serializers.DecimalField(max_digits=12, decimal_places=2)


class ProductSaleReportRowSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="variant.product.name", read_only=True)
    variant_name = serializers.CharField(source="variant.variant_name", read_only=True)
    sku = serializers.CharField(source="variant.sku", read_only=True)
    unit_name = serializers.CharField(
        source="variant.product.unit.short_name", default="", read_only=True
    )
    customer_name = serializers.CharField(source="sale.customer_name", read_only=True)
    contact_id = serializers.SerializerMethodField()
    invoice_no = serializers.CharField(source="sale.invoice_no", read_only=True)
    sale_id = serializers.IntegerField(source="sale.id", read_only=True)
    date = serializers.DateTimeField(source="sale.sale_date", read_only=True)
    tax = serializers.SerializerMethodField()
    price_inc_tax = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = SaleItem
        fields = [
            "id", "product_name", "variant_name", "sku", "unit_name", "customer_name",
            "contact_id", "invoice_no", "sale_id", "date", "quantity", "unit_price",
            "discount_amount", "tax", "price_inc_tax", "total",
        ]

    def get_contact_id(self, obj):
        return obj.sale.customer.contact_code if obj.sale.customer else None

    def _line_tax(self, obj):
        # Per-line tax share: the order's tax rate applied to this
        # line's own subtotal. This is an approximation -- it doesn't
        # account for how the order-level discount was distributed
        # across lines -- but it's a reasonable, clearly-documented
        # estimate rather than a claim of exact per-line tax.
        if not obj.sale.tax_rate:
            return 0
        return obj.subtotal * obj.sale.tax_rate.rate / 100

    def get_tax(self, obj):
        return self._line_tax(obj)

    def get_price_inc_tax(self, obj):
        qty = obj.quantity or 1
        return obj.unit_price + (self._line_tax(obj) / qty)

    def get_total(self, obj):
        return obj.subtotal + self._line_tax(obj)
