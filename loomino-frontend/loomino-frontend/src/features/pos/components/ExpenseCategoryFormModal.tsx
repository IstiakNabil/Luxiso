import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import Modal from "./Modal";
import {
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useExpenseCategories,
} from "../hooks/useExpenses";
import type { ExpenseCategory } from "../types/pos";

interface ExpenseCategoryFormModalProps {
  mode: "add" | "edit";
  category?: ExpenseCategory;
  onClose: () => void;
}

function ExpenseCategoryFormModal({ mode, category, onClose }: ExpenseCategoryFormModalProps) {
  const categoriesQuery = useExpenseCategories();
  const topLevelCategories = (categoriesQuery.data ?? []).filter(
    (c) => c.parent === null && c.id !== category?.id,
  );

  const [name, setName] = useState(category?.name ?? "");
  const [categoryCode, setCategoryCode] = useState(category?.category_code ?? "");
  const [parent, setParent] = useState<number | "">(category?.parent ?? "");
  const [isActive, setIsActive] = useState(category?.is_active ?? true);

  const createMutation = useCreateExpenseCategory();
  const updateMutation = useUpdateExpenseCategory();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    try {
      if (mode === "add") {
        await createMutation.mutateAsync({
          name,
          category_code: categoryCode,
          parent: parent === "" ? null : parent,
        });
        toast.success(`${name} added.`);
      } else if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: {
            name,
            category_code: categoryCode,
            parent: parent === "" ? null : parent,
            is_active: isActive,
          },
        });
        toast.success("Category updated.");
      }
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <Modal
      title={mode === "add" ? "Add Expense Category" : "Edit Expense Category"}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Category name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Category code</span>
          <input
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
            Parent category
          </span>
          <select
            value={parent}
            onChange={(e) => setParent(e.target.value === "" ? "" : Number(e.target.value))}
            className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          >
            <option value="">None (top-level category)</option>
            {topLevelCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
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

export default ExpenseCategoryFormModal;
