import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import {
  useContacts,
  useContactDetail,
  useDeleteContact,
} from "../hooks/useContacts";
import DataTableShell from "../components/DataTableShell";
import ContactFormModal from "../components/ContactFormModal";
import { formatMoney } from "../utils/format";
import type { ContactRow, ContactType } from "../types/pos";

const TYPE_TABS: { value: ContactType | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "customer", label: "Customers" },
  { value: "supplier", label: "Suppliers" },
  { value: "both", label: "Both" },
];

function POSContactsPage() {
  const { me } = usePOSAuth();
  const canDelete =
    me?.has_pos_access && (me.role === "admin" || me.role === "manager");
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ContactType | "">("");
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const listQuery = useContacts(page, search, type);
  const editDetailQuery = useContactDetail(editId);
  const deleteMutation = useDeleteContact();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Contact deleted.");
      setConfirmDeleteId(null);
    } catch (err) {
      // Backend returns a specific 400 when the contact has purchase/sale
      // history — surface that message rather than a generic one.
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#221F35]">Contacts</h1>
          <p className="text-[13px] text-[#726C8C]">Customers and suppliers</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-[#E7E4F3] bg-white p-1">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => {
                setType(tab.value);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition ${
                type === tab.value
                  ? "bg-[#7C6AE8] text-white"
                  : "text-[#726C8C] hover:bg-[#F5F4FA]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] bg-white px-3 py-2 md:w-72">
          <Search size={14} className="text-[#8A84B8]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, phone, code…"
            className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
          />
        </div>
      </div>

      <DataTableShell<ContactRow>
        title="All Contacts"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No contacts yet — click Add to get started."
        columns={[
          { header: "Code", render: (row) => row.contact_code },
          { header: "Name", render: (row) => row.name },
          {
            header: "Type",
            render: (row) => (
              <span className="capitalize text-[#726C8C]">{row.contact_type}</span>
            ),
          },
          { header: "Phone", render: (row) => row.phone || "—" },
          { header: "City", render: (row) => row.city || "—" },
          {
            header: "Sale Due",
            align: "right",
            render: (row) => formatMoney(row.total_sale_due, sym),
          },
          {
            header: "Purchase Due",
            align: "right",
            render: (row) => formatMoney(row.total_purchase_due, sym),
          },
          {
            header: "Status",
            render: (row) => (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  row.is_active
                    ? "bg-[#E6F7EC] text-[#2E9E5B]"
                    : "bg-[#F1F0F8] text-[#726C8C]"
                }`}
              >
                {row.is_active ? "Active" : "Inactive"}
              </span>
            ),
          },
          {
            header: "Action",
            render: (row) => (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditId(row.id)}
                  className="flex items-center gap-1 rounded-md border border-[#E7E4F3] px-2.5 py-1 text-[12px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
                >
                  <Pencil size={12} /> Edit
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(row.id)}
                    className="flex items-center gap-1 rounded-md border border-[#F3DCDC] px-2.5 py-1 text-[12px] font-medium text-[#C24F4F] hover:bg-[#FBE9E9]"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />

      {addOpen && <ContactFormModal mode="add" onClose={() => setAddOpen(false)} />}

      {editId !== null && editDetailQuery.data && (
        <ContactFormModal
          mode="edit"
          contact={editDetailQuery.data}
          onClose={() => setEditId(null)}
        />
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-semibold text-[#221F35]">
              Delete this contact?
            </h3>
            <p className="mt-1 text-[13px] text-[#726C8C]">
              This can't be undone. Contacts with purchase or sale history can't be
              deleted — set them Inactive instead.
            </p>
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

export default POSContactsPage;
