from django.db.models import (
    Avg,
    Count,
    FloatField,
    Q,
    Sum,
)
from django.db.models.functions import Coalesce
from django.db.models.deletion import ProtectedError

from django_filters.rest_framework import DjangoFilterBackend

from rest_framework import (
    generics,
    status,
)

from rest_framework.response import Response
from rest_framework.filters import (
    OrderingFilter,
    SearchFilter,
)
from rest_framework.permissions import (
    AllowAny,
    IsAdminUser,
)
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
)

from drf_spectacular.utils import extend_schema

from products.models import (
    Product,
    ProductImage,
    ProductVariant,
    Category,
    ProductType,
    Color,
    Size,
)

from .filters import ProductFilter

from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    CategorySerializer,
    TypeSerializer,
    ColorSerializer,
    SizeSerializer,
    AdminProductListSerializer,
    AdminProductSerializer,
    AdminCategorySerializer,
    AdminColorSerializer,
    AdminSizeSerializer,
    AdminProductVariantSerializer,
    AdminProductImageSerializer,
    AdminTypeSerializer,
    AdminProductVariantWriteSerializer,
)


# ============================================================
# Public — Product List
# ============================================================

@extend_schema(
    tags=["Products"],
    summary="List Products",
    description=(
        "Returns all active products. "
        "Supports filtering, searching, ordering and pagination."
    ),
)
class ProductListAPIView(generics.ListAPIView):

    serializer_class = ProductListSerializer

    permission_classes = [AllowAny]

    queryset = (
        Product.objects.filter(
            is_active=True
        )
        .select_related(
            "category",
            "product_type",
        )
        .prefetch_related(
            "images",
            "variants",
        )
        .annotate(
            average_rating=Coalesce(
                Avg(
                    "reviews__rating",
                    filter=Q(
                        reviews__is_approved=True
                    ),
                ),
                0.0,
                output_field=FloatField(),
            ),
            review_count=Count(
                "reviews",
                filter=Q(
                    reviews__is_approved=True
                ),
            ),
        )
    )

    filter_backends = (
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    )

    filterset_class = ProductFilter

    search_fields = (
        "name",
        "description",
        "short_description",
    )

    ordering_fields = (
        "regular_price",
        "created_at",
        "name",
    )

    ordering = (
        "-created_at",
    )


# ============================================================
# Public — Product Detail
# ============================================================

@extend_schema(
    tags=["Products"],
    summary="Product Details",
    description=(
        "Retrieve complete information about "
        "a single product by its slug."
    ),
)
class ProductDetailAPIView(generics.RetrieveAPIView):

    serializer_class = ProductDetailSerializer

    permission_classes = [AllowAny]

    queryset = (
        Product.objects.filter(
            is_active=True
        )
        .select_related(
            "category",
            "product_type",
        )
        .prefetch_related(
            "images",
            "variants__color",
            "variants__size",
        )
        .annotate(
            average_rating=Coalesce(
                Avg(
                    "reviews__rating",
                    filter=Q(
                        reviews__is_approved=True
                    ),
                ),
                0.0,
                output_field=FloatField(),
            ),
            review_count=Count(
                "reviews",
                filter=Q(
                    reviews__is_approved=True
                ),
            ),
        )
    )

    lookup_field = "slug"


# ============================================================
# Public — Categories
# ============================================================

@extend_schema(
    tags=["Products"],
    summary="List Categories",
    description="Returns all active product categories.",
)
class CategoryListAPIView(generics.ListAPIView):

    serializer_class = CategorySerializer

    permission_classes = [AllowAny]

    queryset = (
        Category.objects.filter(
            is_active=True
        )
        .annotate(
            product_count=Count(
                "products"
            )
        )
    )


# ============================================================
# Public — Types
# ============================================================

@extend_schema(
    tags=["Products"],
    summary="List Types",
    description=(
        "Returns all active product types. Pass "
        "?category=<slug> to only return types linked to "
        "that category; with no category, all types are "
        "returned."
    ),
)
class TypeListAPIView(generics.ListAPIView):

    serializer_class = TypeSerializer

    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = ProductType.objects.filter(
            is_active=True
        ).annotate(
            product_count=Count(
                "products"
            )
        )

        category_slug = self.request.query_params.get(
            "category"
        )
        if category_slug:
            queryset = queryset.filter(
                categories__slug=category_slug
            )

        return queryset.distinct()


# ============================================================
# Public — Colors
# ============================================================

@extend_schema(
    tags=["Products"],
    summary="List Colors",
    description="Returns all active product colors.",
)
class ColorListAPIView(generics.ListAPIView):

    serializer_class = ColorSerializer

    permission_classes = [AllowAny]

    queryset = (
        Color.objects.filter(
            is_active=True
        )
        .order_by(
            "name"
        )
    )


