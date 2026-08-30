from django.urls import include, path

from .views import dashboard_summary

urlpatterns = [
    path("", dashboard_summary, name="dashboard-summary"),
    path("analytics/", include("analytics.urls")),
]