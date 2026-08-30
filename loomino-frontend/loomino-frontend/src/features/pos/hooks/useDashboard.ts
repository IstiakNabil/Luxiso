import { useQuery } from "@tanstack/react-query";

import {
  getDashboardSummary,
  getSalesPaymentDue,
  getPurchasePaymentDue,
  getStockAlert,
  getStockExpiryAlert,
  getSalesOrders,
  getPOSLocations,
} from "../services/pos.service";
import type { DashboardFilters } from "../types/pos";

export function useDashboardSummary(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["pos", "dashboard", "summary", filters],
    queryFn: () => getDashboardSummary(filters),
  });
}

export function useSalesPaymentDue(page: number, filters: DashboardFilters) {
  return useQuery({
    queryKey: ["pos", "dashboard", "sales-payment-due", page, filters],
    queryFn: () => getSalesPaymentDue(page, filters),
  });
}

export function usePurchasePaymentDue(page: number, filters: DashboardFilters) {
  return useQuery({
    queryKey: ["pos", "dashboard", "purchase-payment-due", page, filters],
    queryFn: () => getPurchasePaymentDue(page, filters),
  });
}

export function useStockAlert(page: number, filters: DashboardFilters) {
  return useQuery({
    queryKey: ["pos", "dashboard", "stock-alert", page, filters],
    queryFn: () => getStockAlert(page, filters),
  });
}

export function useStockExpiryAlert(page: number, filters: DashboardFilters) {
  return useQuery({
    queryKey: ["pos", "dashboard", "stock-expiry-alert", page, filters],
    queryFn: () => getStockExpiryAlert(page, filters),
  });
}

export function useSalesOrders(page: number, filters: DashboardFilters) {
  return useQuery({
    queryKey: ["pos", "dashboard", "sales-orders", page, filters],
    queryFn: () => getSalesOrders(page, filters),
  });
}

export function usePOSLocations() {
  return useQuery({
    queryKey: ["pos", "locations"],
    queryFn: getPOSLocations,
    staleTime: 5 * 60 * 1000,
  });
}
