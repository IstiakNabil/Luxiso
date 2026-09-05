import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import { useCreateColor, useUpdateColor } from "../hooks/useProducts";
import type { ColorOption } from "../types/pos";

interface ColorFormModalProps {
  mode?: "add" | "edit";
  color?: ColorOption;
  onClose: () => void;
  onCreated?: (color: ColorOption) => void;
}

function ColorFormModal({ mode = "add", color, onClose, onCreated }: ColorFormModalProps) {
  const [name, setName] = useState(color?.name ?? "");
  const [hexCode, setHexCode] = useState(color?.hex_code ?? "#000000");

  const createMutation = useCreateColor();
  const updateMutation = useUpdateColor();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Color name is required.");
      return;
    }
    try {
      if (mode === "add") {
        const created = await createMutation.mutateAsync({ name, hex_code: hexCode });
        toast.success(`${name} added.`);
        onCreated?.(created);
      } else if (color) {
        await updateMutation.mutateAsync({ id: color.id, payload: { name, hex_code: hexCode } });
        toast.success("Color updated.");
      }
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal title={mode === "add" ? "Add Color" : "Edit Color"} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Maroon"
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Swatch</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hexCode}
              onChange={(e) => setHexCode(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-[#E7E4F3]"
            />
            <input
              value={hexCode}
              onChange={(e) => setHexCode(e.target.value)}
              placeholder="#000000"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
            />
          </div>
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

export default ColorFormModal;
