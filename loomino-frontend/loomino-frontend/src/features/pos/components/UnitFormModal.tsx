import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import { useCreateUnit, useUpdateUnit } from "../hooks/useUnits";
import type { Unit } from "../types/pos";

interface UnitFormModalProps {
  mode: "add" | "edit";
  unit?: Unit;
  onClose: () => void;
  /** When opened as a quick-add from Add Product, hand the new unit back instead of just closing. */
  onCreated?: (unit: Unit) => void;
}

function UnitFormModal({ mode, unit, onClose, onCreated }: UnitFormModalProps) {
  const [name, setName] = useState(unit?.name ?? "");
  const [shortName, setShortName] = useState(unit?.short_name ?? "");
  const [allowDecimal, setAllowDecimal] = useState(unit?.allow_decimal ?? false);

  const createMutation = useCreateUnit();
  const updateMutation = useUpdateUnit();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!name.trim() || !shortName.trim()) {
      toast.error("Name and short name are both required.");
      return;
    }
    try {
      if (mode === "add") {
        const created = await createMutation.mutateAsync({
          name,
          short_name: shortName,
          allow_decimal: allowDecimal,
        });
        toast.success(`${name} added.`);
        onCreated?.(created);
      } else if (unit) {
        await updateMutation.mutateAsync({
          id: unit.id,
          payload: { name, short_name: shortName, allow_decimal: allowDecimal },
        });
        toast.success("Unit updated.");
      }
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal title={mode === "add" ? "Add Unit" : "Edit Unit"} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kilogram"
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
            Short Name
          </span>
          <input
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="e.g. KG"
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
          />
        </label>

        <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
          <input
            type="checkbox"
            checked={allowDecimal}
            onChange={(e) => setAllowDecimal(e.target.checked)}
            className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
          />
          Allow decimal quantities (e.g. 1.5 {shortName || "unit"})
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

export default UnitFormModal;
