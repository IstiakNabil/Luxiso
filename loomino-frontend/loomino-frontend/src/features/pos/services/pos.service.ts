import api from "@/lib/api";

import type {
  POSMeResponse,
  DashboardSummary,
  DashboardFilters,
  Paginated,
  SalesPaymentDueRow,
  PurchasePaymentDueRow,
  ProductStockAlertRow,
  StockExpiryAlertRow,
  SalesOrderRow,
  POSLocation,
  AccountSearchResult,
  POSStaffRow,
  POSStaffDetail,
  CreateStaffPayload,
  UpdateStaffPayload,
  RoleReference,
  ContactRow,
  ContactDetail,
  ContactWritePayload,
  CustomerGroup,
  ContactImportResult,
  Unit,
  UnitWritePayload,
  Category,
  Brand,
  TaxRate,
  ProductRow,
  ProductDetail,
  ProductFilters,
  VariantSearchResult,
  PurchaseListRow,
  PurchaseDetail,
  PurchaseFilters,
  PurchaseReturnRow,
  ReturnableItem,
  PurchaseReturnDetail,
  SaleListRow,
  SaleDetail,
  SaleFilters,
  ReturnableSaleItem,
  SaleReturnRow,
  SaleReturnDetail,
  OnlineProductStockRow,
  OnlineSaleRow,
  OnlineSummary,
  StockAdjustmentListRow,
  StockAdjustmentDetail,
  StockAdjustmentFilters,
  ExpenseCategory,
  ExpenseListRow,
  ExpenseDetail,
  ExpenseFilters,
  PurchasePaymentReportRow,
  SalePaymentReportRow,
  ProductPurchaseReportRow,
  ExpenseReport,
  ReportFilters,
  StockReportResponse,
  ProductSaleReportRow,
  ProductSaleGroupedRow,
  TrendingProductRow,
  StockAdjustmentReportResponse,
  BusinessSettings,
  BusinessLocation,
  DocumentPrefixRow,
  ScanResult,
} from "../types/pos";

/**
 * Every call below rides the same JWT the e-commerce admin panel
 * already attached (see src/lib/api.ts's isAdminContext check) — POS
 * staff never see a second login screen. The backend independently
 * requires an active POSStaffProfile on top of that token.
 */

export async function getPOSMe(): Promise<POSMeResponse> {
  const res = await api.get("/pos/me/");
  return res.data;
}

function buildParams(filters?: DashboardFilters) {
  if (!filters) return undefined;
  const params: Record<string, string> = {};
  if (filters.location) params.location = String(filters.location);
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  return params;
}

export async function getDashboardSummary(
  filters?: DashboardFilters,
): Promise<DashboardSummary> {
  const res = await api.get("/pos/dashboard/summary/", {
    params: buildParams(filters),
  });
  return res.data;
}

export async function getSalesPaymentDue(
  page: number,
  filters?: DashboardFilters,
): Promise<Paginated<SalesPaymentDueRow>> {
  const res = await api.get("/pos/dashboard/sales-payment-due/", {
    params: { page, ...buildParams(filters) },
  });
  return res.data;
}

export async function getPurchasePaymentDue(
  page: number,
  filters?: DashboardFilters,
): Promise<Paginated<PurchasePaymentDueRow>> {
  const res = await api.get("/pos/dashboard/purchase-payment-due/", {
    params: { page, ...buildParams(filters) },
  });
  return res.data;
}

export async function getStockAlert(
  page: number,
  filters?: DashboardFilters,
): Promise<Paginated<ProductStockAlertRow>> {
  const res = await api.get("/pos/dashboard/stock-alert/", {
    params: { page, ...buildParams(filters) },
  });
  return res.data;
}

export async function getStockExpiryAlert(
  page: number,
  filters?: DashboardFilters,
): Promise<Paginated<StockExpiryAlertRow>> {
  const res = await api.get("/pos/dashboard/stock-expiry-alert/", {
    params: { page, ...buildParams(filters) },
  });
  return res.data;
}

export async function getSalesOrders(
  page: number,
  filters?: DashboardFilters,
): Promise<Paginated<SalesOrderRow>> {
  const res = await api.get("/pos/dashboard/sales-orders/", {
    params: { page, ...buildParams(filters) },
  });
  return res.data;
}

export async function getPOSLocations(): Promise<POSLocation[]> {
  const res = await api.get("/pos/dashboard/locations/");
  return res.data;
}

