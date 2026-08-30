from django.urls import path

from ..views.units import UnitListCreateView, UnitDetailView

urlpatterns = [
    path("", UnitListCreateView.as_view(), name="pos-units-list"),
    path("<int:pk>/", UnitDetailView.as_view(), name="pos-units-detail"),
]
