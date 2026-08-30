import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useSales, useDeleteSale } from "../hooks/useSales";
import { getSales } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "./DataTableShell";
import { formatMoney } from "../utils/format";
import type { SaleListRow, SaleFilters, SaleStatusValue, PaymentStatusValue } from "../types/pos";

interface SalesTableProps {
  /** Locks the list (and new records) to one status -- undefined shows every status (All Sales). */
  fixedStatus?: SaleStatusValue;
  title: string;
  subtitle: string;
  addPath: string;
}

const STATUS_COLORS: Record<string, string> = {
  final: "bg-[#E6F7EC] text-[#2E9E5B]",
  draft: "bg-[#F1F0F8] text-[#726C8C]",
  quotation: "bg-[#FDF1DC] text-[#B8791F]",
  suspended: "bg-[#FBE9E9] text-[#C24F4F]",
  due: "bg-[#FBE9E9] text-[#C24F4F]",
  partial: "bg-[#FDF1DC] text-[#B8791F]",
  paid: "bg-[#E6F7EC] text-[#2E9E5B]",
};

function StatusPill({ value, label }: { value: string; label: string }) {
  const cls = STATUS_COLORS[value] ?? "bg-[#F1F0F8] text-[#726C8C]";
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>;
}

function SalesTable({ fixedStatus, title, subtitle, addPath }: SalesTableProps) {
  const { me } = usePOSAuth();
  const canAdd = me?.has_pos_access && me.permissions.can_sell;
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const locationsQuery = usePOSLocations();
  const deleteMutation = useDeleteSale();

  const filters: SaleFilters = {
    ...(fixedStatus ? { status: fixedStatus } : {}),
    ...(search ? { search } : {}),
    ...(locationId ? { location: locationId } : {}),
    ...(paymentStatus ? { payment_status: paymentStatus } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };

  const listQuery = useSales(page, filters);

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Deleted.");
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#221F35]">{title}</h1>
          <p className="text-[13px] text-[#726C8C]">{subtitle}</p>
        </div>
        {canAdd && (
          <Link
            to={addPath}
            className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
          >
            <Plus size={16} /> Add
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">
              Business Location
            </span>
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
          {!fixedStatus && (
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">
                Payment Status
              </span>
              <select
                value={paymentStatus}
                onChange={(e) => { setPaymentStatus(e.target.value as PaymentStatusValue | ""); setPage(1); }}
                className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
              >
                <option value="">All</option>
                <option value="due">Due</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </label>
          )}
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
          placeholder="Search invoice no…"
          className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
        />
      </div>

      <DataTableShell<SaleListRow>
        title={title}
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel={`No ${title.toLowerCase()} yet — click Add to get started.`}
        filenameBase={title.toLowerCase().replace(/\s+/g, "-")}
        fetchAll={() => fetchAllPages((p) => getSales(p, filters))}
        columns={[
          { header: "Date", render: (row) => new Date(row.sale_date).toLocaleString() },
          { header: "Invoice No.", render: (row) => row.invoice_no },
          { header: "Customer", render: (row) => row.customer_name },
          { header: "Contact Number", render: (row) => row.customer_phone || "—" },
          { header: "Location", render: (row) => row.location_name },
          {
            header: "Payment Status",
            render: (row) => <StatusPill value={row.payment_status} label={row.payment_status_display} />,
            exportValue: (row) => row.payment_status_display,
          },
          {
            header: "Shipping Status",
            render: (row) => row.shipping_status ? <StatusPill value={row.shipping_status} label={row.shipping_status_display} /> : "—",
            exportValue: (row) => row.shipping_status_display || "—",
          },
          { header: "Total Amount", align: "right", render: (row) => formatMoney(row.total, sym) },
          { header: "Sell Due", align: "right", render: (row) => formatMoney(row.due_amount, sym) },
          { header: "Total Items", align: "right", render: (row) => row.total_quantity },
          { header: "Added By", render: (row) => row.added_by || "—" },
          {
            header: "Action",
            exportable: false,
            render: (row) => (
              row.status !== "final" ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(row.id)}
                  className="flex items-center gap-1 rounded-md border border-[#F3DCDC] px-2.5 py-1 text-[12px] font-medium text-[#C24F4F] hover:bg-[#FBE9E9]"
                >
                  <Trash2 size={12} /> Delete
                </button>
              ) : (
                <span className="text-[12px] text-[#A8A2C9]">—</span>
              )
            ),
          },
        ]}
      />

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-semibold text-[#221F35]">Delete this record?</h3>
            <p className="mt-1 text-[13px] text-[#726C8C]">This can't be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-[#E7E4F3] px-4 py-2 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-[#C24F4F] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#B03F3F] disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesTable;
