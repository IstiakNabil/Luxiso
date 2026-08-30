import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { usePurchases } from "../hooks/usePurchases";
import { useContacts } from "../hooks/useContacts";
import { getPurchases } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney } from "../utils/format";
import type { PurchaseListRow, PurchaseFilters, PurchaseStatusValue, PaymentStatusValue } from "../types/pos";

const STATUS_OPTIONS: { value: PurchaseStatusValue | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "ordered", label: "Ordered" },
  { value: "partial", label: "Partial" },
  { value: "received", label: "Received" },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatusValue | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "due", label: "Due" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

function POSPurchaseListPage() {
  const { me } = usePOSAuth();
  const canAdd = me?.has_pos_access && me.permissions.can_manage_purchases;
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [supplierId, setSupplierId] = useState<number | "">("");
  const [status, setStatus] = useState<PurchaseStatusValue | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const locationsQuery = usePOSLocations();
  const suppliersQuery = useContacts("supplier", 1, "", undefined);

  const filters: PurchaseFilters = {
    ...(search ? { search } : {}),
    ...(locationId ? { location: locationId } : {}),
    ...(supplierId ? { supplier: supplierId } : {}),
    ...(status ? { status } : {}),
    ...(paymentStatus ? { payment_status: paymentStatus } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };

  const listQuery = usePurchases(page, filters);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold text-[#221F35]">Purchases</h1>
        {canAdd && (
          <Link
            to="/admin/pos/purchases/add"
            className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
          >
            <Plus size={16} /> Add
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <FilterSelect
            label="Business Location"
            value={locationId}
            onChange={(v) => { setLocationId(v === "" ? "" : Number(v)); setPage(1); }}
            options={[{ value: "", label: "All" }, ...(locationsQuery.data?.map((l) => ({ value: l.id, label: l.name })) ?? [])]}
          />
          <FilterSelect
            label="Supplier"
            value={supplierId}
            onChange={(v) => { setSupplierId(v === "" ? "" : Number(v)); setPage(1); }}
            options={[{ value: "", label: "All" }, ...(suppliersQuery.data?.results.map((s) => ({ value: s.id, label: s.name })) ?? [])]}
          />
          <FilterSelect
            label="Purchase Status"
            value={status}
            onChange={(v) => { setStatus(v as PurchaseStatusValue | ""); setPage(1); }}
            options={STATUS_OPTIONS}
          />
          <FilterSelect
            label="Payment Status"
            value={paymentStatus}
            onChange={(v) => { setPaymentStatus(v as PaymentStatusValue | ""); setPage(1); }}
            options={PAYMENT_STATUS_OPTIONS}
          />
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
          placeholder="Search reference no…"
          className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
        />
      </div>

      <DataTableShell<PurchaseListRow>
        title="All Purchases"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No purchases yet — click Add to get started."
        filenameBase="purchases"
        fetchAll={() => fetchAllPages((p) => getPurchases(p, filters))}
        columns={[
          { header: "Date", render: (row) => new Date(row.purchase_date).toLocaleString() },
          { header: "Reference No", render: (row) => row.reference_no },
          { header: "Location", render: (row) => row.location_name },
          { header: "Supplier", render: (row) => row.supplier_name },
          {
            header: "Purchase Status",
            render: (row) => <StatusPill value={row.status} label={row.status_display} />,
            exportValue: (row) => row.status_display,
          },
          {
            header: "Payment Status",
            render: (row) => <StatusPill value={row.payment_status} label={row.payment_status_display} />,
            exportValue: (row) => row.payment_status_display,
          },
          { header: "Grand Total", align: "right", render: (row) => formatMoney(row.total, sym) },
          { header: "Payment Due", align: "right", render: (row) => formatMoney(row.due_amount, sym) },
          { header: "Added By", render: (row) => row.added_by || "—" },
        ]}
      />
    </div>
  );
}

const STATUS_COLORS: Record<string, string> = {
  received: "bg-[#E6F7EC] text-[#2E9E5B]",
  pending: "bg-[#FDF1DC] text-[#B8791F]",
  ordered: "bg-[#EAF0FE] text-[#3E6FDB]",
  partial: "bg-[#FDF1DC] text-[#B8791F]",
  due: "bg-[#FBE9E9] text-[#C24F4F]",
  paid: "bg-[#E6F7EC] text-[#2E9E5B]",
};

function StatusPill({ value, label }: { value: string; label: string }) {
  const cls = STATUS_COLORS[value] ?? "bg-[#F1F0F8] text-[#726C8C]";
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  options: { value: number | string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default POSPurchaseListPage;
