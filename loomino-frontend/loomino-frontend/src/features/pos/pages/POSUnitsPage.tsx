import { useState } from "react";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Info } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { useUnits, useDeleteUnit } from "../hooks/useUnits";
import { getUnits } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import UnitFormModal from "../components/UnitFormModal";
import type { Unit } from "../types/pos";

function POSUnitsPage() {
  const { me } = usePOSAuth();
  const canEdit = me?.has_pos_access && me.permissions.can_edit_products;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editUnit, setEditUnit] = useState<Unit | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const listQuery = useUnits(page, search);
  const deleteMutation = useDeleteUnit();

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Unit deleted.");
      setConfirmDeleteId(null);
    } catch (err) {
      // Backend returns a specific message when a product still uses this unit.
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#221F35]">Units</h1>
          <p className="text-[13px] text-[#726C8C]">Manage your units</p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
          >
            <Plus size={16} /> Add
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] bg-white px-3 py-2 md:w-72">
        <Search size={14} className="text-[#8A84B8]" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search units…"
          className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
        />
      </div>

      <DataTableShell<Unit>
        title="All your units"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No units yet — click Add to get started."
        filenameBase="units"
        fetchAll={() => fetchAllPages((p) => getUnits(p, search || undefined))}
        columns={[
          { header: "Name", render: (row) => row.name },
          { header: "Short name", render: (row) => row.short_name },
          {
            header: "Allow decimal",
            render: (row) => (row.allow_decimal ? "Yes" : "No"),
          },
          {
            header: "Action",
            exportable: false,
            render: (row) =>
              canEdit ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditUnit(row)}
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
              ) : (
                <span className="flex items-center gap-1 text-[12px] text-[#A8A2C9]">
                  <Info size={12} /> View only
                </span>
              ),
          },
        ]}
      />

      {addOpen && <UnitFormModal mode="add" onClose={() => setAddOpen(false)} />}

      {editUnit && (
        <UnitFormModal mode="edit" unit={editUnit} onClose={() => setEditUnit(null)} />
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-semibold text-[#221F35]">Delete this unit?</h3>
            <p className="mt-1 text-[13px] text-[#726C8C]">
              Units used by any product can't be deleted — reassign those products first.
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

export default POSUnitsPage;
