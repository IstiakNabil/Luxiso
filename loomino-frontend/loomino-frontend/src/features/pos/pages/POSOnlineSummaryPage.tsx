import { Package, ShoppingBag, AlertTriangle, RotateCcw } from "lucide-react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { useOnlineSummary } from "../hooks/useOnlineReports";
import StatCard from "../components/StatCard";
import { formatMoney } from "../utils/format";

function POSOnlineSummaryPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";
  const { data, isLoading } = useOnlineSummary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Online Overview</h1>
        <p className="text-[13px] text-[#726C8C]">
          Read-only figures from your website — a separate stock pool and revenue stream
          from the POS, shown side by side rather than merged.
        </p>
      </div>

      {/* Stock */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          label="Total Stock Units (Online)"
          value={isLoading ? "…" : (data?.stock.total_units ?? 0)}
          icon={<Package size={20} />}
        />
        <StatCard
          label="Active Products (Online)"
          value={isLoading ? "…" : (data?.stock.active_products ?? 0)}
          icon={<ShoppingBag size={20} />}
          accent="#3DBE7A"
        />
        <StatCard
          label="Out of Stock Variants"
          value={isLoading ? "…" : (data?.stock.out_of_stock_variants ?? 0)}
          icon={<AlertTriangle size={20} />}
          accent="#E8A23D"
        />
      </div>

      {/* Sales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(["today", "this_week", "this_month"] as const).map((key) => (
          <div key={key} className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
            <p className="text-[13px] text-[#726C8C] capitalize">
              {key === "this_week" ? "This Week" : key === "this_month" ? "This Month" : "Today"}
            </p>
            <p className="mt-2 text-[22px] font-bold text-[#221F35]">
              {isLoading ? "…" : formatMoney(data?.sales[key].total ?? 0, sym)}
            </p>
            <p className="text-[12px] text-[#A8A2C9]">
              {isLoading ? "" : `${data?.sales[key].orders ?? 0} orders (excludes cancelled)`}
            </p>
          </div>
        ))}
      </div>

      {/* Payment breakdown */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-1 text-[14px] font-semibold text-[#221F35]">
          Online Payment Report
        </h3>
        <p className="mb-4 text-[12px] text-[#A8A2C9]">
          Per-channel breakdown (bKash, Nagad, Card) will appear here once that payment
          method data is captured at checkout — for now this shows the two methods
          currently in use.
        </p>
        {isLoading ? (
          <p className="text-[13px] text-[#A8A2C9]">Loading…</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#F5F4FA]">
            {data?.payment_breakdown.map((row) => (
              <div key={row.method} className="flex items-center justify-between py-3 text-[13px]">
                <span className="font-medium text-[#221F35]">{row.method_display}</span>
                <div className="flex gap-6 text-right">
                  <span>
                    <span className="text-[#A8A2C9]">Received: </span>
                    <span className="font-medium text-[#2E9E5B]">
                      {formatMoney(row.paid_total, sym)}
                    </span>
                    <span className="ml-1 text-[11px] text-[#A8A2C9]">({row.paid_count})</span>
                  </span>
                  <span>
                    <span className="text-[#A8A2C9]">Pending: </span>
                    <span className="font-medium text-[#B8791F]">
                      {formatMoney(row.pending_total, sym)}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="flex items-center gap-2">
          <RotateCcw size={16} className="text-[#C24F4F]" />
          <span className="text-[13px] font-medium text-[#221F35]">
            Returned / Cancelled Orders: {isLoading ? "…" : data?.returned_or_cancelled_orders}
          </span>
        </div>
      </div>
    </div>
  );
}

export default POSOnlineSummaryPage;
