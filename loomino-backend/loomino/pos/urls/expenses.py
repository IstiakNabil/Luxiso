from django.urls import path

from ..views.expenses import (
    ExpenseCategoryListCreateView,
    ExpenseCategoryDetailView,
    ExpenseListCreateView,
    ExpenseDetailView,
)

urlpatterns = [
    path("", ExpenseListCreateView.as_view(), name="pos-expenses-list"),
    path("<int:pk>/", ExpenseDetailView.as_view(), name="pos-expenses-detail"),
    path(
        "categories/",
        ExpenseCategoryListCreateView.as_view(),
        name="pos-expense-categories-list",
    ),
    path(
        "categories/<int:pk>/",
        ExpenseCategoryDetailView.as_view(),
        name="pos-expense-categories-detail",
    ),
]
