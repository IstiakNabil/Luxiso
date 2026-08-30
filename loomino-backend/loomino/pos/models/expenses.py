from django.db import models

from .core import Location, get_document_prefix, DocumentType
from .contacts import Contact
from .lookups import TaxRate
from .purchase import PaymentStatus, PaymentMethod


class ExpenseCategory(models.Model):
    """
    Supports one level of sub-categories via `parent` -- Add Expense's
    "Sub category" dropdown lists categories where parent=the chosen
    top-level category.
    """

    name = models.CharField(max_length=100, unique=True)
    category_code = models.CharField(max_length=50, blank=True)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="subcategories"
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "Expense Categories"

    def __str__(self):
        return self.name


class RecurringInterval(models.TextChoices):
    DAYS = "days", "Days"
    MONTHS = "months", "Months"
    YEARS = "years", "Years"


class Expense(models.Model):
    """
    "Expense for" (expense_for_user) tags an expense to a staff member
    (e.g. a salary payment); "Expense for contact" tags it to a
    supplier/vendor not necessarily tied to a Purchase. Both are
    independent and optional.

    Recurring fields (is_recurring/interval/repetitions) are stored
    but NOT automatically acted on -- actually generating future
    expense rows on a schedule needs a background task runner, which
    isn't part of this project yet. This is a deliberate scope limit,
    not an oversight; the fields exist so the UI and data model are
    ready once that's built.
    """

    location = models.ForeignKey(
        Location, on_delete=models.PROTECT, related_name="expenses", null=True, blank=True
    )
    category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="expenses",
    )
    subcategory = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sub_expenses",
        help_text="Must be a subcategory of `category`, if set.",
    )

    reference_no = models.CharField(max_length=50, unique=True, blank=True)
    expense_date = models.DateTimeField()

    expense_for_user = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_expenses_for_me",
        help_text='"Expense for" -- e.g. a salary payment tagged to a staff member.',
    )
    expense_for_contact = models.ForeignKey(
        Contact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_expenses_for_contact",
    )

    attached_document = models.FileField(
        upload_to="pos/expenses/documents/", blank=True, null=True
    )

    tax_rate = models.ForeignKey(
        TaxRate, on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses"
    )
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_refund = models.BooleanField(
        default=False,
        help_text="Marks this as money coming back rather than going out -- nets "
        "against total expense in reports rather than adding to it.",
    )

    is_recurring = models.BooleanField(default=False)
    recurring_interval_value = models.PositiveIntegerField(null=True, blank=True)
    recurring_interval_unit = models.CharField(
        max_length=10, choices=RecurringInterval.choices, blank=True
    )
    recurring_repetitions = models.PositiveIntegerField(
        null=True, blank=True, help_text="Blank = repeats indefinitely."
    )

    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    payment_status = models.CharField(
        max_length=10, choices=PaymentStatus.choices, default=PaymentStatus.DUE
    )
    payment_method = models.CharField(
        max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.CASH
    )
    paid_on = models.DateTimeField(null=True, blank=True)
    payment_note = models.TextField(blank=True)

    note = models.TextField(blank=True)

    created_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="pos_expenses_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-expense_date", "-id"]

    def __str__(self):
        return f"{self.category or 'Expense'} - {self.amount}"

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.reference_no:
            self.reference_no = f"{get_document_prefix(DocumentType.EXPENSE)}{self.id:05d}"
            super().save(update_fields=["reference_no"])

    @property
    def due_amount(self):
        return self.amount + self.tax - self.paid_amount
