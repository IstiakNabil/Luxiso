import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useExpenses, useDeleteExpense, useExpenseCategories } from "../hooks/useExpenses";
import { getExpenses } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney } from "../utils/format";
import type { ExpenseListRow, ExpenseFilters, PaymentStatusValue } from "../types/pos";

function POSExpenseListPage() {
  const { me } = usePOSAuth();
  const canAdd = me?.has_pos_access && me.permissions.can_manage_expenses;
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusValue | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const locationsQuery = usePOSLocations();
  const categoriesQuery = useExpenseCategories();
  const deleteMutation = useDeleteExpense();

  const filters: ExpenseFilters = {
    ...(search ? { search } : {}),
    ...(locationId ? { location: locationId } : {}),
    ...(categoryId ? { category: categoryId } : {}),
    ...(paymentStatus ? { payment_status: paymentStatus } : {}),
    ...(dateFrom ? { date_from: dateFrom } : {}),
    ...(dateTo ? { date_to: dateTo } : {}),
  };

  const listQuery = useExpenses(page, filters);

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Expense deleted.");
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold text-[#221F35]">Expenses</h1>
        {canAdd && (
          <Link
            to="/admin/pos/expenses/add"
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
              <option value="">All locations</option>
              {locationsQuery.data?.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">
              Expense Category
            </span>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value === "" ? "" : Number(e.target.value)); setPage(1); }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              {categoriesQuery.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parent_name ? `${c.parent_name} › ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </label>
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

      <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] bg-white px-3 py-2 md:w-72">
        <Search size={14} className="text-[#8A84B8]" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search reference no…"
          className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
        />
      </div>

      <DataTableShell<ExpenseListRow>
        title="All Expenses"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No expenses yet — click Add to get started."
        filenameBase="expenses"
        fetchAll={() => fetchAllPages((p) => getExpenses(p, filters))}
        columns={[
          { header: "Date", render: (row) => new Date(row.expense_date).toLocaleString() },
          { header: "Reference No", render: (row) => row.reference_no },
          { header: "Recurring details", render: (row) => row.recurring_details || "—" },
          {
            header: "Expense Category",
            render: (row) => row.subcategory_name ? `${row.category_name} › ${row.subcategory_name}` : row.category_name,
          },
          { header: "Location", render: (row) => row.location_name },
          {
            header: "Payment status",
            render: (row) => (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  row.payment_status === "paid"
                    ? "bg-[#E6F7EC] text-[#2E9E5B]"
                    : row.payment_status === "partial"
                      ? "bg-[#FDF1DC] text-[#B8791F]"
                      : "bg-[#FBE9E9] text-[#C24F4F]"
                }`}
              >
                {row.payment_status_display}
              </span>
            ),
            exportValue: (row) => row.payment_status_display,
          },
          { header: "Tax", align: "right", render: (row) => formatMoney(row.tax, sym) },
          {
            header: "Total amount",
            align: "right",
            render: (row) => `${row.is_refund ? "(Refund) " : ""}${formatMoney(row.amount, sym)}`,
          },
          { header: "Payment due", align: "right", render: (row) => formatMoney(row.due_amount, sym) },
          { header: "Expense for", render: (row) => row.expense_for || "—" },
          { header: "Contact", render: (row) => row.contact_name || "—" },
          { header: "Expense note", render: (row) => row.note || "—" },
          { header: "Added By", render: (row) => row.added_by || "—" },
          {
            header: "Action",
            exportable: false,
            render: (row) =>
              canAdd ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(row.id)}
                  className="flex items-center gap-1 rounded-md border border-[#F3DCDC] px-2.5 py-1 text-[12px] font-medium text-[#C24F4F] hover:bg-[#FBE9E9]"
                >
                  <Trash2 size={12} /> Delete
                </button>
              ) : (
                <span className="text-[12px] text-[#A8A2C9]">—</span>
              ),
          },
        ]}
      />

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-semibold text-[#221F35]">Delete this expense?</h3>
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

export default POSExpenseListPage;
