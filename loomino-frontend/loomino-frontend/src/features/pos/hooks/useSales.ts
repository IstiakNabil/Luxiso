import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSales,
  getSaleDetail,
  createSale,
  deleteSale,
  getReturnableSaleItems,
  getSaleReturns,
  createSaleReturn,
} from "../services/pos.service";
import type { SaleFilters } from "../types/pos";

export function useSales(page: number, filters: SaleFilters) {
  return useQuery({
    queryKey: ["pos", "sales", page, filters],
    queryFn: () => getSales(page, filters),
  });
}

export function useSaleDetail(id: number | null) {
  return useQuery({
    queryKey: ["pos", "sales", "detail", id],
    queryFn: () => getSaleDetail(id as number),
    enabled: id !== null,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createSale(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "sales"] });
      qc.invalidateQueries({ queryKey: ["pos", "products"] });
      qc.invalidateQueries({ queryKey: ["pos", "dashboard"] });
    },
  });
}

export function useDeleteSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSale(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "sales"] }),
  });
}

export function useReturnableSaleItems(saleId: number | null) {
  return useQuery({
    queryKey: ["pos", "sales", "returnable-items", saleId],
    queryFn: () => getReturnableSaleItems(saleId as number),
    enabled: saleId !== null,
  });
}

export function useSaleReturns(
  page: number,
  filters: { location?: number; date_from?: string; date_to?: string },
) {
  return useQuery({
    queryKey: ["pos", "sale-returns", page, filters],
    queryFn: () => getSaleReturns(page, filters),
  });
}

export function useCreateSaleReturn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createSaleReturn(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "sale-returns"] });
      qc.invalidateQueries({ queryKey: ["pos", "products"] });
      qc.invalidateQueries({ queryKey: ["pos", "dashboard"] });
    },
  });
}