// --- User Management -----------------------------------------------

export async function searchAccounts(
  q: string,
  page = 1,
): Promise<Paginated<AccountSearchResult>> {
  const res = await api.get("/pos/user-management/accounts/", {
    params: { q, page },
  });
  return res.data;
}

export async function getStaffList(
  page: number,
  search?: string,
): Promise<Paginated<POSStaffRow>> {
  const res = await api.get("/pos/user-management/users/", {
    params: { page, ...(search ? { search } : {}) },
  });
  return res.data;
}

export async function getStaffDetail(id: number): Promise<POSStaffDetail> {
  const res = await api.get(`/pos/user-management/users/${id}/`);
  return res.data;
}

export async function createStaff(
  payload: CreateStaffPayload,
): Promise<POSStaffDetail> {
  const res = await api.post("/pos/user-management/users/", payload);
  return res.data;
}

export async function updateStaff(
  id: number,
  payload: UpdateStaffPayload,
): Promise<POSStaffDetail> {
  const res = await api.patch(`/pos/user-management/users/${id}/`, payload);
  return res.data;
}

export async function deleteStaff(id: number): Promise<void> {
  await api.delete(`/pos/user-management/users/${id}/`);
}

export async function getRolesReference(): Promise<RoleReference[]> {
  const res = await api.get("/pos/user-management/roles/");
  return res.data;
}

// --- Contacts -----------------------------------------------------

export async function getContacts(
  page: number,
  type: "customer" | "supplier",
  search?: string,
  customerGroup?: number,
): Promise<Paginated<ContactRow>> {
  const res = await api.get("/pos/contacts/", {
    params: {
      page,
      type,
      ...(search ? { search } : {}),
      ...(customerGroup ? { customer_group: customerGroup } : {}),
    },
  });
  return res.data;
}

export async function getContactDetail(id: number): Promise<ContactDetail> {
  const res = await api.get(`/pos/contacts/${id}/`);
  return res.data;
}

export async function createContact(
  payload: ContactWritePayload,
): Promise<ContactDetail> {
  const res = await api.post("/pos/contacts/", payload);
  return res.data;
}

export async function updateContact(
  id: number,
  payload: Partial<ContactWritePayload>,
): Promise<ContactDetail> {
  const res = await api.patch(`/pos/contacts/${id}/`, payload);
  return res.data;
}

export async function deleteContact(id: number): Promise<void> {
  await api.delete(`/pos/contacts/${id}/`);
}

export async function getCustomerGroups(): Promise<CustomerGroup[]> {
  const res = await api.get("/pos/contacts/customer-groups/");
  return res.data;
}

export async function createCustomerGroup(
  payload: { name: string; description?: string },
): Promise<CustomerGroup> {
  const res = await api.post("/pos/contacts/customer-groups/", payload);
  return res.data;
}

export async function updateCustomerGroup(
  id: number,
  payload: Partial<{ name: string; description: string; is_active: boolean }>,
): Promise<CustomerGroup> {
  const res = await api.patch(`/pos/contacts/customer-groups/${id}/`, payload);
  return res.data;
}

export async function deleteCustomerGroup(id: number): Promise<void> {
  await api.delete(`/pos/contacts/customer-groups/${id}/`);
}

