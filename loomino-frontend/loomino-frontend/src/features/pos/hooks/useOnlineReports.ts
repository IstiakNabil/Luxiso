import { useQuery } from "@tanstack/react-query";

import { getOnlineSummary, getOnlineProducts, getOnlineSales } from "../services/pos.service";

export function useOnlineSummary() {
  return useQuery({
    queryKey: ["pos", "online", "summary"],
    queryFn: getOnlineSummary,
  });
}

export function useOnlineProducts(
  page: number,
  filters: { search?: string; out_of_stock?: boolean; category?: number },
) {
  return useQuery({
    queryKey: ["pos", "online", "products", page, filters],
    queryFn: () => getOnlineProducts(page, filters),
  });
}

export function useOnlineSales(
  page: number,
  filters: { search?: string; status?: string; date_from?: string; date_to?: string },
) {
  return useQuery({
    queryKey: ["pos", "online", "sales", page, filters],
    queryFn: () => getOnlineSales(page, filters),
  });
}
