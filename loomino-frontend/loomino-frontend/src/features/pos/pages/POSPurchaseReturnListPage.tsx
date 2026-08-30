import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

import { usePOSLocations } from "../hooks/useDashboard";
import { usePurchaseReturns } from "../hooks/usePurchases";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { getPurchaseReturns } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney } from "../utils/format";
import type { PurchaseReturnRow } from "../types/pos";

function POSPurchaseReturnListPage() {
  const { me } = usePOSAuth();
  const canAdd = me?.has_pos_access && me.permissions.can_manage_purchases;
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
  const listQuery = usePurchaseReturns(page, filters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold text-[#221F35]">Purchase Return</h1>
        {canAdd && (
          <Link
            to="/admin/pos/purchases/returns/add"
            className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
          >
            <Plus size={16} /> Add
          </Link>
        )}
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
              onChange={(e) => {
                setLocationId(e.target.value === "" ? "" : Number(e.target.value));
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              {locationsQuery.data?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Date From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Date To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
        </div>
      </div>

      <DataTableShell<PurchaseReturnRow>
        title="All Purchase Returns"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No purchase returns yet."
        filenameBase="purchase-returns"
        fetchAll={() => fetchAllPages((p) => getPurchaseReturns(p, filters))}
        columns={[
          { header: "Date", render: (row) => row.return_date },
          { header: "Reference No", render: (row) => row.reference_no },
          { header: "Parent Purchase", render: (row) => row.parent_purchase_reference },
          { header: "Location", render: (row) => row.location_name },
          { header: "Supplier", render: (row) => row.supplier_name },
          {
            header: "Payment Status",
            render: (row) => row.payment_status_display,
          },
          { header: "Grand Total", align: "right", render: (row) => formatMoney(row.total, sym) },
          { header: "Payment Due", align: "right", render: (row) => formatMoney(row.due_amount, sym) },
        ]}
      />
    </div>
  );
}

export default POSPurchaseReturnListPage;
