import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import { useCreateSize, useUpdateSize } from "../hooks/useProducts";
import type { SizeOption } from "../types/pos";

interface SizeFormModalProps {
  mode?: "add" | "edit";
  size?: SizeOption;
  onClose: () => void;
  onCreated?: (size: SizeOption) => void;
}

function SizeFormModal({ mode = "add", size, onClose, onCreated }: SizeFormModalProps) {
  const [name, setName] = useState(size?.name ?? "");

  const createMutation = useCreateSize();
  const updateMutation = useUpdateSize();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Size name is required.");
      return;
    }
    try {
      if (mode === "add") {
        const created = await createMutation.mutateAsync({ name });
        toast.success(`${name} added.`);
        onCreated?.(created);
      } else if (size) {
        await updateMutation.mutateAsync({ id: size.id, payload: { name } });
        toast.success("Size updated.");
      }
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal title={mode === "add" ? "Add Size" : "Edit Size"} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. XL"
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
          />
        </label>

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
            className="rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-[#6C5AD8] disabled:opacity-60"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default SizeFormModal;
