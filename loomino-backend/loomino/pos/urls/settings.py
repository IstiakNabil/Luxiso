from django.urls import path

from ..views.settings import (
    BusinessSettingsView,
    LocationListCreateView,
    LocationDetailView,
    DocumentPrefixListView,
)

urlpatterns = [
    path("business/", BusinessSettingsView.as_view(), name="pos-settings-business"),
    path("locations/", LocationListCreateView.as_view(), name="pos-settings-locations-list"),
    path("locations/<int:pk>/", LocationDetailView.as_view(), name="pos-settings-locations-detail"),
    path("prefixes/", DocumentPrefixListView.as_view(), name="pos-settings-prefixes"),
]
