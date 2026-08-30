from django.urls import path

from ..views.contacts import (
    ContactListCreateView,
    ContactDetailView,
    CustomerGroupListCreateView,
    CustomerGroupDetailView,
    ContactImportView,
    ContactImportTemplateView,
)

urlpatterns = [
    path("", ContactListCreateView.as_view(), name="pos-contacts-list"),
    path("<int:pk>/", ContactDetailView.as_view(), name="pos-contacts-detail"),
    path(
        "customer-groups/",
        CustomerGroupListCreateView.as_view(),
        name="pos-customer-groups-list",
    ),
    path(
        "customer-groups/<int:pk>/",
        CustomerGroupDetailView.as_view(),
        name="pos-customer-groups-detail",
    ),
    path("import/", ContactImportView.as_view(), name="pos-contacts-import"),
    path(
        "import/template/",
        ContactImportTemplateView.as_view(),
        name="pos-contacts-import-template",
    ),
]
