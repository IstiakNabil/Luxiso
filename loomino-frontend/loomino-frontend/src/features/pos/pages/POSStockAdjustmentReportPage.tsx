import { useState } from "react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useStockAdjustmentReport } from "../hooks/useReports";
import { getStockAdjustmentReport } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney } from "../utils/format";
import type { StockAdjustmentListRow, Paginated } from "../types/pos";

function POSStockAdjustmentReportPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [locationId, setLocationId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const locationsQuery = usePOSLocations();

  const filters = {
    ...(locationId ? { location: locationId } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };
  const reportQuery = useStockAdjustmentReport(page, filters);
  const data = reportQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold text-[#221F35]">Stock Adjustment Report</h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={locationId}
            onChange={(e) => { setLocationId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
            className="rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          >
            <option value="">All locations</option>
            {locationsQuery.data?.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#726C8C]">Total Normal:</span>
            <span className="font-semibold text-[#221F35]">{formatMoney(data?.total_normal ?? 0, sym)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[13px]">
            <span className="text-[#726C8C]">Total Abnormal:</span>
            <span className="font-semibold text-[#221F35]">{formatMoney(data?.total_abnormal ?? 0, sym)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#F5F4FA] pt-2 text-[13px]">
            <span className="text-[#726C8C]">Total Stock Adjustment:</span>
            <span className="font-semibold text-[#221F35]">{formatMoney(data?.total_stock_adjustment ?? 0, sym)}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#726C8C]">Total Amount Recovered:</span>
            <span className="font-semibold text-[#221F35]">
              {formatMoney(data?.total_amount_recovered ?? 0, sym)}
            </span>
          </div>
        </div>
      </div>

      <DataTableShell<StockAdjustmentListRow>
        title="Stock Adjustments"
        data={data as Paginated<StockAdjustmentListRow> | undefined}
        isLoading={reportQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No stock adjustments in this range."
        filenameBase="stock-adjustment-report"
        fetchAll={() => fetchAllPages((p) => getStockAdjustmentReport(p, filters))}
        columns={[
          { header: "Date", render: (row) => new Date(row.adjustment_date).toLocaleString() },
          { header: "Reference No", render: (row) => row.reference_no },
          { header: "Location", render: (row) => row.location_name },
          { header: "Adjustment type", render: (row) => row.adjustment_type_display },
          { header: "Total Amount", align: "right", render: (row) => formatMoney(row.total_amount, sym) },
          {
            header: "Total amount recovered",
            align: "right",
            render: (row) => formatMoney(row.total_amount_recovered, sym),
          },
          { header: "Reason", render: (row) => row.reason || "—" },
          { header: "Added By", render: (row) => row.added_by || "—" },
        ]}
      />
    </div>
  );
}

export default POSStockAdjustmentReportPage;