# ============================================================
# Public — Sizes
# ============================================================

@extend_schema(
    tags=["Products"],
    summary="List Sizes",
    description="Returns all active product sizes.",
)
class SizeListAPIView(generics.ListAPIView):

    serializer_class = SizeSerializer

    permission_classes = [AllowAny]

    queryset = (
        Size.objects.filter(
            is_active=True
        )
        .order_by(
            "display_order"
        )
    )


# ============================================================
# Public — Featured Products
# ============================================================

class FeaturedProductAPIView(generics.ListAPIView):

    serializer_class = ProductListSerializer

    permission_classes = [AllowAny]

    queryset = (
        Product.objects.filter(
            is_active=True,
            is_featured=True,
        )
        .select_related(
            "category",
            "product_type",
        )
        .prefetch_related(
            "images",
            "variants",
        )[:8]
    )


# ============================================================
# Public — New Arrivals
# ============================================================

class NewArrivalProductAPIView(generics.ListAPIView):

    serializer_class = ProductListSerializer

    permission_classes = [AllowAny]

    queryset = (
        Product.objects.filter(
            is_active=True,
            is_new_arrival=True,
        )
        .select_related(
            "category",
            "product_type",
        )
        .prefetch_related(
            "images",
            "variants",
        )[:8]
    )


# ============================================================
# Public — Best Sellers
# ============================================================

class BestSellerProductAPIView(generics.ListAPIView):

    serializer_class = ProductListSerializer

    permission_classes = [AllowAny]

    queryset = (
        Product.objects.filter(
            is_active=True
        )
        .annotate(
            total_sold=Sum(
                "variants__order_items__quantity"
            )
        )
        .select_related(
            "category",
            "product_type",
        )
        .prefetch_related(
            "images",
            "variants",
        )
        .order_by(
            "-total_sold"
        )[:8]
    )


# ============================================================
# Public — Related Products
# ============================================================

class RelatedProductAPIView(generics.ListAPIView):

    serializer_class = ProductListSerializer

    permission_classes = [AllowAny]

    def get_queryset(self):

        slug = self.kwargs["slug"]

        try:
            product = Product.objects.get(
                slug=slug,
                is_active=True,
            )

        except Product.DoesNotExist:
            return Product.objects.none()

        return (
            Product.objects.filter(
                category=product.category,
                is_active=True,
            )
            .exclude(
                id=product.id
            )
            .select_related(
                "category",
                "product_type",
            )
            .prefetch_related(
                "images",
                "variants",
            )[:8]
        )


# ============================================================
# Public — On Sale
# ============================================================

@extend_schema(
    tags=["Products"],
    summary="List On Sale Products",
    description=(
        "Returns active products selected "
        "for the On Sale collection."
    ),
)
class OnSaleProductAPIView(generics.ListAPIView):

    serializer_class = ProductListSerializer

    permission_classes = [AllowAny]

    queryset = (
        Product.objects.filter(
            is_active=True,
            is_on_sale=True,
        )
        .select_related(
            "category",
            "product_type",
        )
        .prefetch_related(
            "images",
            "variants",
        )
        .annotate(
            average_rating=Coalesce(
                Avg(
                    "reviews__rating",
                    filter=Q(
                        reviews__is_approved=True
                    ),
                ),
                0.0,
                output_field=FloatField(),
            ),
            review_count=Count(
                "reviews",
                filter=Q(
                    reviews__is_approved=True
                ),
            ),
        )
        .order_by(
            "-created_at"
        )
    )


# ============================================================
# ADMIN — Product List / Create
# ============================================================

@extend_schema(
    tags=["Admin - Products"],
    summary="Admin Product List and Create",
    description=(
        "Admin-only endpoint for listing all products "
        "and creating new products."
    ),
)
class AdminProductListCreateAPIView(
    generics.ListCreateAPIView
):

    permission_classes = [IsAdminUser]

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (
        "name",
    )

    ordering_fields = (
        "name",
        "regular_price",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )

    def get_queryset(self):

        return (
            Product.objects.all()
            .select_related(
                "category",
                "product_type",
            )
            .prefetch_related(
                "images",
                "variants",
            )
            .annotate(
                total_stock=Coalesce(
                    Sum(
                        "variants__stock"
                    ),
                    0,
                )
            )
        )

    def get_serializer_class(self):

        if self.request.method == "GET":
            return AdminProductListSerializer

        return AdminProductSerializer


# ============================================================
# ADMIN — Product Retrieve / Update / Delete
# ============================================================

