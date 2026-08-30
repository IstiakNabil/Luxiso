import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  getExpenses,
  getExpenseDetail,
  createExpense,
  deleteExpense,
} from "../services/pos.service";
import type { ExpenseCategory, ExpenseFilters } from "../types/pos";

export function useExpenseCategories() {
  return useQuery({ queryKey: ["pos", "expense-categories"], queryFn: getExpenseCategories });
}
export function useCreateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; category_code?: string; parent?: number | null }) =>
      createExpenseCategory(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "expense-categories"] }),
  });
}
export function useUpdateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ExpenseCategory> }) =>
      updateExpenseCategory(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "expense-categories"] }),
  });
}
export function useDeleteExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExpenseCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "expense-categories"] });
      qc.invalidateQueries({ queryKey: ["pos", "expenses"] });
    },
  });
}

export function useExpenses(page: number, filters: ExpenseFilters) {
  return useQuery({
    queryKey: ["pos", "expenses", page, filters],
    queryFn: () => getExpenses(page, filters),
  });
}

export function useExpenseDetail(id: number | null) {
  return useQuery({
    queryKey: ["pos", "expenses", "detail", id],
    queryFn: () => getExpenseDetail(id as number),
    enabled: id !== null,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createExpense(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "expenses"] });
      qc.invalidateQueries({ queryKey: ["pos", "dashboard"] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "expenses"] });
      qc.invalidateQueries({ queryKey: ["pos", "dashboard"] });
    },
  });
}
