import { useState } from "react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useContacts } from "../hooks/useContacts";
import { useSalePaymentReport } from "../hooks/useReports";
import { getSalePaymentReport } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney } from "../utils/format";
import type { SalePaymentReportRow, ReportFilters, PaymentMethodValue } from "../types/pos";

const PAYMENT_METHODS: { value: PaymentMethodValue | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "cheque", label: "Cheque" },
  { value: "other", label: "Other" },
];

function POSSellPaymentReportPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [customerId, setCustomerId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodValue | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const customersQuery = useContacts("customer", 1, "", undefined);
  const locationsQuery = usePOSLocations();

  const filters: ReportFilters = {
    ...(customerId ? { customer: customerId } : {}),
    ...(locationId ? { location: locationId } : {}),
    ...(paymentMethod ? { payment_method: paymentMethod } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };
  const listQuery = useSalePaymentReport(page, filters);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-bold text-[#221F35]">Sell Payment Report</h1>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Customer</span>
            <select
              value={customerId}
              onChange={(e) => { setCustomerId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
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
              <option value="">All</option>
              {locationsQuery.data?.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Payment Method</span>
            <select
              value={paymentMethod}
              onChange={(e) => { setPaymentMethod(e.target.value as PaymentMethodValue | ""); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
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

      <DataTableShell<SalePaymentReportRow>
        title="Sell Payments"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No sell payments in this range."
        filenameBase="sell-payment-report"
        fetchAll={() => fetchAllPages((p) => getSalePaymentReport(p, filters))}
        columns={[
          { header: "Reference No", render: (row) => row.reference_no },
          { header: "Paid on", render: (row) => new Date(row.paid_on).toLocaleString() },
          { header: "Amount", align: "right", render: (row) => formatMoney(row.amount, sym) },
          { header: "Customer", render: (row) => row.customer_name },
          { header: "Customer Group", render: (row) => row.customer_group_name || "—" },
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
          { header: "Sell", render: (row) => row.sale_invoice_no },
        ]}
      />
    </div>
  );
}

export default POSSellPaymentReportPage;
