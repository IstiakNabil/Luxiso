import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import { useCreateTaxRate } from "../hooks/useProducts";
import type { TaxRate } from "../types/pos";

interface TaxRateFormModalProps {
  onClose: () => void;
  onCreated?: (taxRate: TaxRate) => void;
}

function TaxRateFormModal({ onClose, onCreated }: TaxRateFormModalProps) {
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");

  const createMutation = useCreateTaxRate();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    const numeric = Number(rate);
    if (!rate || Number.isNaN(numeric) || numeric < 0) {
      toast.error("Enter a valid percentage.");
      return;
    }
    try {
      const created = await createMutation.mutateAsync({ name, rate });
      toast.success(`${name} (${rate}%) added.`);
      onCreated?.(created);
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal title="Add Tax Rate" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. VAT"
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
            Percentage
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="15"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
            />
            <span className="text-[13px] text-[#726C8C]">%</span>
          </div>
          {name.trim() && rate && (
            <p className="mt-1.5 text-[12px] text-[#A8A2C9]">
              Will show as "{name} ({rate}%)" wherever Tax is selected.
            </p>
          )}
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

export default TaxRateFormModal;
