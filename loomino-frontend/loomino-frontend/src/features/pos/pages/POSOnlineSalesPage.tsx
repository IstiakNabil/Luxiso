import { useState } from "react";
import { Search } from "lucide-react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { useOnlineSales } from "../hooks/useOnlineReports";
import { getOnlineSales } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney } from "../utils/format";
import type { OnlineSaleRow } from "../types/pos";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function POSOnlineSalesPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = {
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };
  const listQuery = useOnlineSales(page, filters);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Online Sales</h1>
        <p className="text-[13px] text-[#726C8C]">
          Read-only — orders placed on the website. Separate from the POS's own Sell records.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Status</span>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Date From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Date To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] bg-white px-3 py-2 md:w-72">
        <Search size={14} className="text-[#8A84B8]" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search order number…"
          className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
        />
      </div>

      <DataTableShell<OnlineSaleRow>
        title="Online Orders"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No matching orders."
        filenameBase="online-sales"
        fetchAll={() => fetchAllPages((p) => getOnlineSales(p, filters))}
        columns={[
          { header: "Date", render: (row) => new Date(row.created_at).toLocaleString() },
          { header: "Order No.", render: (row) => row.order_number },
          { header: "Customer", render: (row) => row.customer_name },
          { header: "Status", render: (row) => row.status_display },
          { header: "Items", align: "right", render: (row) => String(row.item_count) },
          { header: "Payment Method", render: (row) => row.payment_method },
          { header: "Payment Status", render: (row) => row.payment_status },
          { header: "Total", align: "right", render: (row) => formatMoney(row.total, sym) },
        ]}
      />
    </div>
  );
}

export default POSOnlineSalesPage;
