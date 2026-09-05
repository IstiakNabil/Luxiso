from django.urls import path

from ..views.variations import VariationListCreateView, VariationDetailView

urlpatterns = [
    path("", VariationListCreateView.as_view(), name="pos-variations-list-create"),
    path("<int:pk>/", VariationDetailView.as_view(), name="pos-variations-detail"),
]
