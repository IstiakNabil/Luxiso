import { useState } from "react";
import { Search } from "lucide-react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useContacts } from "../hooks/useContacts";
import { useCategories, useBrands } from "../hooks/useProducts";
import { useProductSaleReport } from "../hooks/useReports";
import { getProductSaleReport } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney, formatQty } from "../utils/format";
import type { ProductSaleReportRow, ProductSaleGroupedRow, ReportFilters } from "../types/pos";

type ViewTab = "detailed" | "grouped" | "by_category" | "by_brand";

const TABS: { value: ViewTab; label: string }[] = [
  { value: "detailed", label: "Detailed" },
  { value: "grouped", label: "Grouped" },
  { value: "by_category", label: "By Category" },
  { value: "by_brand", label: "By Brand" },
];

function POSProductSellReportPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [tab, setTab] = useState<ViewTab>("detailed");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const customersQuery = useContacts("customer", 1, "", undefined);
  const locationsQuery = usePOSLocations();
  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();

  const filters: ReportFilters & { brand?: number } = {
    ...(search ? { search } : {}),
    ...(customerId ? { customer: customerId } : {}),
    ...(locationId ? { location: locationId } : {}),
    ...(categoryId ? { category: categoryId } : {}),
    ...(brandId ? { brand: brandId } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };

  const reportQuery = useProductSaleReport(page, tab, filters);

  const detailedData = tab === "detailed" ? (reportQuery.data as import("../types/pos").Paginated<ProductSaleReportRow> | undefined) : undefined;
  const groupedData = tab !== "detailed" ? (reportQuery.data as ProductSaleGroupedRow[] | undefined) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-bold text-[#221F35]">Product Sell Report</h1>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Search Product</span>
            <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-2.5 py-2">
              <Search size={14} className="text-[#8A84B8]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Product name / SKU"
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Customer</span>
            <select
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">None</option>
              {customersQuery.data?.results.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Business Location</span>
            <select
              value={locationId}
              onChange={(e) => { setLocationId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">Please Select</option>
              {locationsQuery.data?.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Category</span>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              {categoriesQuery.data?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Brand</span>
            <select
              value={brandId}
              onChange={(e) => { setBrandId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              {brandsQuery.data?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Date Range</span>
            <div className="flex gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-[#E7E4F3] px-2 py-2 text-[12px] outline-none focus:border-[#7C6AE8]"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full rounded-lg border border-[#E7E4F3] px-2 py-2 text-[12px] outline-none focus:border-[#7C6AE8]"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[#E7E4F3]">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setTab(t.value); setPage(1); }}
            className={`border-b-2 px-4 py-2 text-[13px] font-medium transition ${
              tab === t.value
                ? "border-[#7C6AE8] text-[#7C6AE8]"
                : "border-transparent text-[#726C8C] hover:text-[#221F35]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="text-[12px] text-[#A8A2C9]">
        "Detailed (With purchase)" isn't built yet — showing accurate per-line cost basis
        needs purchase-lot tracking, deferred alongside Items Report.
      </p>

      {tab === "detailed" ? (
        <DataTableShell<ProductSaleReportRow>
          title="Product Sales"
          data={detailedData}
          isLoading={reportQuery.isLoading}
          page={page}
          onPageChange={setPage}
          rowKey={(row) => row.id}
          emptyLabel="No sales in this range."
          filenameBase="product-sell-report"
          fetchAll={() =>
            fetchAllPages((p) =>
              getProductSaleReport(p, "detailed", filters).then(
                (d) => d as import("../types/pos").Paginated<ProductSaleReportRow>,
              ),
            )
          }
          columns={[
            {
              header: "Product",
              render: (row) => (row.variant_name ? `${row.product_name} — ${row.variant_name}` : row.product_name),
            },
            { header: "SKU", render: (row) => row.sku },
            { header: "Customer name", render: (row) => row.customer_name },
            { header: "Contact ID", render: (row) => row.contact_id || "—" },
            { header: "Invoice No.", render: (row) => row.invoice_no },
            { header: "Date", render: (row) => new Date(row.date).toLocaleString() },
            { header: "Quantity", align: "right", render: (row) => formatQty(row.quantity) },
            { header: "Unit Price", align: "right", render: (row) => formatMoney(row.unit_price, sym) },
            { header: "Discount", align: "right", render: (row) => formatMoney(row.discount_amount, sym) },
            { header: "Tax", align: "right", render: (row) => formatMoney(row.tax, sym) },
            { header: "Price inc. tax", align: "right", render: (row) => formatMoney(row.price_inc_tax, sym) },
            { header: "Total", align: "right", render: (row) => formatMoney(row.total, sym) },
          ]}
        />
      ) : (
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#EDEBFA] text-[#726C8C]">
                  <th className="py-2 pr-4 font-medium">
                    {tab === "grouped" ? "Product" : tab === "by_category" ? "Category" : "Brand"}
                  </th>
                  <th className="py-2 pr-4 text-right font-medium">Total Quantity</th>
                  <th className="py-2 pr-4 text-right font-medium">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {reportQuery.isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[#A8A2C9]">Loading…</td>
                  </tr>
                ) : !groupedData || groupedData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[#A8A2C9]">No sales in this range.</td>
                  </tr>
                ) : (
                  groupedData.map((row, i) => (
                    <tr key={i} className="border-b border-[#F5F4FA]">
                      <td className="py-2.5 pr-4 text-[#221F35]">{row.name}</td>
                      <td className="py-2.5 pr-4 text-right">{formatQty(row.total_quantity)}</td>
                      <td className="py-2.5 pr-4 text-right">{formatMoney(row.total_sales, sym)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default POSProductSellReportPage;