@extend_schema(
    tags=["Admin - Products"],
    summary="Admin Product Detail",
    description=(
        "Admin-only endpoint for retrieving, "
        "updating or deleting a product."
    ),
)
class AdminProductRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AdminProductSerializer

    permission_classes = [IsAdminUser]

    lookup_field = "pk"

    def get_queryset(self):

        return (
            Product.objects.all()
            .select_related(
                "category",
                "product_type",
            )
            .prefetch_related(
                "images",
                "variants",
            )
            .annotate(
                total_stock=Coalesce(
                    Sum(
                        "variants__stock"
                    ),
                    0,
                )
            )
        )

    def destroy(self, request, *args, **kwargs):

        try:
            return super().destroy(
                request, *args, **kwargs
            )
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "This product can't be deleted "
                        "because it has order history "
                        "(one or more of its variants "
                        "appear on a past order). "
                        "Deactivate it instead so past "
                        "orders keep showing correct "
                        "product details."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )
# ============================================================
# ADMIN — Category List / Create
# ============================================================

@extend_schema(
    tags=["Admin - Categories"],
    summary="Admin Category List and Create",
    description=(
        "Admin-only endpoint for listing all categories "
        "and creating new categories."
    ),
)
class AdminCategoryListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = AdminCategorySerializer

    permission_classes = [IsAdminUser]

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (
        "name",
    )

    ordering_fields = (
        "name",
        "display_order",
        "created_at",
        "updated_at",
    )

    ordering = (
        "display_order",
        "name",
    )

    def get_queryset(self):

        return (
            Category.objects.all()
            .annotate(
                product_count=Count(
                    "products",
                    distinct=True,
                )
            )
        )


# ============================================================
# ADMIN — Category Retrieve / Update / Delete
# ============================================================

@extend_schema(
    tags=["Admin - Categories"],
    summary="Admin Category Detail",
    description=(
        "Admin-only endpoint for retrieving, "
        "updating or deleting a category."
    ),
)
class AdminCategoryRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AdminCategorySerializer

    permission_classes = [IsAdminUser]

    lookup_field = "pk"

    def get_queryset(self):

        return (
            Category.objects.all()
            .annotate(
                product_count=Count(
                    "products",
                    distinct=True,
                )
            )
        )
    
# ============================================================
# ADMIN — Color List / Create
# ============================================================

@extend_schema(
    tags=["Admin - Colors"],
    summary="Admin Color List and Create",
    description=(
        "Admin-only endpoint for listing all colors "
        "and creating new colors."
    ),
)
class AdminColorListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = AdminColorSerializer

    permission_classes = [IsAdminUser]

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (
        "name",
        "hex_code",
    )

    ordering_fields = (
        "name",
        "created_at",
    )

    ordering = (
        "name",
    )

    queryset = Color.objects.all()


# ============================================================
# ADMIN — Color Retrieve / Update / Delete
# ============================================================

@extend_schema(
    tags=["Admin - Colors"],
    summary="Admin Color Detail",
    description=(
        "Admin-only endpoint for retrieving, "
        "updating or deleting a color."
    ),
)
class AdminColorRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AdminColorSerializer

    permission_classes = [IsAdminUser]

    queryset = Color.objects.all()

    lookup_field = "pk"

# ============================================================
# ADMIN — Size List / Create
# ============================================================

@extend_schema(
    tags=["Admin - Sizes"],
    summary="Admin Size List and Create",
    description=(
        "Admin-only endpoint for listing all sizes "
        "and creating new sizes."
    ),
)
class AdminSizeListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = AdminSizeSerializer

    permission_classes = [IsAdminUser]

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (
        "name",
    )

    ordering_fields = (
        "name",
        "display_order",
    )

    ordering = (
        "display_order",
        "name",
    )

    queryset = Size.objects.all()


# ============================================================
# ADMIN — Size Retrieve / Update / Delete
# ============================================================

@extend_schema(
    tags=["Admin - Sizes"],
    summary="Admin Size Detail",
    description=(
        "Admin-only endpoint for retrieving, "
        "updating or deleting a size."
    ),
)
class AdminSizeRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AdminSizeSerializer

    permission_classes = [IsAdminUser]

    queryset = Size.objects.all()

    lookup_field = "pk"

# ============================================================
# ADMIN — Variant List / Create
# ============================================================

