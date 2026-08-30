from django.urls import path, include

urlpatterns = [
    path(
        "auth/",
        include("api.accounts.urls"),
    ),

    path(
        "products/",
        include("api.products.urls"),
    ),

path(
    "",
    include("api.orders.urls"),
),

path(
    "wishlist/",
    include("wishlist.urls"),
),

path(
    "reviews/",
    include("reviews.urls"),
),

path(
    "coupons/",
    include("coupons.urls"),
),

path(
    "dashboard/",
    include("dashboard.urls"),
),

path(
    "contact/",
    include("contact.urls"),
),

path(
    "newsletter/",
    include("newsletter.urls"),
),

path(
    "cms/",
    include("cms.urls"),
),

path(
    "",
    include("sitesettings.urls"),
),

]