import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { useSizes, useDeleteSize } from "../hooks/useProducts";
import { getSizes } from "../services/pos.service";
import DataTableShell from "../components/DataTableShell";
import SizeFormModal from "../components/SizeFormModal";
import type { SizeOption, Paginated } from "../types/pos";

const PAGE_SIZE = 25;

function POSSizesPage() {
  const sizesQuery = useSizes();
  const deleteMutation = useDeleteSize();

  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editSize, setEditSize] = useState<SizeOption | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const paged: Paginated<SizeOption> = useMemo(() => {
    const all = sizesQuery.data ?? [];
    const start = (page - 1) * PAGE_SIZE;
    const results = all.slice(start, start + PAGE_SIZE);
    return {
      count: all.length,
      next: start + PAGE_SIZE < all.length ? "next" : null,
      previous: page > 1 ? "prev" : null,
      results,
    };
  }, [sizesQuery.data, page]);

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Size deleted.");
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#221F35]">Sizes</h1>
          <p className="text-[13px] text-[#726C8C]">
            Manage the sizes available for product variants, shared with the storefront.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <DataTableShell<SizeOption>
        title="All Sizes"
        data={paged}
        isLoading={sizesQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No sizes yet — click Add to get started."
        filenameBase="sizes"
        fetchAll={async () => (await getSizes()) as SizeOption[]}
        columns={[
          { header: "Name", render: (row) => row.name },
          {
            header: "Action",
            exportable: false,
            render: (row) => (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditSize(row)}
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

      {addOpen && <SizeFormModal mode="add" onClose={() => setAddOpen(false)} />}
      {editSize && (
        <SizeFormModal mode="edit" size={editSize} onClose={() => setEditSize(null)} />
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-semibold text-[#221F35]">Delete this size?</h3>
            <p className="mt-1 text-[13px] text-[#726C8C]">
              A size still used by a variant can't be deleted — you'll see an error if so.
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

export default POSSizesPage;
