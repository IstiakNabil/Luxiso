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
  listAdminTypes,
  createType,
  updateType,
  deleteType,
} from "../services/media.service";
import { listCategories } from "../services/catalog.service";
import type { AdminTypeDetail } from "../types/commerce";

function AdminTypes() {
  const queryClient = useQueryClient();
  const queryKey = ["admin", "types-manage"];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: listAdminTypes,
  });

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: listCategories,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    // The product form's Type dropdown reads these.
    queryClient.invalidateQueries({
      queryKey: ["admin", "types"],
    });
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<AdminTypeDetail | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [logo, setLogo] = useState<File | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<
    number[]
  >([]);

  const create = useMutation({
    mutationFn: createType,
    onSuccess: () => {
      invalidate();
      toast.success("Type created.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't create type."),
      ),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Parameters<typeof updateType>[1];
    }) => updateType(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Type updated.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update type."),
      ),
  });

  const del = useMutation({
    mutationFn: deleteType,
    onSuccess: () => {
      invalidate();
      toast.success("Type deleted.");
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't delete type."),
      ),
  });

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setIsActive(true);
    setLogo(null);
    setSelectedCategories([]);
    setModalOpen(true);
  };

  const openEdit = (t: AdminTypeDetail) => {
    setEditing(t);
    setName(t.name);
    setDescription(t.description ?? "");
    setIsActive(t.is_active);
    setLogo(null);
    setSelectedCategories(t.categories ?? []);
    setModalOpen(true);
  };

  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id],
    );
  };

  const submit = () => {
    if (!name.trim()) {
      toast.error("Type name is required.");
      return;
    }
    const payload = {
      name: name.trim(),
      description,
      is_active: isActive,
      logo,
      categories: selectedCategories,
    };
    if (editing) {
      update.mutate({ id: editing.id, payload });
    } else {
      create.mutate(payload);
    }
  };

  const categoryName = (id: number) =>
    categories?.find((c) => c.id === id)?.name ?? `#${id}`;

  const columns: Column<AdminTypeDetail>[] = [
    {
      header: "Logo",
      cell: (t) =>
        t.logo_url ? (
          <img
            src={t.logo_url}
            alt={t.name}
            className="h-9 w-9 rounded-md object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#F0E9DA] text-[12px] font-bold text-[#A88548]">
            {t.name[0]?.toUpperCase()}
          </span>
        ),
    },
    {
      header: "Name",
      cell: (t) => (
        <div>
          <p className="font-medium text-[#3A1620]">
            {t.name}
          </p>
          <p className="text-[12px] text-[#B08C7A]">
            {t.slug}
          </p>
        </div>
      ),
    },
    {
      header: "Categories",
      cell: (t) =>
        !t.categories || t.categories.length === 0 ? (
          <span className="text-[12px] text-[#B08C7A]">
            All categories
          </span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {t.categories.map((id) => (
              <span
                key={id}
                className="rounded-full bg-[#F0E9DA] px-2 py-0.5 text-[11px] text-[#8A6A2E]"
              >
                {categoryName(id)}
              </span>
            ))}
          </div>
        ),
    },
    {
      header: "Products",
      cell: (t) => (
        <span className="text-[#6B5E48]">
          {t.product_count}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (t) => (
        <StatusBadge
          status={t.is_active ? "Active" : "Inactive"}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (t) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            aria-label="Edit"
            onClick={() => openEdit(t)}
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F0E9DA]"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => {
              if (confirm(`Delete "${t.name}"?`))
                del.mutate(t.id);
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
        title="Types"
        subtitle="Manage the clothing/accessory types available for your products"
        action={
          <AdminButton onClick={openCreate}>
            <Plus size={16} /> Add Type
          </AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(t) => t.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No types yet. Add your first type."
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Type" : "Add Type"}
        onClose={() => setModalOpen(false)}
      >
        <AdminField
          label="Type Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Kurti, Saree, Jeans"
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
            className="w-full text-[13px] text-[#6B5E48] file:mr-3 file:rounded-md file:border-0 file:bg-[#F0E9DA] file:px-3 file:py-2 file:text-[13px] file:text-[#8A6A2E]"
          />
        </label>

        <div className="mb-4">
          <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
            Categories
          </span>
          <p className="mb-2 text-[12px] text-[#B08C7A]">
            Which categories this type shows up under in the
            Shop All filter. Leave all unchecked to show it
            under every category.
          </p>
          <div className="flex flex-wrap gap-2 rounded-lg border border-[#DDD3C0] bg-white p-3">
            {(categories ?? []).length === 0 && (
              <span className="text-[13px] text-[#B08C7A]">
                No categories yet.
              </span>
            )}
            {(categories ?? []).map((c) => {
              const checked = selectedCategories.includes(
                c.id,
              );
              return (
                <label
                  key={c.id}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition ${
                    checked
                      ? "border-[#A88548] bg-[#F0E9DA] text-[#8A6A2E]"
                      : "border-[#DDD3C0] text-[#6B5E48]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(c.id)}
                    className="h-3.5 w-3.5 accent-[#A88548]"
                  />
                  {c.name}
                </label>
              );
            })}
          </div>
        </div>

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
            {editing ? "Save Changes" : "Add Type"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}

export default AdminTypes;
