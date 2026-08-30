from ..models import Category, Brand, TaxRate
from ..serializers.lookups import CategorySerializer, BrandSerializer, TaxRateSerializer
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
