from ..models import Category, Brand, TaxRate
from ..serializers.lookups import (
    CategorySerializer,
    BrandSerializer,
    TaxRateSerializer,
    POSColorSerializer,
    POSSizeSerializer,
    POSStorefrontCategorySerializer,
    POSStorefrontTypeSerializer,
)
from products.models import (
    Color as StorefrontColor,
    Size as StorefrontSize,
    Category as StorefrontCategory,
    ProductType as StorefrontProductType,
)
from .lookup_base import LookupListCreateView, LookupDetailView


class CategoryListCreateView(LookupListCreateView):
    queryset = Category.objects
    serializer_class = CategorySerializer


class CategoryDetailView(LookupDetailView):
    queryset = Category.objects
    serializer_class = CategorySerializer


class BrandListCreateView(LookupListCreateView):
    queryset = Brand.objects
    serializer_class = BrandSerializer


class BrandDetailView(LookupDetailView):
    queryset = Brand.objects
    serializer_class = BrandSerializer


class TaxRateListCreateView(LookupListCreateView):
    queryset = TaxRate.objects
    serializer_class = TaxRateSerializer


class TaxRateDetailView(LookupDetailView):
    queryset = TaxRate.objects
    serializer_class = TaxRateSerializer


class POSColorListCreateView(LookupListCreateView):
    """Reads/writes products.Color -- shared with the storefront."""

    queryset = StorefrontColor.objects
    serializer_class = POSColorSerializer


class POSColorDetailView(LookupDetailView):
    queryset = StorefrontColor.objects
    serializer_class = POSColorSerializer


class POSSizeListCreateView(LookupListCreateView):
    """Reads/writes products.Size -- shared with the storefront."""

    queryset = StorefrontSize.objects
    serializer_class = POSSizeSerializer


class POSSizeDetailView(LookupDetailView):
    queryset = StorefrontSize.objects
    serializer_class = POSSizeSerializer


class POSStorefrontCategoryListCreateView(LookupListCreateView):
    """Reads/writes products.Category -- the storefront's own browsing taxonomy."""

    queryset = StorefrontCategory.objects
    serializer_class = POSStorefrontCategorySerializer


class POSStorefrontCategoryDetailView(LookupDetailView):
    queryset = StorefrontCategory.objects
    serializer_class = POSStorefrontCategorySerializer


class POSStorefrontTypeListCreateView(LookupListCreateView):
    """
    Reads/writes products.ProductType. Adds ?category=<id> on top of
    the base class's ?search=, so the Add/Edit Product form's Type
    dropdown can filter to the currently chosen Category, same as the
    public storefront endpoint does by slug.
    """

    queryset = StorefrontProductType.objects
    serializer_class = POSStorefrontTypeSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category_id = self.request.query_params.get("category")
        if category_id:
            qs = qs.filter(categories__id=category_id)
        return qs.distinct()


class POSStorefrontTypeDetailView(LookupDetailView):
    queryset = StorefrontProductType.objects
    serializer_class = POSStorefrontTypeSerializer
