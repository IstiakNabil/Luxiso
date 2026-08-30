from django.contrib import admin

from .models import (
    Business,
    DocumentPrefix,
    Location,
    POSStaffProfile,
    Contact,
    CustomerGroup,
    Unit,
    Category,
    Brand,
    TaxRate,
    POSProduct,
    POSVariant,
    Batch,
    StockLevel,
    StockMovement,
    Purchase,
    PurchaseItem,
    PurchaseReturn,
    Sale,
    SaleItem,
    SaleReturn,
    ExpenseCategory,
    Expense,
    StockAdjustment,
    StockAdjustmentItem,
    PurchasePayment,
    SalePayment,
)


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ("name", "currency_code", "timezone")


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "phone")
    list_filter = ("is_active",)


@admin.register(POSStaffProfile)
class POSStaffProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "is_active")
    list_filter = ("role", "is_active")
    filter_horizontal = ("locations",)


@admin.register(CustomerGroup)
class CustomerGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ("contact_code", "name", "contact_type", "phone", "city", "is_active")
    list_filter = ("contact_type", "is_active", "customer_group")
    search_fields = ("name", "phone", "email", "contact_code")
    readonly_fields = ("contact_code",)


class POSVariantInline(admin.TabularInline):
    model = POSVariant
    extra = 1


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("name", "short_name", "allow_decimal")
    search_fields = ("name", "short_name")


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "category_code", "is_active")


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active")


@admin.register(TaxRate)
class TaxRateAdmin(admin.ModelAdmin):
    list_display = ("name", "rate", "is_active")


@admin.register(POSProduct)
class POSProductAdmin(admin.ModelAdmin):
    list_display = (
        "name", "sku", "unit", "category", "brand", "manage_stock", "has_variants", "is_active",
    )
    list_filter = ("category", "brand", "manage_stock", "has_variants", "is_active")
    search_fields = ("name", "sku")
    filter_horizontal = ("locations",)
    inlines = [POSVariantInline]


@admin.register(POSVariant)
class POSVariantAdmin(admin.ModelAdmin):
    list_display = ("__str__", "sku", "selling_price", "is_active")
    search_fields = ("sku", "product__name", "variant_name")


@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ("variant", "location", "batch_number", "expiry_date", "quantity")
    list_filter = ("location",)


@admin.register(StockLevel)
class StockLevelAdmin(admin.ModelAdmin):
    list_display = ("variant", "location", "quantity", "updated_at")
    list_filter = ("location",)
    search_fields = ("variant__sku", "variant__product__name")


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ("variant", "location", "movement_type", "quantity", "created_at")
    list_filter = ("movement_type", "location")
    readonly_fields = [f.name for f in StockMovement._meta.fields]


class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 1


@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no",
        "supplier",
        "location",
        "purchase_date",
        "total",
        "paid_amount",
        "payment_status",
        "status",
    )
    list_filter = ("status", "payment_status", "location")
    readonly_fields = ("reference_no",)
    inlines = [PurchaseItemInline]


@admin.register(PurchaseReturn)
class PurchaseReturnAdmin(admin.ModelAdmin):
    list_display = ("reference_no", "purchase", "return_date", "total", "payment_status")
    readonly_fields = ("reference_no",)


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 1


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_no",
        "customer",
        "location",
        "sale_date",
        "total",
        "paid_amount",
        "payment_status",
        "status",
        "shipping_status",
    )
    list_filter = ("status", "payment_status", "shipping_status", "location")
    readonly_fields = ("invoice_no",)
    inlines = [SaleItemInline]


@admin.register(SaleReturn)
class SaleReturnAdmin(admin.ModelAdmin):
    list_display = ("reference_no", "sale", "return_date", "total", "payment_status")
    readonly_fields = ("reference_no",)


@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "category_code", "parent", "is_active")


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no", "category", "location", "amount", "tax",
        "payment_status", "expense_date",
    )
    list_filter = ("location", "category", "payment_status", "is_refund")
    readonly_fields = ("reference_no",)


class StockAdjustmentItemInline(admin.TabularInline):
    model = StockAdjustmentItem
    extra = 1


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = (
        "reference_no", "location", "adjustment_date", "adjustment_type",
        "total_amount", "total_amount_recovered",
    )
    list_filter = ("adjustment_type", "location")
    readonly_fields = ("reference_no",)
    inlines = [StockAdjustmentItemInline]


@admin.register(PurchasePayment)
class PurchasePaymentAdmin(admin.ModelAdmin):
    list_display = ("reference_no", "purchase", "amount", "payment_method", "paid_on")
    readonly_fields = ("reference_no",)


@admin.register(SalePayment)
class SalePaymentAdmin(admin.ModelAdmin):
    list_display = ("reference_no", "sale", "amount", "payment_method", "paid_on")
    readonly_fields = ("reference_no",)


@admin.register(DocumentPrefix)
class DocumentPrefixAdmin(admin.ModelAdmin):
    list_display = ("document_type", "prefix")
