from django.urls import path

from ..views.user_management import (
    AccountSearchListView,
    POSStaffProfileListCreateView,
    POSStaffProfileDetailView,
    RolesReferenceView,
)

urlpatterns = [
    path("users/", POSStaffProfileListCreateView.as_view(), name="pos-users-list"),
    path("users/<int:pk>/", POSStaffProfileDetailView.as_view(), name="pos-users-detail"),
    path("accounts/", AccountSearchListView.as_view(), name="pos-accounts-search"),
    path("roles/", RolesReferenceView.as_view(), name="pos-roles-reference"),
]
