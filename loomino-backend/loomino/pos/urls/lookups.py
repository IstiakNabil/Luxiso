from django.urls import path

from ..views.lookups import (
    CategoryListCreateView,
    CategoryDetailView,
    BrandListCreateView,
    BrandDetailView,
    TaxRateListCreateView,
    TaxRateDetailView,
)

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="pos-categories-list"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="pos-categories-detail"),
    path("brands/", BrandListCreateView.as_view(), name="pos-brands-list"),
    path("brands/<int:pk>/", BrandDetailView.as_view(), name="pos-brands-detail"),
    path("tax-rates/", TaxRateListCreateView.as_view(), name="pos-tax-rates-list"),
    path("tax-rates/<int:pk>/", TaxRateDetailView.as_view(), name="pos-tax-rates-detail"),
]
