from django.urls import path

from .views import (
    ProductListAPIView,
    ProductDetailAPIView,
    CategoryListAPIView,
    TypeListAPIView,
    FeaturedProductAPIView,
    NewArrivalProductAPIView,
    BestSellerProductAPIView,
    RelatedProductAPIView,
    ColorListAPIView,
    SizeListAPIView,
    OnSaleProductAPIView,
    AdminColorListCreateAPIView,
    AdminColorRetrieveUpdateDestroyAPIView,
    AdminProductListCreateAPIView,
    AdminProductRetrieveUpdateDestroyAPIView,
    AdminSizeListCreateAPIView,
    AdminSizeRetrieveUpdateDestroyAPIView,
    # Admin Categories
    AdminCategoryListCreateAPIView,
    AdminCategoryRetrieveUpdateDestroyAPIView,
    AdminProductVariantListCreateAPIView,
    AdminProductVariantRetrieveUpdateDestroyAPIView,
    AdminProductImageListCreateAPIView,
    AdminProductImageRetrieveUpdateDestroyAPIView,
    AdminTypeListCreateAPIView,
    AdminTypeRetrieveUpdateDestroyAPIView,
)


urlpatterns = [

    # ========================================================
    # Public Product Endpoints
    # ========================================================

    path(
        "",
        ProductListAPIView.as_view(),
        name="product-list",
    ),

    path(
        "featured/",
        FeaturedProductAPIView.as_view(),
        name="featured-products",
    ),

    path(
        "new-arrivals/",
        NewArrivalProductAPIView.as_view(),
        name="new-arrivals",
    ),

    path(
        "best-sellers/",
        BestSellerProductAPIView.as_view(),
        name="best-sellers",
    ),

    path(
        "on-sale/",
        OnSaleProductAPIView.as_view(),
        name="on-sale-products",
    ),

    path(
        "categories/",
        CategoryListAPIView.as_view(),
        name="category-list",
    ),

    path(
        "types/",
        TypeListAPIView.as_view(),
        name="type-list",
    ),

    path(
        "colors/",
        ColorListAPIView.as_view(),
        name="color-list",
    ),

    path(
        "sizes/",
        SizeListAPIView.as_view(),
        name="size-list",
    ),


    # ========================================================
    # Admin Product Endpoints
    # Keep these above the dynamic slug route
    # ========================================================

    path(
        "admin/",
        AdminProductListCreateAPIView.as_view(),
        name="admin-product-list-create",
    ),

    path(
        "admin/<int:pk>/",
        AdminProductRetrieveUpdateDestroyAPIView.as_view(),
        name="admin-product-detail",
    ),


        # ========================================================
    # Admin Category Endpoints
    # ========================================================

    path(
        "categories/manage/",
        AdminCategoryListCreateAPIView.as_view(),
        name="admin-category-list-create",
    ),

    path(
        "categories/manage/<int:pk>/",
        AdminCategoryRetrieveUpdateDestroyAPIView.as_view(),
        name="admin-category-detail",
    ),


        # ========================================================
    # Admin Color Endpoints
    # ========================================================

    path(
        "colors/manage/",
        AdminColorListCreateAPIView.as_view(),
        name="admin-color-list-create",
    ),

    path(
        "colors/manage/<int:pk>/",
        AdminColorRetrieveUpdateDestroyAPIView.as_view(),
        name="admin-color-detail",
    ),

        # ========================================================
    # Admin Size Endpoints
    # ========================================================

    path(
        "sizes/manage/",
        AdminSizeListCreateAPIView.as_view(),
        name="admin-size-list-create",
    ),

    path(
        "sizes/manage/<int:pk>/",
        AdminSizeRetrieveUpdateDestroyAPIView.as_view(),
        name="admin-size-detail",
    ),

        # ========================================================
    # Admin Product Variant Endpoints
    # ========================================================

    path(
        "variants/admin/",
        AdminProductVariantListCreateAPIView.as_view(),
        name="admin-product-variant-list-create",
    ),

    path(
        "variants/admin/<int:pk>/",
        AdminProductVariantRetrieveUpdateDestroyAPIView.as_view(),
        name="admin-product-variant-detail",
    ),
    # ========================================================
    # Admin — Product Images
    # ========================================================

    path(
        "images/admin/",
        AdminProductImageListCreateAPIView.as_view(),
        name="admin-product-image-list-create",
    ),

    path(
        "images/admin/<int:pk>/",
        AdminProductImageRetrieveUpdateDestroyAPIView.as_view(),
        name="admin-product-image-detail",
    ),

    # ========================================================
    # Admin — Types
    # ========================================================

    path(
        "types/manage/",
        AdminTypeListCreateAPIView.as_view(),
        name="admin-type-list-create",
    ),

    path(
        "types/manage/<int:pk>/",
        AdminTypeRetrieveUpdateDestroyAPIView.as_view(),
        name="admin-type-detail",
    ),

    # ========================================================
    # Dynamic Product Slug Endpoints
    # Keep these last
    # ========================================================

    path(
        "<slug:slug>/related/",
        RelatedProductAPIView.as_view(),
        name="related-products",
    ),

    path(
        "<slug:slug>/",
        ProductDetailAPIView.as_view(),
        name="product-detail",
    ),

]