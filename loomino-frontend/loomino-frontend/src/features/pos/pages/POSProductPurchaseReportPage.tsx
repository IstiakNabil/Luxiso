import { useState } from "react";
import { Search } from "lucide-react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useContacts } from "../hooks/useContacts";
import { useProductPurchaseReport } from "../hooks/useReports";
import { getProductPurchaseReport } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney, formatQty } from "../utils/format";
import type { ProductPurchaseReportRow, ReportFilters } from "../types/pos";

function POSProductPurchaseReportPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [supplierId, setSupplierId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const suppliersQuery = useContacts("supplier", 1, "", undefined);
  const locationsQuery = usePOSLocations();

  const filters: ReportFilters = {
    ...(search ? { search } : {}),
    ...(supplierId ? { supplier: supplierId } : {}),
    ...(locationId ? { location: locationId } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };
  const listQuery = useProductPurchaseReport(page, filters);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-bold text-[#221F35]">Product Purchase Report</h1>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Search Product</span>
            <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] px-2.5 py-2">
              <Search size={14} className="text-[#8A84B8]" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Enter product name / SKU"
                className="w-full bg-transparent text-[13px] outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Supplier</span>
            <select
              value={supplierId}
              onChange={(e) => { setSupplierId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">None</option>
              {suppliersQuery.data?.results.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
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

      <DataTableShell<ProductPurchaseReportRow>
        title="Product Purchases"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No purchases in this range."
        filenameBase="product-purchase-report"
        fetchAll={() => fetchAllPages((p) => getProductPurchaseReport(p, filters))}
        columns={[
          {
            header: "Product",
            render: (row) => (row.variant_name ? `${row.product_name} — ${row.variant_name}` : row.product_name),
          },
          { header: "SKU", render: (row) => row.sku },
          { header: "Supplier", render: (row) => row.supplier_name },
          { header: "Reference No", render: (row) => row.reference_no },
          { header: "Date", render: (row) => new Date(row.date).toLocaleDateString() },
          {
            header: "Quantity",
            align: "right",
            render: (row) => `${formatQty(row.quantity)} ${row.unit_name}`,
          },
          {
            header: "Total Unit Adjusted",
            align: "right",
            render: (row) => `${formatQty(row.total_unit_adjusted)} ${row.unit_name}`,
          },
          {
            header: "Unit Purchase Price",
            align: "right",
            render: (row) => formatMoney(row.unit_cost_after_discount, sym),
          },
          { header: "Subtotal", align: "right", render: (row) => formatMoney(row.line_total, sym) },
        ]}
      />
    </div>
  );
}

export default POSProductPurchaseReportPage;
