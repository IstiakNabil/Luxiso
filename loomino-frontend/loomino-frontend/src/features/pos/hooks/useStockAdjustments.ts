import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getStockAdjustments,
  createStockAdjustment,
  deleteStockAdjustment,
} from "../services/pos.service";
import type { StockAdjustmentFilters } from "../types/pos";

export function useStockAdjustments(page: number, filters: StockAdjustmentFilters) {
  return useQuery({
    queryKey: ["pos", "stock-adjustments", page, filters],
    queryFn: () => getStockAdjustments(page, filters),
  });
}

export function useCreateStockAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createStockAdjustment(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "stock-adjustments"] });
      qc.invalidateQueries({ queryKey: ["pos", "products"] });
      qc.invalidateQueries({ queryKey: ["pos", "dashboard"] });
    },
  });
}

export function useDeleteStockAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStockAdjustment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "stock-adjustments"] });
      qc.invalidateQueries({ queryKey: ["pos", "products"] });
      qc.invalidateQueries({ queryKey: ["pos", "dashboard"] });
    },
  });
}
