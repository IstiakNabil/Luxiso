import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { useStaffList, useStaffDetail, useDeleteStaff } from "../hooks/useUserManagement";
import { getStaffList } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import RoleBadge from "../components/RoleBadge";
import StaffFormModal from "../components/StaffFormModal";
import type { POSStaffRow } from "../types/pos";

function POSUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const listQuery = useStaffList(page, search);
  const editDetailQuery = useStaffDetail(editId);
  const deleteMutation = useDeleteStaff();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Removed from POS.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#221F35]">Users</h1>
          <p className="text-[13px] text-[#726C8C]">Manage POS staff</p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] bg-white px-3 py-2 md:w-80">
        <Search size={14} className="text-[#8A84B8]" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name or email…"
          className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
        />
      </div>

      <DataTableShell<POSStaffRow>
        title="All Users"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No POS staff yet — click Add to get started."
        filenameBase="pos-users"
        fetchAll={() => fetchAllPages((p) => getStaffList(p, search))}
        columns={[
          { header: "Username", render: (row) => row.username },
          { header: "Name", render: (row) => row.name || "—" },
          {
            header: "Role",
            render: (row) => <RoleBadge role={row.role} label={row.role_display} />,
            exportValue: (row) => row.role_display,
          },
          { header: "Email", render: (row) => row.email },
          {
            header: "Locations",
            render: (row) =>
              row.locations.length > 0
                ? row.locations.map((l) => l.name).join(", ")
                : "—",
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
            exportValue: (row) => (row.is_active ? "Active" : "Inactive"),
          },
          {
            header: "Action",
            exportable: false,
            render: (row) => (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditId(row.id)}
                  className="flex items-center gap-1 rounded-md border border-[#E7E4F3] px-2.5 py-1 text-[12px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(row.id)}
                  className="flex items-center gap-1 rounded-md border border-[#F3DCDC] px-2.5 py-1 text-[12px] font-medium text-[#C24F4F] hover:bg-[#FBE9E9]"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            ),
          },
        ]}
      />

      {addOpen && <StaffFormModal mode="add" onClose={() => setAddOpen(false)} />}

      {editId !== null && editDetailQuery.data && (
        <StaffFormModal
          mode="edit"
          staff={editDetailQuery.data}
          onClose={() => setEditId(null)}
        />
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-semibold text-[#221F35]">Remove this user?</h3>
            <p className="mt-1 text-[13px] text-[#726C8C]">
              They'll lose POS access immediately. Their e-commerce account, if any, is
              untouched.
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
                {deleteMutation.isPending ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default POSUsersPage;
