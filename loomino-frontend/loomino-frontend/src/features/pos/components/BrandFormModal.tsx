import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import { useCreateBrand, useUpdateBrand } from "../hooks/useProducts";
import type { Brand } from "../types/pos";

interface BrandFormModalProps {
  mode: "add" | "edit";
  brand?: Brand;
  onClose: () => void;
  /** When opened as a quick-add from Add Product, hand the new brand back instead of just closing. */
  onCreated?: (brand: Brand) => void;
}

function BrandFormModal({ mode, brand, onClose, onCreated }: BrandFormModalProps) {
  const [name, setName] = useState(brand?.name ?? "");
  const [note, setNote] = useState(brand?.note ?? "");
  const [isActive, setIsActive] = useState(brand?.is_active ?? true);

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    try {
      if (mode === "add") {
        const created = await createMutation.mutateAsync({ name, note });
        toast.success(`${name} added.`);
        onCreated?.(created);
      } else if (brand) {
        await updateMutation.mutateAsync({
          id: brand.id,
          payload: { name, note, is_active: isActive },
        });
        toast.success("Brand updated.");
      }
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal title={mode === "add" ? "Add Brand" : "Edit Brand"} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        {mode === "edit" && (
          <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
            />
            Active
          </label>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E7E4F3] px-4 py-2 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#6C5AD8] disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default BrandFormModal;
