from rest_framework import serializers

from ..models import Expense, ExpenseCategory, Location, Contact, TaxRate


class ExpenseCategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source="parent.name", default=None, read_only=True)

    class Meta:
        model = ExpenseCategory
        fields = ["id", "name", "category_code", "parent", "parent_name", "is_active"]


class ExpenseListSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source="location.name", default="-", read_only=True)
    category_name = serializers.CharField(source="category.name", default="-", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", default=None, read_only=True)
    payment_status_display = serializers.CharField(
        source="get_payment_status_display", read_only=True
    )
    expense_for = serializers.SerializerMethodField()
    contact_name = serializers.CharField(source="expense_for_contact.name", default=None, read_only=True)
    recurring_details = serializers.SerializerMethodField()
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    added_by = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = [
            "id", "reference_no", "expense_date", "recurring_details", "category_name",
            "subcategory_name", "location_name", "payment_status", "payment_status_display",
            "tax", "amount", "due_amount", "expense_for", "contact_name", "note",
            "is_refund", "added_by",
        ]

    def get_expense_for(self, obj):
        if obj.expense_for_user:
            return f"{obj.expense_for_user.first_name} {obj.expense_for_user.last_name}".strip()
        return None

    def get_recurring_details(self, obj):
        if not obj.is_recurring:
            return None
        reps = obj.recurring_repetitions if obj.recurring_repetitions is not None else "∞"
        return f"Every {obj.recurring_interval_value} {obj.recurring_interval_unit} × {reps}"

    def get_added_by(self, obj):
        if not obj.created_by:
            return ""
        return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip()


class ExpenseDetailSerializer(serializers.ModelSerializer):
    location_name = serializers.CharField(source="location.name", default="-", read_only=True)
    category_name = serializers.CharField(source="category.name", default=None, read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", default=None, read_only=True)
    tax_name = serializers.CharField(source="tax_rate.name", default=None, read_only=True)
    attached_document_url = serializers.SerializerMethodField()
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Expense
        fields = [
            "id", "reference_no", "location", "location_name", "category", "category_name",
            "subcategory", "subcategory_name", "expense_date", "expense_for_user",
            "expense_for_contact", "attached_document_url", "tax_rate", "tax_name", "tax",
            "amount", "is_refund", "is_recurring", "recurring_interval_value",
            "recurring_interval_unit", "recurring_repetitions", "paid_amount",
            "payment_status", "payment_method", "paid_on", "payment_note", "due_amount",
            "note", "created_at",
        ]

    def get_attached_document_url(self, obj):
        request = self.context.get("request")
        if obj.attached_document and hasattr(obj.attached_document, "url"):
            return (
                request.build_absolute_uri(obj.attached_document.url)
                if request else obj.attached_document.url
            )
        return None


class ExpenseWriteSerializer(serializers.ModelSerializer):
    location = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), required=False, allow_null=True
    )
    category = serializers.PrimaryKeyRelatedField(
        queryset=ExpenseCategory.objects.all(), required=False, allow_null=True
    )
    subcategory = serializers.PrimaryKeyRelatedField(
        queryset=ExpenseCategory.objects.all(), required=False, allow_null=True
    )
    expense_for_contact = serializers.PrimaryKeyRelatedField(
        queryset=Contact.objects.all(), required=False, allow_null=True
    )
    tax_rate = serializers.PrimaryKeyRelatedField(
        queryset=TaxRate.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Expense
        fields = [
            "location", "category", "subcategory", "reference_no", "expense_date",
            "expense_for_user", "expense_for_contact", "attached_document", "tax_rate",
            "amount", "is_refund", "is_recurring", "recurring_interval_value",
            "recurring_interval_unit", "recurring_repetitions", "payment_method",
            "paid_on", "payment_note", "note",
        ]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        subcategory = attrs.get(
            "subcategory", instance.subcategory if instance else None
        )
        category = attrs.get("category", instance.category if instance else None)
        if subcategory and subcategory.parent_id and category and subcategory.parent_id != category.id:
            raise serializers.ValidationError(
                {"subcategory": "This subcategory doesn't belong to the selected category."}
            )
        return attrs
