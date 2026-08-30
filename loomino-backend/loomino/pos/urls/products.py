from django.urls import path, include

from ..views.products import (
    ProductListCreateView,
    ProductDetailView,
    VariantSearchListView,
    VariantScanView,
)

urlpatterns = [
    path("", ProductListCreateView.as_view(), name="pos-products-list"),
    path("variants/search/", VariantSearchListView.as_view(), name="pos-variants-search"),
    path("variants/scan/", VariantScanView.as_view(), name="pos-variants-scan"),
    path("<int:pk>/", ProductDetailView.as_view(), name="pos-products-detail"),
    path("units/", include("pos.urls.units")),
    path("", include("pos.urls.lookups")),
    # Future Products sub-pages mount here:
    # path("variations/", include("pos.urls.variations")),
    # path("import/", include("pos.urls.product_import")),
    # path("price-groups/", include("pos.urls.price_groups")),
    # path("warranties/", include("pos.urls.warranties")),
]
