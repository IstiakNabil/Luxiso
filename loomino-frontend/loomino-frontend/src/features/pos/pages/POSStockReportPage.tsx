import { useState } from "react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useCategories, useBrands, useAllUnits } from "../hooks/useProducts";
import { useStockReport } from "../hooks/useReports";
import { getStockReport } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney, formatQty } from "../utils/format";
import type { StockReportRow, ReportFilters } from "../types/pos";

function POSStockReportPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [unitId, setUnitId] = useState<number | "">("");

  const locationsQuery = usePOSLocations();
  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();
  const unitsQuery = useAllUnits();

  const filters: ReportFilters & { brand?: number; unit?: number } = {
    ...(locationId ? { location: locationId } : {}),
    ...(categoryId ? { category: categoryId } : {}),
    ...(brandId ? { brand: brandId } : {}),
    ...(unitId ? { unit: unitId } : {}),
  };
  const reportQuery = useStockReport(page, filters);
  const data = reportQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-bold text-[#221F35]">Stock Report</h1>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Business Location</span>
            <select
              value={locationId}
              onChange={(e) => { setLocationId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All locations</option>
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
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Unit</span>
            <select
              value={unitId}
              onChange={(e) => { setUnitId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              {unitsQuery.data?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <p className="text-[13px] text-[#726C8C]">Closing stock (By purchase price)</p>
          <p className="mt-1 text-[20px] font-bold text-[#221F35]">
            {formatMoney(data?.closing_stock_by_purchase_price ?? 0, sym)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <p className="text-[13px] text-[#726C8C]">Closing stock (By sale price)</p>
          <p className="mt-1 text-[20px] font-bold text-[#221F35]">
            {formatMoney(data?.closing_stock_by_sale_price ?? 0, sym)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <p className="text-[13px] text-[#726C8C]">Potential profit</p>
          <p className="mt-1 text-[20px] font-bold text-[#221F35]">
            {formatMoney(data?.potential_profit ?? 0, sym)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <p className="text-[13px] text-[#726C8C]">Profit Margin %</p>
          <p className="mt-1 text-[20px] font-bold text-[#221F35]">
            {(data?.profit_margin_percent ?? 0).toFixed(2)}
          </p>
        </div>
      </div>

      <DataTableShell<StockReportRow>
        title="Stock Report"
        data={data}
        isLoading={reportQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => `${row.sku}-${row.location_name}`}
        emptyLabel="No stock to report yet."
        filenameBase="stock-report"
        fetchAll={() => fetchAllPages((p) => getStockReport(p, filters))}
        columns={[
          { header: "SKU", render: (row) => row.sku },
          { header: "Product", render: (row) => row.product_name },
          { header: "Location", render: (row) => row.location_name },
          { header: "Unit Price", align: "right", render: (row) => formatMoney(row.unit_price, sym) },
          {
            header: "Current stock",
            align: "right",
            render: (row) => `${formatQty(row.current_stock)} ${row.unit_name}`,
          },
          {
            header: "Current Stock Value (By purchase price)",
            align: "right",
            render: (row) => formatMoney(row.stock_value_by_purchase_price, sym),
          },
          {
            header: "Current Stock Value (By sale price)",
            align: "right",
            render: (row) => formatMoney(row.stock_value_by_sale_price, sym),
          },
          {
            header: "Potential profit",
            align: "right",
            render: (row) => formatMoney(row.potential_profit, sym),
          },
          {
            header: "Total unit sold",
            align: "right",
            render: (row) => `${formatQty(row.total_unit_sold)} ${row.unit_name}`,
          },
          {
            header: "Total Unit Transfered",
            align: "right",
            render: () => "—",
            exportValue: () => "0",
          },
          {
            header: "Total Unit Adjusted",
            align: "right",
            render: (row) => `${formatQty(row.total_unit_adjusted)} ${row.unit_name}`,
          },
        ]}
      />
      <p className="text-[12px] text-[#A8A2C9]">
        "Total Unit Transfered" is always zero — inter-location stock transfers aren't a
        feature yet.
      </p>
    </div>
  );
}

export default POSStockReportPage;
