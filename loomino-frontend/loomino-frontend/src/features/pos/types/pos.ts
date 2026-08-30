export type POSRole = "admin" | "manager" | "cashier";

export interface POSPermissions {
  can_manage_users: boolean;
  can_manage_settings: boolean;
  can_manage_purchases: boolean;
  can_manage_stock_adjustments: boolean;
  can_manage_expenses: boolean;
  can_edit_products: boolean;
  can_sell: boolean;
  can_manage_contacts: boolean;
  can_view_reports: boolean;
}

export interface POSLocation {
  id: number;
  name: string;
}

/** GET /pos/me/ — either the no-access shape or the full profile shape. */
export type POSMeResponse =
  | { has_pos_access: false }
  | {
      has_pos_access: true;
      role: POSRole;
      role_display: string;
      locations: POSLocation[];
      permissions: POSPermissions;
      business: {
        name: string;
        currency_symbol: string;
      };
    };

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DailySalesPoint {
  date: string;
  total: number;
}

export interface MonthlySalesPoint {
  month: string;
  total: number;
}

export interface DashboardSummary {
  currency_symbol: string;
  total_purchase: number;
  total_sales: number;
  purchase_due: number;
  invoice_due: number;
  total_purchase_return: number;
  total_sell_return: number;
  expense: number;
  sales_last_30_days: DailySalesPoint[];
  sales_current_financial_year: MonthlySalesPoint[];
}

export interface SalesPaymentDueRow {
  id: number;
  customer: string;
  invoice_no: string;
  due_amount: string;
}

export interface PurchasePaymentDueRow {
  id: number;
  supplier: string;
  reference_no: string;
  due_amount: string;
}

export interface ProductStockAlertRow {
  id: number;
  product: string;
  location: string;
  current_stock: string;
  unit: string;
}

export interface StockExpiryAlertRow {
  id: number;
  product: string;
  location: string;
  stock_left: string;
  expiry_date: string;
  expires_in_days: number | null;
}

export interface SalesOrderRow {
  id: number;
  sale_date: string;
  order_no: string;
  customer_name: string;
  contact_number: string;
  location: string;
  status: string;
  shipping_status: string;
  quantity_remaining: number;
  added_by: string;
}

/** Shared ?location=&date_from=&date_to= filters accepted by dashboard endpoints. */
export interface DashboardFilters {
  location?: number | string;
  date_from?: string;
  date_to?: string;
}

// --- User Management -----------------------------------------------

export interface AccountSearchResult {
  id: number;
  email: string;
  name: string;
  phone_number: string;
  has_pos_profile: boolean;
}

export interface POSStaffRow {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: POSRole;
  role_display: string;
  locations: POSLocation[];
  is_active: boolean;
}

export interface POSStaffDetail extends POSStaffRow {
  user_id: number;
  location_ids: number[];
  permissions: POSPermissions;
}

export interface CreateStaffPayload {
  user: number;
  role: POSRole;
  locations?: number[];
  phone?: string;
  is_active?: boolean;
}

export interface UpdateStaffPayload {
  role?: POSRole;
  locations?: number[];
  phone?: string;
  is_active?: boolean;
}

export interface RolePermissionRow {
  key: string;
  label: string;
  granted: boolean;
}

export interface RoleReference {
  role: POSRole;
  role_display: string;
  permissions: RolePermissionRow[];
}


// --- Contacts ---------------------------------------------------------

export type ContactType = "customer" | "supplier" | "both";

