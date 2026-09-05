import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import { useCreateStorefrontType } from "../hooks/useProducts";
import type { StorefrontProductType } from "../types/pos";

interface StorefrontTypeFormModalProps {
  /** Pre-links the new type to whichever category is already chosen
   * in the form, so it shows up immediately once the category filter
   * is applied -- can still be blank if no category is selected yet. */
  defaultCategoryId?: number | "";
  onClose: () => void;
  onCreated?: (type: StorefrontProductType) => void;
}

function StorefrontTypeFormModal({
  defaultCategoryId,
  onClose,
  onCreated,
}: StorefrontTypeFormModalProps) {
  const [name, setName] = useState("");
  const createMutation = useCreateStorefrontType();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Type name is required.");
      return;
    }
    try {
      const created = await createMutation.mutateAsync({
        name,
        categories: defaultCategoryId ? [defaultCategoryId] : [],
      });
      toast.success(`${name} added.`);
      onCreated?.(created);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal title="Add Storefront Type" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Belts"
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        {!defaultCategoryId && (
          <p className="text-[12px] text-[#A8A2C9]">
            No storefront category is selected yet — this type won't be linked to one, but you
            can still pick it.
          </p>
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
            disabled={createMutation.isPending}
            className="rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#6C5AD8] disabled:opacity-60"
          >
            {createMutation.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default StorefrontTypeFormModal;