export async function importContacts(file: File): Promise<ContactImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/pos/contacts/import/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function downloadContactImportTemplate(): Promise<void> {
  // A plain <a href> to this endpoint would 401 — it requires the JWT
  // bearer header, which only the axios client attaches, so fetch as
  // a blob through it and trigger the download manually.
  const res = await api.get("/pos/contacts/import/template/", {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = "contacts_import_template.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// --- Products: Units -----------------------------------------------

export async function getUnits(
  page: number,
  search?: string,
): Promise<Paginated<Unit>> {
  const res = await api.get("/pos/products/units/", {
    params: { page, ...(search ? { search } : {}) },
  });
  return res.data;
}

export async function createUnit(payload: UnitWritePayload): Promise<Unit> {
  const res = await api.post("/pos/products/units/", payload);
  return res.data;
}

export async function updateUnit(
  id: number,
  payload: Partial<UnitWritePayload>,
): Promise<Unit> {
  const res = await api.patch(`/pos/products/units/${id}/`, payload);
  return res.data;
}

export async function deleteUnit(id: number): Promise<void> {
  await api.delete(`/pos/products/units/${id}/`);
}

// --- Products: Category / Brand / TaxRate (simple lookups) --------

export async function getCategories(): Promise<Category[]> {
  const res = await api.get("/pos/products/categories/");
  return res.data;
}
export async function createCategory(payload: {
  name: string;
  category_code?: string;
  description?: string;
  parent?: number | null;
}): Promise<Category> {
  const res = await api.post("/pos/products/categories/", payload);
  return res.data;
}
export async function updateCategory(
  id: number,
  payload: Partial<{
    name: string;
    category_code: string;
    description: string;
    parent: number | null;
    is_active: boolean;
  }>,
): Promise<Category> {
  const res = await api.patch(`/pos/products/categories/${id}/`, payload);
  return res.data;
}
export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/pos/products/categories/${id}/`);
}

export async function getBrands(): Promise<Brand[]> {
  const res = await api.get("/pos/products/brands/");
  return res.data;
}
export async function createBrand(payload: { name: string; note?: string }): Promise<Brand> {
  const res = await api.post("/pos/products/brands/", payload);
  return res.data;
}
export async function updateBrand(
  id: number,
  payload: Partial<{ name: string; note: string; is_active: boolean }>,
): Promise<Brand> {
  const res = await api.patch(`/pos/products/brands/${id}/`, payload);
  return res.data;
}
export async function deleteBrand(id: number): Promise<void> {
  await api.delete(`/pos/products/brands/${id}/`);
}

export async function getTaxRates(): Promise<TaxRate[]> {
  const res = await api.get("/pos/products/tax-rates/");
  return res.data;
}
export async function createTaxRate(payload: { name: string; rate: string }): Promise<TaxRate> {
  const res = await api.post("/pos/products/tax-rates/", payload);
  return res.data;
}

// --- Products -------------------------------------------------------

function buildProductParams(page: number, filters?: ProductFilters) {
  const params: Record<string, string | number> = { page };
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.product_type) params.product_type = filters.product_type;
  if (filters.category) params.category = filters.category;
  if (filters.brand) params.brand = filters.brand;
  if (filters.tax_rate) params.tax_rate = filters.tax_rate;
  if (filters.unit) params.unit = filters.unit;
  if (filters.location) params.location = filters.location;
  if (filters.not_for_selling) params.not_for_selling = "true";
  return params;
}

export async function getProducts(
  page: number,
  filters?: ProductFilters,
): Promise<Paginated<ProductRow>> {
  const res = await api.get("/pos/products/", {
    params: buildProductParams(page, filters),
  });
  return res.data;
}

export async function getProductDetail(id: number): Promise<ProductDetail> {
  const res = await api.get(`/pos/products/${id}/`);
  return res.data;
}

/**
 * Both create and update take FormData directly (built by the Add
 * Product page) rather than a typed payload object -- the backend
 * needs multipart for the optional image, and `variants` /
 * `opening_stock` are sent as JSON-encoded strings alongside it since
 * multipart can't carry nested arrays natively.
 */
export async function createProduct(formData: FormData): Promise<ProductDetail> {
  const res = await api.post("/pos/products/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateProduct(id: number, formData: FormData): Promise<ProductDetail> {
  const res = await api.patch(`/pos/products/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/pos/products/${id}/`);
}

// --- Products: variant search (used by Add Purchase / future Add Sale) ---

export async function searchVariants(q: string): Promise<VariantSearchResult[]> {
  const res = await api.get("/pos/products/variants/search/", { params: { q } });
  return res.data;
}

// --- Purchases -------------------------------------------------------

function buildPurchaseParams(page: number, filters?: PurchaseFilters) {
  const params: Record<string, string | number> = { page };
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.location) params.location = filters.location;
  if (filters.supplier) params.supplier = filters.supplier;
  if (filters.status) params.status = filters.status;
  if (filters.payment_status) params.payment_status = filters.payment_status;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  return params;
}

export async function getPurchases(
  page: number,
  filters?: PurchaseFilters,
): Promise<Paginated<PurchaseListRow>> {
  const res = await api.get("/pos/purchases/", { params: buildPurchaseParams(page, filters) });
  return res.data;
}

export async function getPurchaseDetail(id: number): Promise<PurchaseDetail> {
  const res = await api.get(`/pos/purchases/${id}/`);
  return res.data;
}

/**
 * Takes FormData directly (built by the Add Purchase page), same
 * reasoning as createProduct -- multipart for the optional attached
 * document, with "items" sent as a JSON-encoded string alongside it.
 */
export async function createPurchase(formData: FormData): Promise<PurchaseDetail> {
  const res = await api.post("/pos/purchases/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getPurchaseReturns(
  page: number,
  filters?: { location?: number; date_from?: string; date_to?: string },
): Promise<Paginated<PurchaseReturnRow>> {
  const params: Record<string, string | number> = { page };
  if (filters?.location) params.location = filters.location;
  if (filters?.date_from) params.date_from = filters.date_from;
  if (filters?.date_to) params.date_to = filters.date_to;
  const res = await api.get("/pos/purchases/returns/", { params });
  return res.data;
}

export async function getReturnableItems(purchaseId: number): Promise<ReturnableItem[]> {
  const res = await api.get(`/pos/purchases/${purchaseId}/returnable-items/`);
  return res.data;
}

export async function createPurchaseReturn(formData: FormData): Promise<PurchaseReturnDetail> {
  const res = await api.post("/pos/purchases/returns/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// --- Sales ------------------------------------------------------------

function buildSaleParams(page: number, filters?: SaleFilters) {
  const params: Record<string, string | number> = { page };
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.location) params.location = filters.location;
  if (filters.customer) params.customer = filters.customer;
  if (filters.status) params.status = filters.status;
  if (filters.payment_status) params.payment_status = filters.payment_status;
  if (filters.shipping_status) params.shipping_status = filters.shipping_status;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  return params;
}

export async function getSales(
  page: number,
  filters?: SaleFilters,
): Promise<Paginated<SaleListRow>> {
  const res = await api.get("/pos/sales/", { params: buildSaleParams(page, filters) });
  return res.data;
}

export async function getSaleDetail(id: number): Promise<SaleDetail> {
  const res = await api.get(`/pos/sales/${id}/`);
  return res.data;
}

export async function createSale(formData: FormData): Promise<SaleDetail> {
  const res = await api.post("/pos/sales/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteSale(id: number): Promise<void> {
  await api.delete(`/pos/sales/${id}/`);
}

export async function getReturnableSaleItems(saleId: number): Promise<ReturnableSaleItem[]> {
  const res = await api.get(`/pos/sales/${saleId}/returnable-items/`);
  return res.data;
}

export async function getSaleReturns(
  page: number,
  filters?: { location?: number; date_from?: string; date_to?: string },
): Promise<Paginated<SaleReturnRow>> {
  const params: Record<string, string | number> = { page };
  if (filters?.location) params.location = filters.location;
  if (filters?.date_from) params.date_from = filters.date_from;
  if (filters?.date_to) params.date_to = filters.date_to;
  const res = await api.get("/pos/sales/returns/", { params });
  return res.data;
}

export async function createSaleReturn(formData: FormData): Promise<SaleReturnDetail> {
  const res = await api.post("/pos/sales/returns/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// --- Online Reports (read-only) ---------------------------------------

export async function getOnlineSummary(): Promise<OnlineSummary> {
  const res = await api.get("/pos/online/summary/");
  return res.data;
}

export async function getOnlineProducts(
  page: number,
  filters?: { search?: string; out_of_stock?: boolean; category?: number },
): Promise<Paginated<OnlineProductStockRow>> {
  const params: Record<string, string | number> = { page };
  if (filters?.search) params.search = filters.search;
  if (filters?.out_of_stock) params.out_of_stock = "true";
  if (filters?.category) params.category = filters.category;
  const res = await api.get("/pos/online/products/", { params });
  return res.data;
}

export async function getOnlineSales(
  page: number,
  filters?: { search?: string; status?: string; date_from?: string; date_to?: string },
): Promise<Paginated<OnlineSaleRow>> {
  const params: Record<string, string | number> = { page };
  if (filters?.search) params.search = filters.search;
  if (filters?.status) params.status = filters.status;
  if (filters?.date_from) params.date_from = filters.date_from;
  if (filters?.date_to) params.date_to = filters.date_to;
  const res = await api.get("/pos/online/sales/", { params });
  return res.data;
}

// --- Stock Adjustment --------------------------------------------------

function buildStockAdjustmentParams(page: number, filters?: StockAdjustmentFilters) {
  const params: Record<string, string | number> = { page };
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.location) params.location = filters.location;
  if (filters.adjustment_type) params.adjustment_type = filters.adjustment_type;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  return params;
}

export async function getStockAdjustments(
  page: number,
  filters?: StockAdjustmentFilters,
): Promise<Paginated<StockAdjustmentListRow>> {
  const res = await api.get("/pos/stock-adjustments/", {
    params: buildStockAdjustmentParams(page, filters),
  });
  return res.data;
}

export async function createStockAdjustment(formData: FormData): Promise<StockAdjustmentDetail> {
  const res = await api.post("/pos/stock-adjustments/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteStockAdjustment(id: number): Promise<void> {
  await api.delete(`/pos/stock-adjustments/${id}/`);
}

// --- Expenses -----------------------------------------------------

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const res = await api.get("/pos/expenses/categories/");
  return res.data;
}
export async function createExpenseCategory(payload: {
  name: string;
  category_code?: string;
  parent?: number | null;
}): Promise<ExpenseCategory> {
  const res = await api.post("/pos/expenses/categories/", payload);
  return res.data;
}
export async function updateExpenseCategory(
  id: number,
  payload: Partial<{ name: string; category_code: string; parent: number | null; is_active: boolean }>,
): Promise<ExpenseCategory> {
  const res = await api.patch(`/pos/expenses/categories/${id}/`, payload);
  return res.data;
}
export async function deleteExpenseCategory(id: number): Promise<void> {
  await api.delete(`/pos/expenses/categories/${id}/`);
}

function buildExpenseParams(page: number, filters?: ExpenseFilters) {
  const params: Record<string, string | number> = { page };
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.location) params.location = filters.location;
  if (filters.category) params.category = filters.category;
  if (filters.subcategory) params.subcategory = filters.subcategory;
  if (filters.payment_status) params.payment_status = filters.payment_status;
  if (filters.expense_for_contact) params.expense_for_contact = filters.expense_for_contact;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  return params;
}

export async function getExpenses(
  page: number,
  filters?: ExpenseFilters,
): Promise<Paginated<ExpenseListRow>> {
  const res = await api.get("/pos/expenses/", { params: buildExpenseParams(page, filters) });
  return res.data;
}

export async function getExpenseDetail(id: number): Promise<ExpenseDetail> {
  const res = await api.get(`/pos/expenses/${id}/`);
  return res.data;
}

export async function createExpense(formData: FormData): Promise<ExpenseDetail> {
  const res = await api.post("/pos/expenses/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteExpense(id: number): Promise<void> {
  await api.delete(`/pos/expenses/${id}/`);
}

// --- Reports -----------------------------------------------------------

export async function getPurchasePaymentReport(
  page: number,
  filters?: ReportFilters,
): Promise<Paginated<PurchasePaymentReportRow>> {
  const res = await api.get("/pos/reports/purchase-payments/", {
    params: buildReportParams(page, filters),
  });
  return res.data;
}

export async function getSalePaymentReport(
  page: number,
  filters?: ReportFilters,
): Promise<Paginated<SalePaymentReportRow>> {
  const res = await api.get("/pos/reports/sale-payments/", {
    params: buildReportParams(page, filters),
  });
  return res.data;
}

export async function getProductPurchaseReport(
  page: number,
  filters?: ReportFilters,
): Promise<Paginated<ProductPurchaseReportRow>> {
  const res = await api.get("/pos/reports/product-purchases/", {
    params: buildReportParams(page, filters),
  });
  return res.data;
}

export async function getExpenseReport(
  filters?: { location?: number; category?: number; date_from?: string; date_to?: string },
): Promise<ExpenseReport> {
  const params: Record<string, string | number> = {};
  if (filters?.location) params.location = filters.location;
  if (filters?.category) params.category = filters.category;
  if (filters?.date_from) params.date_from = filters.date_from;
  if (filters?.date_to) params.date_to = filters.date_to;
  const res = await api.get("/pos/reports/expenses/", { params });
  return res.data;
}

// --- Reports batch 2 --------------------------------------------------

function buildReportParams(page: number | undefined, filters?: ReportFilters) {
  const params: Record<string, string | number> = {};
  if (page) params.page = page;
  if (!filters) return params;
  if (filters.search) params.search = filters.search;
  if (filters.supplier) params.supplier = filters.supplier;
  if (filters.customer) params.customer = filters.customer;
  if (filters.location) params.location = filters.location;
  if (filters.category) params.category = filters.category;
  if (filters.payment_method) params.payment_method = filters.payment_method;
  if (filters.customer_group) params.customer_group = filters.customer_group;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  return params;
}

export async function getStockReport(
  page: number,
  filters?: ReportFilters & { brand?: number; unit?: number; subcategory?: number },
): Promise<StockReportResponse> {
  const params = buildReportParams(page, filters);
  if (filters?.brand) params.brand = filters.brand;
  if (filters?.unit) params.unit = filters.unit;
  if (filters?.subcategory) params.subcategory = filters.subcategory;
  const res = await api.get("/pos/reports/stock/", { params });
  return res.data;
}

export async function getProductSaleReport(
  page: number,
  view: "detailed" | "grouped" | "by_category" | "by_brand",
  filters?: ReportFilters & { brand?: number },
): Promise<Paginated<ProductSaleReportRow> | ProductSaleGroupedRow[]> {
  const params = buildReportParams(view === "detailed" ? page : undefined, filters);
  params.view = view;
  if (filters?.brand) params.brand = filters.brand;
  const res = await api.get("/pos/reports/product-sales/", { params });
  return res.data;
}

export async function getTrendingProducts(filters?: {
  location?: number;
  category?: number;
  subcategory?: number;
  brand?: number;
  unit?: number;
  product_type?: string;
  date_from?: string;
  date_to?: string;
  number_of_products?: number;
}): Promise<TrendingProductRow[]> {
  const params: Record<string, string | number> = {};
  if (filters?.location) params.location = filters.location;
  if (filters?.category) params.category = filters.category;
  if (filters?.subcategory) params.subcategory = filters.subcategory;
  if (filters?.brand) params.brand = filters.brand;
  if (filters?.unit) params.unit = filters.unit;
  if (filters?.product_type) params.product_type = filters.product_type;
  if (filters?.date_from) params.date_from = filters.date_from;
  if (filters?.date_to) params.date_to = filters.date_to;
  params.number_of_products = filters?.number_of_products ?? 5;
  const res = await api.get("/pos/reports/trending-products/", { params });
  return res.data;
}

export async function getStockAdjustmentReport(
  page: number,
  filters?: { location?: number; date_from?: string; date_to?: string },
): Promise<StockAdjustmentReportResponse> {
  const params: Record<string, string | number> = { page };
  if (filters?.location) params.location = filters.location;
  if (filters?.date_from) params.date_from = filters.date_from;
  if (filters?.date_to) params.date_to = filters.date_to;
  const res = await api.get("/pos/reports/stock-adjustments/", { params });
  return res.data;
}

// --- Settings: Business, Locations, Prefixes ----------------------------

export async function getBusinessSettings(): Promise<BusinessSettings> {
  const res = await api.get("/pos/settings/business/");
  return res.data;
}

export async function updateBusinessSettings(
  formData: FormData,
): Promise<BusinessSettings> {
  const res = await api.patch("/pos/settings/business/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getBusinessLocations(): Promise<BusinessLocation[]> {
  const res = await api.get("/pos/settings/locations/");
  return res.data;
}

export async function createBusinessLocation(
  payload: Partial<BusinessLocation>,
): Promise<BusinessLocation> {
  const res = await api.post("/pos/settings/locations/", payload);
  return res.data;
}

export async function updateBusinessLocation(
  id: number,
  payload: Partial<BusinessLocation>,
): Promise<BusinessLocation> {
  const res = await api.patch(`/pos/settings/locations/${id}/`, payload);
  return res.data;
}

export async function deleteBusinessLocation(id: number): Promise<void> {
  await api.delete(`/pos/settings/locations/${id}/`);
}

export async function getDocumentPrefixes(): Promise<DocumentPrefixRow[]> {
  const res = await api.get("/pos/settings/prefixes/");
  return res.data;
}

export async function updateDocumentPrefix(
  documentType: string,
  prefix: string,
): Promise<DocumentPrefixRow[]> {
  const res = await api.patch("/pos/settings/prefixes/", {
    document_type: documentType,
    prefix,
  });
  return res.data;
}

// --- POS register: barcode scan lookup ---------------------------------

/**
 * Exact-match lookup for the till. Throws on 404 so the caller can
 * beep / show "unknown barcode" rather than silently doing nothing.
 */
export async function scanVariant(code: string, locationId?: number): Promise<ScanResult> {
  const params: Record<string, string | number> = { code };
  if (locationId) params.location = locationId;
  const res = await api.get("/pos/products/variants/scan/", { params });
  return res.data;
}
