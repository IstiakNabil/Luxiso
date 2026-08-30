import { useState } from "react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useExpenseCategories } from "../hooks/useExpenses";
import { useExpenseReport } from "../hooks/useReports";
import SimpleBarChart from "../components/SimpleBarChart";
import { formatMoney } from "../utils/format";

function POSExpenseReportPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [locationId, setLocationId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({});

  const locationsQuery = usePOSLocations();
  const categoriesQuery = useExpenseCategories();
  const reportQuery = useExpenseReport(appliedFilters);

  const handleApply = () => {
    setAppliedFilters({
      ...(locationId ? { location: locationId } : {}),
      ...(categoryId ? { category: categoryId } : {}),
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {}),
    });
  };

  const categories = reportQuery.data?.categories ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-bold text-[#221F35]">Expense Report</h1>

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
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Category</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              {(categoriesQuery.data ?? []).filter((c) => c.parent === null).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
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

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-center text-[15px] font-semibold text-[#221F35]">
          Expense Report
        </h3>
        {reportQuery.isLoading ? (
          <p className="py-10 text-center text-[13px] text-[#A8A2C9]">Loading…</p>
        ) : (
          <SimpleBarChart
            data={categories.map((c) => ({ label: c.name, value: c.total }))}
            currencySymbol={sym}
          />
        )}
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#EDEBFA] text-[#726C8C]">
                <th className="py-2 pr-4 font-medium">Expense Categories</th>
                <th className="py-2 pr-4 text-right font-medium">Total Expense</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-6 text-center text-[#A8A2C9]">
                    No expenses in this range.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.category_id ?? "uncategorized"} className="border-b border-[#F5F4FA]">
                    <td className="py-2.5 pr-4 text-[#221F35]">{c.name}</td>
                    <td className="py-2.5 pr-4 text-right text-[#221F35]">
                      {formatMoney(c.total, sym)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {categories.length > 0 && (
              <tfoot>
                <tr className="font-semibold text-[#221F35]">
                  <td className="py-2.5 pr-4">Total</td>
                  <td className="py-2.5 pr-4 text-right">
                    {formatMoney(reportQuery.data?.grand_total ?? 0, sym)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

export default POSExpenseReportPage;