@extend_schema(
    tags=["Admin - Product Variants"],
    summary="Admin Variant List and Create",
    description=(
        "Admin-only endpoint for listing all product "
        "variants and creating new variants."
    ),
)
class AdminProductVariantListCreateAPIView(
    generics.ListCreateAPIView
):

    permission_classes = [IsAdminUser]

    filter_backends = (
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    )

    # Lets the admin panel load the variants belonging to a
    # single product, e.g. ?product=12
    filterset_fields = (
        "product",
        "color",
        "size",
        "is_active",
    )

    search_fields = (
        "sku",
        "product__name",
        "color__name",
        "size__name",
    )

    ordering_fields = (
        "sku",
        "stock",
        "created_at",
        "updated_at",
    )

    ordering = (
        "product__name",
        "color__name",
        "size__display_order",
    )

    def get_queryset(self):

        return (
            ProductVariant.objects.all()
            .select_related(
                "product",
                "color",
                "size",
            )
            .prefetch_related(
                "product__images",
            )
        )

    def get_serializer_class(self):

        if self.request.method == "POST":
            return AdminProductVariantWriteSerializer

        return AdminProductVariantSerializer

    def create(self, request, *args, **kwargs):

        write_serializer = (
            AdminProductVariantWriteSerializer(
                data=request.data,
                context=self.get_serializer_context(),
            )
        )

        write_serializer.is_valid(
            raise_exception=True
        )

        variant = write_serializer.save()

        read_serializer = (
            AdminProductVariantSerializer(
                variant,
                context=self.get_serializer_context(),
            )
        )

        return Response(
            read_serializer.data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# ADMIN — Variant Retrieve / Update / Delete
# ============================================================

@extend_schema(
    tags=["Admin - Product Variants"],
    summary="Admin Variant Detail",
    description=(
        "Admin-only endpoint for retrieving, "
        "updating or deleting a product variant."
    ),
)
class AdminProductVariantRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    permission_classes = [IsAdminUser]

    lookup_field = "pk"

    def get_queryset(self):

        return (
            ProductVariant.objects.all()
            .select_related(
                "product",
                "color",
                "size",
            )
            .prefetch_related(
                "product__images",
            )
        )

    def get_serializer_class(self):

        if self.request.method in (
            "PUT",
            "PATCH",
        ):
            return AdminProductVariantWriteSerializer

        return AdminProductVariantSerializer

    def destroy(self, request, *args, **kwargs):

        try:
            return super().destroy(
                request, *args, **kwargs
            )
        except ProtectedError:
            return Response(
                {
                    "detail": (
                        "This variant can't be deleted "
                        "because it appears on a past "
                        "order. Set its stock to 0 or "
                        "deactivate it instead so past "
                        "orders keep showing correct "
                        "details."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

    def update(self, request, *args, **kwargs):

        partial = kwargs.pop(
            "partial",
            False,
        )

        instance = self.get_object()

        write_serializer = (
            AdminProductVariantWriteSerializer(
                instance,
                data=request.data,
                partial=partial,
                context=self.get_serializer_context(),
            )
        )

        write_serializer.is_valid(
            raise_exception=True
        )

        variant = write_serializer.save()

        read_serializer = (
            AdminProductVariantSerializer(
                variant,
                context=self.get_serializer_context(),
            )
        )

        return Response(
            read_serializer.data,
            status=status.HTTP_200_OK,
        )

# ============================================================
# Admin — Product Images
# ============================================================

@extend_schema(
    tags=["Admin - Products"],
    summary="List / upload product images",
    description=(
        "List product images (filter with ?product=<id>) "
        "or upload a new image using multipart/form-data."
    ),
)
class AdminProductImageListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = AdminProductImageSerializer

    permission_classes = [IsAdminUser]

    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    # Images are always shown as a full set per product,
    # so pagination would only get in the way.
    pagination_class = None

    filter_backends = (
        DjangoFilterBackend,
        OrderingFilter,
    )

    filterset_fields = (
        "product",
        "image_type",
    )

    ordering_fields = (
        "display_order",
        "created_at",
    )

    ordering = ("display_order",)

    queryset = (
        ProductImage.objects
        .select_related("product")
        .all()
    )


@extend_schema(
    tags=["Admin - Products"],
    summary="Retrieve / update / delete a product image",
)
class AdminProductImageRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AdminProductImageSerializer

    permission_classes = [IsAdminUser]

    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    queryset = (
        ProductImage.objects
        .select_related("product")
        .all()
    )


# ============================================================
# Admin — Types
# ============================================================

@extend_schema(
    tags=["Admin - Products"],
    summary="List / create types",
)
class AdminTypeListCreateAPIView(
    generics.ListCreateAPIView
):

    serializer_class = AdminTypeSerializer

    permission_classes = [IsAdminUser]

    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    filter_backends = (
        SearchFilter,
        OrderingFilter,
    )

    search_fields = (
        "name",
        "slug",
    )

    ordering_fields = (
        "name",
        "created_at",
    )

    ordering = ("name",)

    queryset = (
        ProductType.objects
        .annotate(
            product_count=Count("products")
        )
    )


@extend_schema(
    tags=["Admin - Products"],
    summary="Retrieve / update / delete a type",
)
class AdminTypeRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AdminTypeSerializer

    permission_classes = [IsAdminUser]

    parser_classes = (
        MultiPartParser,
        FormParser,
    )

    queryset = (
        ProductType.objects
        .annotate(
            product_count=Count("products")
        )
    )
