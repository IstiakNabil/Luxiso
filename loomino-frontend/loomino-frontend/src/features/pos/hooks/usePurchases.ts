import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  searchVariants,
  getPurchases,
  getPurchaseDetail,
  createPurchase,
  getPurchaseReturns,
  getReturnableItems,
  createPurchaseReturn,
} from "../services/pos.service";
import type { PurchaseFilters } from "../types/pos";

export function useReturnableItems(purchaseId: number | null) {
  return useQuery({
    queryKey: ["pos", "purchases", "returnable-items", purchaseId],
    queryFn: () => getReturnableItems(purchaseId as number),
    enabled: purchaseId !== null,
  });
}

export function useCreatePurchaseReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createPurchaseReturn(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "purchase-returns"] });
      qc.invalidateQueries({ queryKey: ["pos", "products"] });
      qc.invalidateQueries({ queryKey: ["pos", "dashboard"] });
    },
  });
}

export function useVariantSearch(q: string) {
  return useQuery({
    queryKey: ["pos", "variants", "search", q],
    queryFn: () => searchVariants(q),
    enabled: q.trim().length >= 2,
  });
}

export function usePurchases(page: number, filters: PurchaseFilters) {
  return useQuery({
    queryKey: ["pos", "purchases", page, filters],
    queryFn: () => getPurchases(page, filters),
  });
}

export function usePurchaseDetail(id: number | null) {
  return useQuery({
    queryKey: ["pos", "purchases", "detail", id],
    queryFn: () => getPurchaseDetail(id as number),
    enabled: id !== null,
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createPurchase(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "purchases"] });
      qc.invalidateQueries({ queryKey: ["pos", "products"] });
      qc.invalidateQueries({ queryKey: ["pos", "dashboard"] });
    },
  });
}

export function usePurchaseReturns(
  page: number,
  filters: { location?: number; date_from?: string; date_to?: string },
) {
  return useQuery({
    queryKey: ["pos", "purchase-returns", page, filters],
    queryFn: () => getPurchaseReturns(page, filters),
  });
}
