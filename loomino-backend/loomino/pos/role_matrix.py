from .roles import POSRole

PERMISSION_LABELS = {
    "can_manage_users": "Manage Users",
    "can_manage_settings": "Manage Settings",
    "can_manage_purchases": "Manage Purchases",
    "can_manage_stock_adjustments": "Stock Adjustments",
    "can_manage_expenses": "Manage Expenses",
    "can_edit_products": "Add / Edit Products",
    "can_sell": "Sell (POS Terminal)",
    "can_manage_contacts": "Manage Contacts",
    "can_view_reports": "View Reports",
}

_ALL_PERMISSIONS = set(PERMISSION_LABELS)

# Fixed matrix -- there is no UI to create custom roles. Changing what
# a role can do is a one-line edit here, not a migration.
ROLE_PERMISSIONS = {
    POSRole.ADMIN: _ALL_PERMISSIONS,
    POSRole.MANAGER: _ALL_PERMISSIONS - {"can_manage_users", "can_manage_settings"},
    POSRole.CASHIER: {"can_sell", "can_manage_contacts"},
}


def role_permissions(role: str) -> dict:
    """{permission_key: bool} for the given role, in PERMISSION_LABELS order."""
    granted = ROLE_PERMISSIONS.get(role, set())
    return {key: key in granted for key in PERMISSION_LABELS}
