import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, {
  type Column,
} from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import AdminButton from "../components/AdminButton";
import AdminField from "../components/AdminField";
import StatusBadge from "../components/StatusBadge";
import {
  listAdminBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../services/media.service";
import type { AdminBrandDetail } from "../types/commerce";

function AdminBrands() {
  const queryClient = useQueryClient();
  const queryKey = ["admin", "brands-manage"];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: listAdminBrands,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    // The product form's brand dropdown reads this.
    queryClient.invalidateQueries({
      queryKey: ["admin", "brands"],
    });
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<AdminBrandDetail | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);

  const create = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      invalidate();
      toast.success("Brand created.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't create brand."),
      ),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updateBrand>[1];
    }) => updateBrand(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Brand updated.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update brand."),
      ),
  });

  const del = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      invalidate();
      toast.success("Brand deleted.");
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't delete brand."),
      ),
  });

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setLogo(null);
    setModalOpen(true);
  };

  const openEdit = (b: AdminBrandDetail) => {
    setEditing(b);
    setName(b.name);
    setDescription(b.description ?? "");
    setIsActive(b.is_active);
    setLogo(null);
    setModalOpen(true);
  };

  const submit = () => {
    if (!name.trim()) {
      toast.error("Brand name is required.");
      return;
    }
    const payload = {
      name: name.trim(),
      description,
      is_active: isActive,
      logo,
    };
    if (editing) {
      update.mutate({ id: editing.id, payload });
    } else {
      create.mutate(payload);
    }
  };

  const columns: Column<AdminBrandDetail>[] = [
    {
      header: "Logo",
      cell: (b) =>
        b.logo_url ? (
          <img
            src={b.logo_url}
            alt={b.name}
            className="h-9 w-9 rounded-md object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F0E9DA] text-[12px] font-bold text-[#A88548]">
            {b.name[0]?.toUpperCase()}
          </span>
        ),
    },
    {
      header: "Name",
      cell: (b) => (
        <div>
          <p className="font-medium text-[#2C2418]">
            {b.name}
          </p>
          <p className="text-[12px] text-[#A89A80]">
            {b.slug}
          </p>
        </div>
      ),
    },
    {
      header: "Products",
      cell: (b) => (
        <span className="text-[#6B5E48]">
          {b.product_count}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (b) => (
        <StatusBadge
          status={b.is_active ? "Active" : "Inactive"}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (b) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            aria-label="Edit"
            onClick={() => openEdit(b)}
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F0E9DA]"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => {
              if (confirm(`Delete "${b.name}"?`))
                del.mutate(b.id);
            }}
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
        icon={<Tag size={20} />}
        title="Brands"
        subtitle="Manage the brands available for your products"
        action={
          <AdminButton onClick={openCreate}>
            <Plus size={16} /> Add Brand
          </AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(b) => b.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No brands yet. Add your first brand."
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Brand" : "Add Brand"}
        onClose={() => setModalOpen(false)}
      >
        <AdminField
          label="Brand Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Loomino"
        />

        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[#DDD3C0] bg-white p-3 text-[14px] outline-none focus:border-[#A88548]"
          />
        </label>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
            Logo {editing && "(leave empty to keep current)"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setLogo(e.target.files?.[0] ?? null)
            }
            className="w-full text-[13px] text-[#6B5E48] file:mr-3 file:rounded-md file:border-0 file:bg-[#F0E9DA] file:px-3 file:py-2 file:text-[13px] file:text-[#4C300D]"
          />
        </label>

        <label className="flex items-center gap-2 text-[13px] text-[#3A2E1B]">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 accent-[#A88548]"
          />
          Active
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
              create.isPending || update.isPending
            }
          >
            {editing ? "Save Changes" : "Add Brand"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}

export default AdminBrands;
