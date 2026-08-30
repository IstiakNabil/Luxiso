import { useState } from "react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useContacts } from "../hooks/useContacts";
import { usePurchasePaymentReport } from "../hooks/useReports";
import { getPurchasePaymentReport } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney } from "../utils/format";
import type { PurchasePaymentReportRow, ReportFilters } from "../types/pos";

function POSPurchasePaymentReportPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [supplierId, setSupplierId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const suppliersQuery = useContacts("supplier", 1, "", undefined);
  const locationsQuery = usePOSLocations();

  const filters: ReportFilters = {
    ...(supplierId ? { supplier: supplierId } : {}),
    ...(locationId ? { location: locationId } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };
  const listQuery = usePurchasePaymentReport(page, filters);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-bold text-[#221F35]">Purchase Payment Report</h1>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Supplier</span>
            <select
              value={supplierId}
              onChange={(e) => { setSupplierId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">Please Select</option>
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

      <DataTableShell<PurchasePaymentReportRow>
        title="Purchase Payments"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No purchase payments in this range."
        filenameBase="purchase-payment-report"
        fetchAll={() => fetchAllPages((p) => getPurchasePaymentReport(p, filters))}
        columns={[
          { header: "Reference No", render: (row) => row.reference_no },
          { header: "Paid on", render: (row) => new Date(row.paid_on).toLocaleString() },
          { header: "Amount", align: "right", render: (row) => formatMoney(row.amount, sym) },
          { header: "Supplier", render: (row) => row.supplier_name },
          {
            header: "Payment Method",
            render: (row) => (
              <>
                {row.payment_method_display}
                {row.payment_reference && (
                  <div className="text-[11px] text-[#A8A2C9]">Ref: {row.payment_reference}</div>
                )}
              </>
            ),
            exportValue: (row) =>
              row.payment_reference
                ? `${row.payment_method_display} (${row.payment_reference})`
                : row.payment_method_display,
          },
          { header: "Purchase", render: (row) => row.purchase_reference_no },
        ]}
      />
    </div>
  );
}

export default POSPurchasePaymentReportPage;
