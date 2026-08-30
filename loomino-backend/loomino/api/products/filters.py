import django_filters

from django.db.models import Q

from products.models import (
    Product,
    Category,
    ProductType,
)


class ProductFilter(django_filters.FilterSet):

    category = django_filters.ModelChoiceFilter(
        queryset=Category.objects.filter(
            is_active=True,
        ),
        field_name="category",
        to_field_name="slug",
    )

    product_type = django_filters.ModelChoiceFilter(
        queryset=ProductType.objects.filter(
            is_active=True,
        ),
        field_name="product_type",
        to_field_name="slug",
    )

    min_price = django_filters.NumberFilter(
        method="filter_min_price"
    )

    max_price = django_filters.NumberFilter(
        method="filter_max_price"
    )

    color = django_filters.CharFilter(
        field_name="variants__color__name",
        lookup_expr="iexact",
    )

    size = django_filters.CharFilter(
        method="filter_sizes"
    )

    class Meta:
        model = Product

        fields = (
            "category",
            "product_type",
            "is_featured",
            "is_new_arrival",
            "is_on_sale",
        )

    def filter_sizes(self, queryset, name, value):

        sizes = [
            size.strip()
            for size in value.split(",")
            if size.strip()
        ]

        if not sizes:
            return queryset

        return queryset.filter(
            variants__size__name__in=sizes,
            variants__is_active=True,
        ).distinct()

    def filter_min_price(self, queryset, name, value):

        return queryset.filter(
            Q(discount_price__gte=value)
            |
            Q(
                discount_price__isnull=True,
                regular_price__gte=value,
            )
        ).distinct()

    def filter_max_price(self, queryset, name, value):

        return queryset.filter(
            Q(discount_price__lte=value)
            |
            Q(
                discount_price__isnull=True,
                regular_price__lte=value,
            )
        ).distinct()