import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Trash2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { formatPrice, getMediaUrl } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminModal from "../components/AdminModal";
import AdminButton from "../components/AdminButton";
import VariantForm from "../components/VariantForm";
import {
  listVariants,
  deleteVariant,
  createVariant,
  updateVariant,
} from "../services/commerce.service";
import type {
  AdminVariant,
  VariantPayload,
} from "../types/commerce";

function AdminVariants() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "variants"],
    queryFn: listVariants,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] =
    useState<AdminVariant | null>(null);

  const create = useMutation({
    mutationFn: (payload: VariantPayload) =>
      createVariant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "variants"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products"],
      });
      toast.success("Variant added.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't add variant."),
      ),
  });

  const update = useMutation({
    mutationFn: (payload: Partial<VariantPayload>) =>
      updateVariant(editingVariant!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "variants"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "products"],
      });
      toast.success("Variant updated.");
      setEditingVariant(null);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update variant."),
      ),
  });

  const del = useMutation({
    mutationFn: deleteVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "variants"],
      });
      toast.success("Variant deleted.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't delete.")),
  });

  const variants = data ?? [];

  return (
    <div className="font-loomino">
      <AdminPageHeader
        icon={<Layers size={20} />}
        title="Variant Products"
        subtitle="Manage colors, sizes and stocks for product variants"
        action={
          <AdminButton onClick={() => setModalOpen(true)}>
            <Plus size={16} /> Add Variant
          </AdminButton>
        }
      />

      <AdminModal
        open={modalOpen}
        title="Add Variant"
        onClose={() => setModalOpen(false)}
      >
        <VariantForm
          submitting={create.isPending}
          onCancel={() => setModalOpen(false)}
          onSubmit={(payload) =>
            create.mutate(payload as VariantPayload)
          }
        />
      </AdminModal>

      <AdminModal
        open={editingVariant !== null}
        title="Edit Variant"
        onClose={() => setEditingVariant(null)}
      >
        {editingVariant && (
          <VariantForm
            initial={editingVariant}
            submitting={update.isPending}
            onCancel={() => setEditingVariant(null)}
            onSubmit={(payload) => update.mutate(payload)}
          />
        )}
      </AdminModal>

      {isLoading && (
        <div className="rounded-2xl border border-[#EFE9DE] bg-white px-6 py-10 text-center text-[14px] text-[#A89A80]">
          Loading…
        </div>
      )}
      {isError && (
        <div className="rounded-2xl border border-[#EFE9DE] bg-white px-6 py-10 text-center text-[14px] text-[#9A3B3B]">
          Couldn't load variants.
        </div>
      )}
      {!isLoading && !isError && variants.length === 0 && (
        <div className="rounded-2xl border border-[#EFE9DE] bg-white px-6 py-10 text-center text-[14px] text-[#A89A80]">
          No variants yet.
        </div>
      )}

      <div className="space-y-4">
        {variants.map((v: AdminVariant) => (
          <div
            key={v.id}
            className="overflow-hidden rounded-2xl border border-[#EFE9DE] bg-white"
          >
            <div className="flex items-center gap-4 border-b border-[#F1ECE2] px-6 py-4">
              {v.product.thumbnail ? (
                <img
                  src={getMediaUrl(v.product.thumbnail) ?? ""}
                  alt={v.product.name}
                  className="h-11 w-11 rounded-md object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#F0E9DA] text-[#A88548]">
                  {v.product.name[0]}
                </span>
              )}
              <div className="flex-1">
                <p className="font-semibold text-[#2C2418]">
                  {v.product.name}
                </p>
                <p className="text-[12px] text-[#A89A80]">
                  ID: {v.product.id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-[#E0D8C6]"
                  style={{
                    backgroundColor:
                      v.color.hex_code ?? "#ccc",
                  }}
                />
                <span className="text-[13px] text-[#3A2E1B]">
                  {v.color.name}
                </span>
              </div>

              <button
                type="button"
                aria-label="Edit variant"
                onClick={() => setEditingVariant(v)}
                className="ml-4 rounded-md p-2 text-[#6B5E48] hover:bg-[#F7F0E5]"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                aria-label="Delete variant"
                onClick={() => {
                  if (confirm("Delete this variant?"))
                    del.mutate(v.id);
                }}
                className="rounded-md p-2 text-[#9A3B3B] hover:bg-[#F7ECEC]"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 px-6 py-4 text-[13px]">
              <div>
                <p className="text-[11px] uppercase text-[#A89A80]">
                  Size
                </p>
                <p className="mt-1 text-[#2C2418]">
                  {v.size.name}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-[#A89A80]">
                  Price
                </p>
                <p className="mt-1 text-[#2C2418]">
                  {formatPrice(v.price)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-[#A89A80]">
                  Stock
                </p>
                <span className="mt-1 inline-flex rounded-full bg-[#E7F3EA] px-2 py-0.5 text-[12px] text-[#2F7D4F]">
                  {v.stock}
                </span>
              </div>
              <div>
                <p className="text-[11px] uppercase text-[#A89A80]">
                  SKU
                </p>
                <p className="mt-1 font-mono text-[12px] text-[#8A7C64]">
                  {v.sku}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminVariants;
