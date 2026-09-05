from django.urls import path

from ..views.lookups import (
    CategoryListCreateView,
    CategoryDetailView,
    BrandListCreateView,
    BrandDetailView,
    TaxRateListCreateView,
    TaxRateDetailView,
    POSColorListCreateView,
    POSColorDetailView,
    POSSizeListCreateView,
    POSSizeDetailView,
    POSStorefrontCategoryListCreateView,
    POSStorefrontCategoryDetailView,
    POSStorefrontTypeListCreateView,
    POSStorefrontTypeDetailView,
)

urlpatterns = [
    path("categories/", CategoryListCreateView.as_view(), name="pos-categories-list"),
    path("categories/<int:pk>/", CategoryDetailView.as_view(), name="pos-categories-detail"),
    path("brands/", BrandListCreateView.as_view(), name="pos-brands-list"),
    path("brands/<int:pk>/", BrandDetailView.as_view(), name="pos-brands-detail"),
    path("tax-rates/", TaxRateListCreateView.as_view(), name="pos-tax-rates-list"),
    path("tax-rates/<int:pk>/", TaxRateDetailView.as_view(), name="pos-tax-rates-detail"),
    path("colors/", POSColorListCreateView.as_view(), name="pos-colors-list"),
    path("colors/<int:pk>/", POSColorDetailView.as_view(), name="pos-colors-detail"),
    path("sizes/", POSSizeListCreateView.as_view(), name="pos-sizes-list"),
    path("sizes/<int:pk>/", POSSizeDetailView.as_view(), name="pos-sizes-detail"),
    path(
        "storefront-categories/",
        POSStorefrontCategoryListCreateView.as_view(),
        name="pos-storefront-categories-list",
    ),
    path(
        "storefront-categories/<int:pk>/",
        POSStorefrontCategoryDetailView.as_view(),
        name="pos-storefront-categories-detail",
    ),
    path(
        "storefront-types/",
        POSStorefrontTypeListCreateView.as_view(),
        name="pos-storefront-types-list",
    ),
    path(
        "storefront-types/<int:pk>/",
        POSStorefrontTypeDetailView.as_view(),
        name="pos-storefront-types-detail",
    ),
]
