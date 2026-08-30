export interface POSNavChild {
  label: string;
  to: string;
}

export interface POSNavItem {
  label: string;
  to: string;
  icon: string;
  /** Permission key gating this item; omit if every role can see it. */
  permission?:
    | "can_manage_users"
    | "can_manage_settings"
    | "can_manage_purchases"
    | "can_manage_stock_adjustments"
    | "can_manage_expenses"
    | "can_edit_products"
    | "can_sell"
    | "can_manage_contacts"
    | "can_view_reports";
  children?: POSNavChild[];
}

export const POS_NAV: POSNavItem[] = [
  { label: "Home", to: "/admin/pos", icon: "home" },
  {
    label: "Online",
    to: "/admin/pos/online/summary",
    icon: "chart",
    permission: "can_view_reports",
    children: [
      { label: "Overview", to: "/admin/pos/online/summary" },
      { label: "Products & Stock", to: "/admin/pos/online/products" },
      { label: "Sales", to: "/admin/pos/online/sales" },
    ],
  },
  {
    label: "User Management",
    to: "/admin/pos/users",
    icon: "users",
    permission: "can_manage_users",
    children: [
      { label: "Users", to: "/admin/pos/users" },
      { label: "Roles", to: "/admin/pos/roles" },
    ],
  },
  {
    label: "Contacts",
    to: "/admin/pos/contacts/customers",
    icon: "contact",
    permission: "can_manage_contacts",
    children: [
      { label: "Suppliers", to: "/admin/pos/contacts/suppliers" },
      { label: "Customers", to: "/admin/pos/contacts/customers" },
      { label: "Customer Groups", to: "/admin/pos/contacts/customer-groups" },
      { label: "Import Contacts", to: "/admin/pos/contacts/import" },
    ],
  },
  {
    label: "Products",
    to: "/admin/pos/products/list",
    icon: "package",
    // No permission gate here -- Cashiers can view Products (read-only,
    // per POSStaffProfile.can_edit_products), just not add/edit/delete.
    // Each page hides its own write controls; see POSUnitsPage.
    children: [
      { label: "List Products", to: "/admin/pos/products/list" },
      { label: "Add Product", to: "/admin/pos/products/add" },
      { label: "Units", to: "/admin/pos/products/units" },
      { label: "Categories", to: "/admin/pos/products/categories" },
      { label: "Brands", to: "/admin/pos/products/brands" },
      { label: "Print Labels", to: "/admin/pos/products/print-labels" },
      // Rest of this group is added as we build each sub-page:
      // { label: "Variations", to: "/admin/pos/products/variations" },
      // { label: "Import Products", to: "/admin/pos/products/import" },
      // { label: "Import Opening Stock", to: "/admin/pos/products/import-stock" },
      // { label: "Selling Price Group", to: "/admin/pos/products/price-groups" },
      // { label: "Warranties", to: "/admin/pos/products/warranties" },
    ],
  },
  {
    label: "Purchases",
    to: "/admin/pos/purchases/list",
    icon: "truck",
    permission: "can_manage_purchases",
    children: [
      { label: "List Purchases", to: "/admin/pos/purchases/list" },
      { label: "Add Purchase", to: "/admin/pos/purchases/add" },
      { label: "List Purchase Return", to: "/admin/pos/purchases/returns" },
    ],
  },
  {
    label: "Sell",
    to: "/admin/pos/sell/list",
    icon: "cart",
    permission: "can_sell",
    children: [
      { label: "All sales", to: "/admin/pos/sell/list" },
      { label: "Add Sale", to: "/admin/pos/sell/add" },
      { label: "List Drafts", to: "/admin/pos/sell/drafts" },
      { label: "List quotations", to: "/admin/pos/sell/quotations" },
      { label: "List Sell Return", to: "/admin/pos/sell/returns" },
      { label: "POS Register", to: "/admin/pos/sell/register" },
      // Rest of this group is added as we build each sub-page:
      // { label: "List POS", to: "/admin/pos/sell/pos-list" },
      // { label: "Shipments", to: "/admin/pos/sell/shipments" },
      // { label: "Discounts", to: "/admin/pos/sell/discounts" },
      // { label: "Import Sales", to: "/admin/pos/sell/import" },
    ],
  },
  {
    label: "Stock Adjustment",
    to: "/admin/pos/stock-adjustments/list",
    icon: "layers",
    permission: "can_manage_stock_adjustments",
    children: [
      { label: "List Stock Adjustments", to: "/admin/pos/stock-adjustments/list" },
      { label: "Add Stock Adjustment", to: "/admin/pos/stock-adjustments/add" },
    ],
  },
  {
    label: "Expenses",
    to: "/admin/pos/expenses/list",
    icon: "receipt",
    permission: "can_manage_expenses",
    children: [
      { label: "List Expenses", to: "/admin/pos/expenses/list" },
      { label: "Add Expense", to: "/admin/pos/expenses/add" },
      { label: "Expense Categories", to: "/admin/pos/expenses/categories" },
    ],
  },
  {
    label: "Reports",
    to: "/admin/pos/reports/purchase-payments",
    icon: "chart",
    permission: "can_view_reports",
    children: [
      { label: "Purchase Payment Report", to: "/admin/pos/reports/purchase-payments" },
      { label: "Sell Payment Report", to: "/admin/pos/reports/sale-payments" },
      { label: "Product Purchase Report", to: "/admin/pos/reports/product-purchases" },
      { label: "Expense Report", to: "/admin/pos/reports/expenses" },
      { label: "Product Sell Report", to: "/admin/pos/reports/product-sales" },
      { label: "Trending Products", to: "/admin/pos/reports/trending-products" },
      { label: "Stock Adjustment Report", to: "/admin/pos/reports/stock-adjustments" },
      { label: "Stock Report", to: "/admin/pos/reports/stock" },
      // Rest of this group is added as we build each remaining report:
      // { label: "Profit / Loss Report", to: "/admin/pos/reports/profit-loss" },
      // { label: "Sales Representative Report", to: "/admin/pos/reports/sales-rep" },
      // { label: "Register Report", to: "/admin/pos/reports/register" },
      // { label: "Items Report", to: "/admin/pos/reports/items" },  -- deferred (see courier/website API note)
      // { label: "Purchase & Sale", to: "/admin/pos/reports/purchase-sale" },
      // { label: "Stock Expiry Report", to: "/admin/pos/reports/stock-expiry" },
      // { label: "Customer Groups Report", to: "/admin/pos/reports/customer-groups" },
      // { label: "Supplier & Customer Report", to: "/admin/pos/reports/supplier-customer" },
      // { label: "Tax Report", to: "/admin/pos/reports/tax" },
      // { label: "Activity Log", to: "/admin/pos/reports/activity-log" },
    ],
  },
  {
    label: "Settings",
    to: "/admin/pos/settings/business",
    icon: "settings",
    permission: "can_manage_settings",
    children: [
      { label: "Business Settings", to: "/admin/pos/settings/business" },
      { label: "Business Locations", to: "/admin/pos/settings/locations" },
      { label: "Prefixes", to: "/admin/pos/settings/prefixes" },
      // Rest of this group is added as we build each remaining piece:
      // { label: "Invoice Settings", to: "/admin/pos/settings/invoices" },
      // { label: "Barcode Settings", to: "/admin/pos/settings/barcodes" },
      // { label: "Tax Rates", to: "/admin/pos/settings/tax-rates" },
      // { label: "Modifiers", to: "/admin/pos/settings/modifiers" },
    ],
  },
];
