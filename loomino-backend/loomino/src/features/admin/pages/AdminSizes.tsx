import { useState } from "react";
import { Ruler, Plus, Pencil, Trash2 } from "lucide-react";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, {
  type Column,
} from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import AdminButton from "../components/AdminButton";
import AdminField from "../components/AdminField";
import { useCrud } from "../hooks/useCrud";
import {
  listSizes,
  createSize,
  updateSize,
  deleteSize,
} from "../services/catalog.service";
import type { AdminSize } from "../types/catalog";

function AdminSizes() {
  const {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useCrud<AdminSize, Partial<AdminSize>>(
    "sizes",
    {
      list: listSizes,
      create: createSize,
      update: updateSize,
      remove: deleteSize,
    },
    "Size",
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSize | null>(
    null,
  );
  const [name, setName] = useState("");
  const [order, setOrder] = useState("0");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setOrder("0");
    setModalOpen(true);
  };

  const openEdit = (size: AdminSize) => {
    setEditing(size);
    setName(size.name);
    setOrder(String(size.display_order));
    setModalOpen(true);
  };

  const submit = () => {
    const payload = {
      name,
      display_order: Number(order) || 0,
      is_active: true,
    };
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload },
        { onSuccess: () => setModalOpen(false) },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setModalOpen(false),
      });
    }
  };

  const columns: Column<AdminSize>[] = [
    {
      header: "Size Label",
      cell: (s) => (
        <span className="font-medium text-[#2C2418]">
          {s.name}
        </span>
      ),
    },
    {
      header: "Order",
      cell: (s) => (
        <span className="text-[#8A7C64]">
          {s.display_order}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (s) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => openEdit(s)}
            aria-label="Edit"
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F0E9DA]"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${s.name}"?`))
                deleteMutation.mutate(s.id);
            }}
            aria-label="Delete"
            className="rounded-md p-2 text-[#9A3B3B] hover:bg-[#F7ECEC]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="font-loomino">
      <AdminPageHeader
        icon={<Ruler size={20} />}
        title="Product Sizes"
        subtitle="Manage size variants available for your products"
        action={
          <AdminButton onClick={openCreate}>
            <Plus size={16} /> Add Size
          </AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        rows={query.data ?? []}
        keyField={(s) => s.id}
        isLoading={query.isLoading}
        isError={query.isError}
        emptyMessage="No sizes yet. Add your first size."
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Size" : "Add Size"}
        onClose={() => setModalOpen(false)}
      >
        <AdminField
          label="Size Label"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. XL"
        />
        <AdminField
          label="Display Order"
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        />

        <div className="mt-6 flex justify-end gap-3">
          <AdminButton
            variant="outline"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </AdminButton>
          <AdminButton
            onClick={submit}
            disabled={
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {editing ? "Save Changes" : "Add Size"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}

export default AdminSizes;
