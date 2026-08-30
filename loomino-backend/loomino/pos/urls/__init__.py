from django.urls import path, include

from ..views.me import POSMeView

urlpatterns = [
    path("me/", POSMeView.as_view(), name="pos-me"),
    path("dashboard/", include("pos.urls.dashboard")),
    path("user-management/", include("pos.urls.user_management")),
    path("contacts/", include("pos.urls.contacts")),
    path("products/", include("pos.urls.products")),
    path("purchases/", include("pos.urls.purchases")),
    path("sales/", include("pos.urls.sales")),
    path("online/", include("pos.urls.online_reports")),
    path("stock-adjustments/", include("pos.urls.stock_adjustment")),
    path("expenses/", include("pos.urls.expenses")),
    path("reports/", include("pos.urls.reports")),
    path("settings/", include("pos.urls.settings")),
]
