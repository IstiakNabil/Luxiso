from rest_framework.permissions import BasePermission

from .models import POSRole


class IsPOSStaff(BasePermission):
    """
    Base gate for every POS endpoint: the authenticated user must have
    an active POSStaffProfile. Having e-commerce is_staff=True on the
    same account does not grant POS access, and vice versa -- the two
    systems are deliberately not linked.
    """

    message = "You do not have POS access."

    def has_permission(self, request, view):
        profile = getattr(request.user, "pos_profile", None)
        return bool(
            request.user
            and request.user.is_authenticated
            and profile is not None
            and profile.is_active
        )


class IsPOSAdmin(IsPOSStaff):
    message = "This action requires the POS Admin role."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.pos_profile.role == POSRole.ADMIN


class IsPOSAdminOrManager(IsPOSStaff):
    message = "This action requires the POS Admin or Manager role."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.pos_profile.role in (POSRole.ADMIN, POSRole.MANAGER)


class CanEditProducts(IsPOSStaff):
    """
    Every role can view products/units (a Cashier needs to see them at
    the register), but only Admin/Manager can create, edit, or delete
    -- matches POSStaffProfile.can_edit_products.
    """

    message = "You don't have permission to edit products."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.pos_profile.can_edit_products


class CanSell(IsPOSStaff):
    """
    All three roles can sell (a Cashier's core job) -- matches
    POSStaffProfile.can_sell. Kept as its own class, not just
    IsPOSStaff directly, so the intent is explicit at each call site
    and easy to tighten later if that ever changes.
    """

    message = "You don't have permission to record sales."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.pos_profile.can_sell


class CanViewReports(IsPOSStaff):
    """
    Admin/Manager only -- matches POSStaffProfile.can_view_reports.
    Gates the Online reporting section (and the rest of Reports, once
    that's built) so a Cashier can operate the register without also
    seeing business-wide sales/payment figures.
    """

    message = "You don't have permission to view reports."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.pos_profile.can_view_reports


class CanManageStockAdjustments(IsPOSStaff):
    """Admin/Manager only -- matches POSStaffProfile.can_manage_stock_adjustments."""

    message = "You don't have permission to manage stock adjustments."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.pos_profile.can_manage_stock_adjustments


class CanManageExpenses(IsPOSStaff):
    """Admin/Manager only -- matches POSStaffProfile.can_manage_expenses."""

    message = "You don't have permission to manage expenses."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.pos_profile.can_manage_expenses


class CanManageSettings(IsPOSStaff):
    """Admin only in practice -- matches POSStaffProfile.can_manage_settings."""

    message = "You don't have permission to manage settings."

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        return request.user.pos_profile.can_manage_settings
