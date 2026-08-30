from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Business


class POSMeView(APIView):
    """
    GET /api/pos/me/

    Tells the frontend whether the currently-authenticated user (same
    JWT as the e-commerce admin session) has POS access at all, and if
    so, their role and permitted locations. The POS route guard and
    role-based UI (e.g. hiding Settings/User Management from a
    Cashier) both read this.

    Deliberately does NOT require IsPOSStaff -- an authenticated user
    with no POS profile gets a clean 200 { has_pos_access: false }
    rather than a 403, so the frontend can redirect gracefully instead
    of treating it as an error.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, "pos_profile", None)

        if profile is None or not profile.is_active:
            return Response({"has_pos_access": False})

        business = Business.get_solo()

        return Response(
            {
                "has_pos_access": True,
                "role": profile.role,
                "role_display": profile.get_role_display(),
                "locations": list(profile.locations.values("id", "name")),
                "permissions": {
                    "can_manage_users": profile.can_manage_users,
                    "can_manage_settings": profile.can_manage_settings,
                    "can_manage_purchases": profile.can_manage_purchases,
                    "can_manage_stock_adjustments": profile.can_manage_stock_adjustments,
                    "can_manage_expenses": profile.can_manage_expenses,
                    "can_edit_products": profile.can_edit_products,
                    "can_sell": profile.can_sell,
                    "can_manage_contacts": profile.can_manage_contacts,
                    "can_view_reports": profile.can_view_reports,
                },
                "business": {
                    "name": business.name,
                    "currency_symbol": business.currency_symbol,
                },
            }
        )