export interface CustomerGroup {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface ContactRow {
  id: number;
  contact_code: string;
  contact_type: ContactType;
  name: string;
  business_name: string;
  email: string;
  tax_number: string;
  credit_limit: string;
  pay_term: string;
  opening_balance: string;
  advance_balance: string;
  created_at: string;
  customer_group: number | null;
  customer_group_name: string | null;
  address: string;
  phone: string;
  city: string;
  is_active: boolean;
  total_sale_due: string;
  total_purchase_due: string;
  total_sell_return: string;
  total_purchase_return: string;
}

export interface ContactDetail {
  id: number;
  contact_code: string;
  contact_type: ContactType;
  name: string;
  business_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  tax_number: string;
  customer_group: number | null;
  credit_limit: string;
  pay_term_days: number | null;
  opening_balance: string;
  advance_balance: string;
  custom_field_1: string;
  custom_field_2: string;
  is_active: boolean;
  created_at: string;
}

export interface ContactWritePayload {
  contact_type: ContactType;
  name: string;
  business_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_number?: string;
  customer_group?: number | null;
  credit_limit?: string | number;
  pay_term_days?: number | null;
  opening_balance?: string | number;
  advance_balance?: string | number;
  custom_field_1?: string;
  custom_field_2?: string;
  is_active?: boolean;
}

export interface ContactImportResult {
  created: number;
  failed: { row: number; errors: Record<string, string[]> }[];
}

// --- Products: Units --------------------------------------------------

export interface Unit {
  id: number;
  name: string;
  short_name: string;
  allow_decimal: boolean;
}

export interface UnitWritePayload {
  name: string;
  short_name: string;
  allow_decimal?: boolean;
}

// --- Products: lookups (Category / Brand / TaxRate) -------------------

export interface Category {
  id: number;
  name: string;
  category_code: string;
  description: string;
  parent: number | null;
  parent_name: string | null;
  is_active: boolean;
}

export interface Brand {
  id: number;
  name: string;
  note: string;
  is_active: boolean;
}

export interface TaxRate {
  id: number;
  name: string;
  rate: string;
  is_active: boolean;
}

// --- Products -----------------------------------------------------

export type ProductType = "Single" | "Variable";

export interface ProductRow {
  id: number;
  image_url: string | null;
  name: string;
  sku: string | null;
  location_names: string;
  unit_purchase_price: string;
  selling_price: string;
  current_stock: string;
  unit_name: string;
  product_type: ProductType;
  category_name: string;
  subcategory_name: string | null;
  brand_name: string;
  tax_name: string;
  custom_field_1: string;
  custom_field_2: string;
  custom_field_3: string;
  custom_field_4: string;
  manage_stock: boolean;
  not_for_selling: boolean;
  is_active: boolean;
}

export interface ProductVariantDetail {
  id: number;
  variant_name: string;
  sku: string;
  purchase_price: string;
  selling_price: string;
  alert_quantity: string | null;
}

export type BarcodeType = "c128" | "c39" | "ean13" | "ean8" | "upca" | "upce";

export interface ProductDetail {
  id: number;
  name: string;
  sku: string | null;
  barcode_type: BarcodeType;
  unit: number | null;
  category: number | null;
  subcategory: number | null;
  brand: number | null;
  tax_rate: number | null;
  location_ids: number[];
  image_url: string | null;
  brochure_url: string | null;
  description: string;
  weight: string | null;
  has_variants: boolean;
  product_type: ProductType;
  manage_stock: boolean;
  enable_serial_tracking: boolean;
  alert_quantity: string;
  custom_field_1: string;
  custom_field_2: string;
  custom_field_3: string;
  custom_field_4: string;
  not_for_selling: boolean;
  is_active: boolean;
  variants: ProductVariantDetail[];
  created_at: string;
}

export interface ProductFilters {
  product_type?: "single" | "variable";
  category?: number;
  brand?: number;
  tax_rate?: number;
  unit?: number;
  location?: number;
  not_for_selling?: boolean;
  search?: string;
}

export interface VariantInput {
  variant_name: string;
  sku?: string;
  purchase_price: string;
  selling_price: string;
  alert_quantity?: string;
}

// --- Purchases ------------------------------------------------------

export type PurchaseStatusValue = "pending" | "ordered" | "partial" | "received";
export type DiscountTypeValue = "none" | "percentage" | "fixed";
export type PaymentMethodValue = "cash" | "card" | "bank_transfer" | "bkash" | "nagad" | "cheque" | "other";

export interface VariantSearchResult {
  id: number;
  display_name: string;
  product_name: string;
  variant_name: string;
  sku: string;
  barcode: string | null;
  purchase_price: string;
  selling_price: string;
  unit_short_name: string;
}

export interface PurchaseListRow {
  id: number;
  reference_no: string;
  purchase_date: string;
  location_name: string;
  supplier_name: string;
  status: PurchaseStatusValue;
  status_display: string;
  payment_status: PaymentStatusValue;
  payment_status_display: string;
  total: string;
  due_amount: string;
  added_by: string;
}

export type PaymentStatusValue = "due" | "partial" | "paid";

export interface PurchaseItemDetail {
  id: number;
  variant: number;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: string;
  unit_cost: string;
  discount_percent: string;
  unit_cost_after_discount: string;
  line_total: string;
  selling_price: string | null;
  profit_margin_percent: string | null;
  mfg_date: string | null;
  exp_date: string | null;
}

export interface PurchaseDetail {
  id: number;
  reference_no: string;
  purchase_date: string;
  pay_term_days: number | null;
  location: number;
  location_name: string;
  supplier: number;
  supplier_name: string;
  status: PurchaseStatusValue;
  payment_status: PaymentStatusValue;
  attached_document_url: string | null;
  subtotal: string;
  discount_type: DiscountTypeValue;
  discount_amount: string;
  discount: string;
  tax_rate: number | null;
  tax_name: string | null;
  tax: string;
  shipping_details: string;
  shipping_charges: string;
  additional_expenses_note: string;
  additional_expenses_amount: string;
  total: string;
  paid_amount: string;
  payment_method: PaymentMethodValue;
  paid_on: string | null;
  payment_note: string;
  due_amount: string;
  notes: string;
  items: PurchaseItemDetail[];
  created_at: string;
}

export interface PurchaseFilters {
  location?: number;
  supplier?: number;
  status?: PurchaseStatusValue;
  payment_status?: PaymentStatusValue;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PurchaseItemInput {
  variant: number;
  quantity: string;
  unit_cost: string;
  discount_percent: string;
  selling_price?: string;
  mfg_date?: string;
  exp_date?: string;
}

export interface PurchaseReturnRow {
  id: number;
  return_date: string;
  reference_no: string;
  parent_purchase_reference: string;
  location_name: string;
  supplier_name: string;
  payment_status: PaymentStatusValue;
  payment_status_display: string;
  total: string;
  due_amount: string;
}

export interface ReturnableItem {
  id: number;
  variant: number;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: string;
  unit_cost_after_discount: string;
  already_returned: number;
  returnable_quantity: number;
}

export interface PurchaseReturnItemInput {
  variant: number;
  quantity: string;
  unit_cost: string;
}

export interface PurchaseReturnDetail {
  id: number;
  reference_no: string;
  purchase: number;
  parent_purchase_reference: string;
  supplier_name: string;
  location: number;
  location_name: string;
  return_date: string;
  total: string;
  paid_amount: string;
  payment_status: PaymentStatusValue;
  due_amount: string;
  reason: string;
  items: {
    id: number;
    variant: number;
    product_name: string;
    variant_name: string;
    sku: string;
    quantity: string;
    unit_cost: string;
    line_total: string;
  }[];
  created_at: string;
}

// --- Sales ------------------------------------------------------------

export type SaleStatusValue = "final" | "draft" | "quotation" | "suspended";
export type ShippingStatusValue = "" | "ordered" | "packed" | "shipped" | "delivered" | "cancelled";

export interface SaleListRow {
  id: number;
  invoice_no: string;
  sale_date: string;
  location_name: string;
  customer_name: string;
  customer_phone: string;
  status: SaleStatusValue;
  status_display: string;
  payment_status: PaymentStatusValue;
  payment_status_display: string;
  shipping_status: ShippingStatusValue;
  shipping_status_display: string;
  total: string;
  paid_amount: string;
  due_amount: string;
  total_quantity: string;
  added_by: string;
}

export interface SaleItemDetail {
  id: number;
  variant: number;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: string;
  unit_price: string;
  discount_amount: string;
  subtotal: string;
}

export interface SaleDetail {
  id: number;
  invoice_no: string;
  sale_date: string;
  pay_term_days: number | null;
  location: number;
  location_name: string;
  customer: number | null;
  customer_name: string;
  customer_phone: string;
  status: SaleStatusValue;
  shipping_status: ShippingStatusValue;
  payment_status: PaymentStatusValue;
  attached_document_url: string | null;
  subtotal: string;
  discount_type: DiscountTypeValue;
  discount_amount: string;
  discount: string;
  tax_rate: number | null;
  tax_name: string | null;
  tax: string;
  notes: string;
  shipping_details: string;
  shipping_address: string;
  shipping_charges: string;
  delivered_to: string;
  shipping_documents_url: string | null;
  additional_expenses_note: string;
  additional_expenses_amount: string;
  total: string;
  paid_amount: string;
  payment_method: PaymentMethodValue;
  paid_on: string | null;
  payment_note: string;
  due_amount: string;
  total_quantity: string;
  shipped_quantity: string;
  quantity_remaining: string;
  items: SaleItemDetail[];
  created_at: string;
}

export interface SaleFilters {
  location?: number;
  customer?: number;
  status?: SaleStatusValue;
  payment_status?: PaymentStatusValue;
  shipping_status?: ShippingStatusValue;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SaleItemInput {
  variant: number;
  quantity: string;
  unit_price: string;
  discount_amount?: string;
}

export interface ReturnableSaleItem {
  id: number;
  variant: number;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: string;
  unit_price: string;
  already_returned: number;
  returnable_quantity: number;
}

export interface SaleReturnRow {
  id: number;
  return_date: string;
  reference_no: string;
  parent_sale_invoice: string;
  location_name: string;
  customer_name: string;
  payment_status: PaymentStatusValue;
  payment_status_display: string;
  total: string;
  due_amount: string;
}

export interface SaleReturnDetail {
  id: number;
  reference_no: string;
  sale: number;
  parent_sale_invoice: string;
  customer_name: string;
  location: number;
  location_name: string;
  return_date: string;
  total: string;
  paid_amount: string;
  payment_status: PaymentStatusValue;
  due_amount: string;
  reason: string;
  items: {
    id: number;
    variant: number;
    product_name: string;
    variant_name: string;
    sku: string;
    quantity: string;
    unit_price: string;
    line_total: string;
  }[];
  created_at: string;
}

// --- Online Reports (read-only, separate stock/sales pool) -----------

export interface OnlineProductStockRow {
  id: number;
  product_name: string;
  category_name: string;
  color_name: string;
  size_name: string;
  sku: string;
  stock: number;
  price: string;
  is_active: boolean;
}

export interface OnlineSaleRow {
  id: number;
  order_number: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  status: string;
  status_display: string;
  cancel_refund_status: string;
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  item_count: number;
  payment_method: string;
  payment_status: string;
}

export interface OnlinePaymentBreakdownRow {
  method: string;
  method_display: string;
  paid_total: number;
  pending_total: number;
  paid_count: number;
}

export interface OnlineSummary {
  stock: {
    total_units: number;
    active_products: number;
    out_of_stock_variants: number;
  };
  sales: {
    today: { total: number; orders: number };
    this_week: { total: number; orders: number };
    this_month: { total: number; orders: number };
  };
  payment_breakdown: OnlinePaymentBreakdownRow[];
  returned_or_cancelled_orders: number;
}

// --- Stock Adjustment ---------------------------------------------------

export type AdjustmentTypeValue = "normal" | "abnormal";

export interface StockAdjustmentListRow {
  id: number;
  reference_no: string;
  adjustment_date: string;
  location_name: string;
  adjustment_type: AdjustmentTypeValue;
  adjustment_type_display: string;
  total_amount: string;
  total_amount_recovered: string;
  reason: string;
  added_by: string;
}

export interface StockAdjustmentItemDetail {
  id: number;
  variant: number;
  product_name: string;
  variant_name: string;
  sku: string;
  quantity: string;
  unit_price: string;
  subtotal: string;
}

export interface StockAdjustmentDetail {
  id: number;
  reference_no: string;
  location: number;
  location_name: string;
  adjustment_date: string;
  adjustment_type: AdjustmentTypeValue;
  adjustment_type_display: string;
  total_amount: string;
  total_amount_recovered: string;
  reason: string;
  items: StockAdjustmentItemDetail[];
  created_at: string;
}

export interface StockAdjustmentFilters {
  location?: number;
  adjustment_type?: AdjustmentTypeValue;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface StockAdjustmentItemInput {
  variant: number;
  quantity: string;
  unit_price: string;
}

// --- Expenses ---------------------------------------------------------

export interface ExpenseCategory {
  id: number;
  name: string;
  category_code: string;
  parent: number | null;
  parent_name: string | null;
  is_active: boolean;
}

export interface ExpenseListRow {
  id: number;
  reference_no: string;
  expense_date: string;
  recurring_details: string | null;
  category_name: string;
  subcategory_name: string | null;
  location_name: string;
  payment_status: PaymentStatusValue;
  payment_status_display: string;
  tax: string;
  amount: string;
  due_amount: string;
  expense_for: string | null;
  contact_name: string | null;
  note: string;
  is_refund: boolean;
  added_by: string;
}

export interface ExpenseDetail {
  id: number;
  reference_no: string;
  location: number | null;
  location_name: string;
  category: number | null;
  category_name: string | null;
  subcategory: number | null;
  subcategory_name: string | null;
  expense_date: string;
  expense_for_user: number | null;
  expense_for_contact: number | null;
  attached_document_url: string | null;
  tax_rate: number | null;
  tax_name: string | null;
  tax: string;
  amount: string;
  is_refund: boolean;
  is_recurring: boolean;
  recurring_interval_value: number | null;
  recurring_interval_unit: "" | "days" | "months" | "years";
  recurring_repetitions: number | null;
  paid_amount: string;
  payment_status: PaymentStatusValue;
  payment_method: PaymentMethodValue;
  paid_on: string | null;
  payment_note: string;
  due_amount: string;
  note: string;
  created_at: string;
}

export interface ExpenseFilters {
  location?: number;
  category?: number;
  subcategory?: number;
  payment_status?: PaymentStatusValue;
  expense_for_contact?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// --- Reports ---------------------------------------------------------

export interface PurchasePaymentReportRow {
  id: number;
  reference_no: string;
  paid_on: string;
  amount: string;
  supplier_name: string;
  payment_method: PaymentMethodValue;
  payment_method_display: string;
  payment_reference: string;
  purchase: number;
  purchase_reference_no: string;
  attached_document_url: string | null;
}

export interface SalePaymentReportRow {
  id: number;
  reference_no: string;
  paid_on: string;
  amount: string;
  customer_name: string;
  customer_group_name: string | null;
  payment_method: PaymentMethodValue;
  payment_method_display: string;
  payment_reference: string;
  sale: number;
  sale_invoice_no: string;
  attached_document_url: string | null;
}

export interface ProductPurchaseReportRow {
  id: number;
  product_name: string;
  variant_name: string;
  sku: string;
  supplier_name: string;
  purchase: number;
  reference_no: string;
  date: string;
  quantity: string;
  unit_name: string;
  total_unit_adjusted: number;
  unit_cost_after_discount: string;
  line_total: string;
}

export interface ExpenseReportCategory {
  category_id: number | null;
  name: string;
  total: number;
}

export interface ExpenseReport {
  categories: ExpenseReportCategory[];
  grand_total: number;
}

export interface ReportFilters {
  search?: string;
  supplier?: number;
  customer?: number;
  location?: number;
  category?: number;
  payment_method?: string;
  customer_group?: number;
  date_from?: string;
  date_to?: string;
}

// --- Reports batch 2: Stock, Product Sell, Trending, Stock Adjustment ---

export interface StockReportRow {
  sku: string;
  product_name: string;
  location_name: string;
  unit_price: string;
  current_stock: string;
  unit_name: string;
  stock_value_by_purchase_price: string;
  stock_value_by_sale_price: string;
  potential_profit: string;
  total_unit_sold: string;
  total_unit_transferred: string;
  total_unit_adjusted: string;
}

export interface StockReportResponse extends Paginated<StockReportRow> {
  closing_stock_by_purchase_price: number;
  closing_stock_by_sale_price: number;
  potential_profit: number;
  profit_margin_percent: number;
}

export interface ProductSaleReportRow {
  id: number;
  product_name: string;
  variant_name: string;
  sku: string;
  unit_name: string;
  customer_name: string;
  contact_id: string | null;
  invoice_no: string;
  sale_id: number;
  date: string;
  quantity: string;
  unit_price: string;
  discount_amount: string;
  tax: number;
  price_inc_tax: number;
  total: number;
}

export interface ProductSaleGroupedRow {
  name: string;
  total_quantity: number;
  total_sales: number;
}

export interface TrendingProductRow {
  product_id: number;
  name: string;
  total_sales: number;
}

export interface StockAdjustmentReportResponse extends Paginated<StockAdjustmentListRow> {
  total_normal: number;
  total_abnormal: number;
  total_stock_adjustment: number;
  total_amount_recovered: number;
}

// --- Settings: Business, Locations, Prefixes ---------------------------

export type StockAccountingMethodValue = "fifo" | "lifo" | "average";
export type CurrencySymbolPlacementValue = "before" | "after";
export type DateFormatValue = "dd-mm-yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";
export type TimeFormatValue = "12h" | "24h";

export interface BusinessSettings {
  id: number;
  name: string;
  logo: string | null;
  email: string;
  phone: string;
  address: string;
  start_date: string | null;
  currency_code: string;
  currency_symbol: string;
  currency_symbol_placement: CurrencySymbolPlacementValue;
  timezone: string;
  fiscal_year_start_month: number;
  default_profit_percent: string;
  stock_accounting_method: StockAccountingMethodValue;
  transaction_edit_days: number;
  date_format: DateFormatValue;
  time_format: TimeFormatValue;
  low_stock_alert_enabled: boolean;
  stock_expiry_alert_days: number;
  receipt_paper_width: ReceiptPaperWidthValue;
  receipt_footer_text: string;
  receipt_show_logo: boolean;
}

export interface BusinessLocation {
  id: number;
  name: string;
  location_id: string;
  landmark: string;
  city: string;
  zip_code: string;
  state: string;
  country: string;
  address: string;
  phone: string;
  is_active: boolean;
}

export interface DocumentPrefixRow {
  document_type: string;
  document_type_display: string;
  prefix: string;
  is_customized: boolean;
}

// --- POS register: scanning + checkout --------------------------------

export interface ScanResult {
  id: number;
  display_name: string;
  product_name: string;
  variant_name: string;
  sku: string;
  barcode: string | null;
  selling_price: number;
  unit_short_name: string;
  current_stock: number | null;
  not_for_selling: boolean;
  manage_stock: boolean;
}

export interface CartLine {
  variantId: number;
  displayName: string;
  sku: string;
  barcode: string | null;
  unitName: string;
  unitPrice: string;
  quantity: string;
  discountAmount: string;
  /** Live stock at the till's location when scanned; null when the product doesn't track stock. */
  availableStock: number | null;
  manageStock: boolean;
}

export type ReceiptPaperWidthValue = "58mm" | "80mm" | "a4";
