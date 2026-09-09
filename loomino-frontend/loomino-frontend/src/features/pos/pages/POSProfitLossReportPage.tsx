import { useState } from "react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useProfitLossReport } from "../hooks/useReports";
import { formatMoney } from "../utils/format";

function POSProfitLossReportPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [locationId, setLocationId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{
    location?: number;
    date_from?: string;
    date_to?: string;
  }>({});

  const locationsQuery = usePOSLocations();
  const reportQuery = useProfitLossReport(appliedFilters);
  const report = reportQuery.data;

  const handleApply = () => {
    setAppliedFilters({
      ...(locationId ? { location: locationId } : {}),
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {}),
    });
  };

  const netProfit = Number(report?.net_profit ?? 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Profit / Loss Report</h1>
        <p className="text-[13px] text-[#726C8C]">
          Revenue excludes tax collected. Cost of Goods Sold uses each product's current
          purchase price, not necessarily what that specific unit originally cost. Stock
          write-offs and found-stock adjustments are included as real losses/gains.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">
              Business Location
            </span>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All locations</option>
              {locationsQuery.data?.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Date Range</span>
            <div className="flex gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-[#E7E4F3] px-2 py-2 text-[12px] outline-none focus:border-[#7C6AE8]"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-[#E7E4F3] px-2 py-2 text-[12px] outline-none focus:border-[#7C6AE8]"
              />
            </div>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-[#7C6AE8] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {reportQuery.isLoading ? (
        <p className="py-10 text-center text-[13px] text-[#A8A2C9]">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
              <p className="text-[12px] text-[#A8A2C9]">Total Sales</p>
              <p className="text-[18px] font-semibold text-[#221F35]">
                {formatMoney(report?.total_sales ?? 0, sym)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
              <p className="text-[12px] text-[#A8A2C9]">Sell Returns</p>
              <p className="text-[18px] font-semibold text-[#C24F4F]">
                −{formatMoney(report?.total_sell_return ?? 0, sym)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
              <p className="text-[12px] text-[#A8A2C9]">Net Sales</p>
              <p className="text-[18px] font-semibold text-[#221F35]">
                {formatMoney(report?.net_sales ?? 0, sym)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
              <p className="text-[12px] text-[#A8A2C9]">Cost of Goods Sold</p>
              <p className="text-[18px] font-semibold text-[#B8791F]">
                −{formatMoney(report?.total_cogs ?? 0, sym)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
              <p className="text-[12px] text-[#A8A2C9]">Gross Profit</p>
              <p className="text-[18px] font-semibold text-[#2E9E5B]">
                {formatMoney(report?.gross_profit ?? 0, sym)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
              <p className="text-[12px] text-[#A8A2C9]">Total Expenses</p>
              <p className="text-[18px] font-semibold text-[#C24F4F]">
                −{formatMoney(report?.total_expense ?? 0, sym)}
              </p>
            </div>
            <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
              <p className="text-[12px] text-[#A8A2C9]">Stock Adjustments</p>
              <p
                className={`text-[18px] font-semibold ${
                  Number(report?.net_stock_adjustment_impact ?? 0) >= 0
                    ? "text-[#2E9E5B]"
                    : "text-[#C24F4F]"
                }`}
              >
                {Number(report?.net_stock_adjustment_impact ?? 0) >= 0 ? "+" : ""}
                {formatMoney(report?.net_stock_adjustment_impact ?? 0, sym)}
              </p>
              <p className="mt-1 text-[11px] text-[#A8A2C9]">
                Write-offs −{formatMoney(report?.stock_adjustment_loss ?? 0, sym)}, Found stock +
                {formatMoney(report?.stock_adjustment_gain ?? 0, sym)}
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-5 ${
              netProfit >= 0 ? "border-[#CDEFDA] bg-[#F3FBF6]" : "border-[#F3DCDC] bg-[#FDF3F3]"
            }`}
          >
            <p className="text-[12px] text-[#A8A2C9]">Net Profit</p>
            <p
              className={`text-[20px] font-bold ${
                netProfit >= 0 ? "text-[#2E9E5B]" : "text-[#C24F4F]"
              }`}
            >
              {formatMoney(report?.net_profit ?? 0, sym)}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default POSProfitLossReportPage;
