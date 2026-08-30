import { useState } from "react";
import { Palette, Plus, Pencil, Trash2 } from "lucide-react";

import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, {
  type Column,
} from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import AdminButton from "../components/AdminButton";
import AdminField from "../components/AdminField";
import { useCrud } from "../hooks/useCrud";
import {
  listColors,
  createColor,
  updateColor,
  deleteColor,
} from "../services/catalog.service";
import type { AdminColor } from "../types/catalog";

function AdminColors() {
  const {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useCrud<AdminColor, Partial<AdminColor>>(
    "colors",
    {
      list: listColors,
      create: createColor,
      update: updateColor,
      remove: deleteColor,
    },
    "Color",
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<AdminColor | null>(null);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setHex("#000000");
    setModalOpen(true);
  };

  const openEdit = (color: AdminColor) => {
    setEditing(color);
    setName(color.name);
    setHex(color.hex_code);
    setModalOpen(true);
  };

  const submit = () => {
    const payload = { name, hex_code: hex, is_active: true };
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

  const columns: Column<AdminColor>[] = [
    {
      header: "Preview",
      cell: (c) => (
        <span
          className="inline-block h-6 w-6 rounded-full border border-[#E0D8C6]"
          style={{ backgroundColor: c.hex_code }}
        />
      ),
    },
    {
      header: "Color Name",
      cell: (c) => (
        <span className="font-medium text-[#2C2418]">
          {c.name}
        </span>
      ),
    },
    {
      header: "Hex Code",
      cell: (c) => (
        <span className="font-mono text-[13px] text-[#8A7C64]">
          {c.hex_code}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => openEdit(c)}
            aria-label="Edit"
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F0E9DA]"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${c.name}"?`))
                deleteMutation.mutate(c.id);
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
        icon={<Palette size={20} />}
        title="Product Colors"
        subtitle="Manage color variants available for your products"
        action={
          <AdminButton onClick={openCreate}>
            <Plus size={16} /> Add Color
          </AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        rows={query.data ?? []}
        keyField={(c) => c.id}
        isLoading={query.isLoading}
        isError={query.isError}
        emptyMessage="No colors yet. Add your first color."
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Color" : "Add Color"}
        onClose={() => setModalOpen(false)}
      >
        <AdminField
          label="Color Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Golden Yellow"
        />

        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
            Hex Code
          </span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="h-[42px] w-[52px] cursor-pointer rounded-lg border border-[#DDD3C0]"
            />
            <input
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="h-[42px] flex-1 rounded-lg border border-[#DDD3C0] px-3 font-mono text-[14px] outline-none focus:border-[#A88548]"
            />
          </div>
        </label>

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
            {editing ? "Save Changes" : "Add Color"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}

export default AdminColors;
