import { useQuery } from "@tanstack/react-query";

import {
  getDashboardStats,
  getDashboardOrders,
  getLowStock,
  getTopProducts,
} from "../services/dashboard.service";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: getDashboardStats,
  });
}

export function useDashboardOrders() {
  return useQuery({
    queryKey: ["admin", "dashboard", "orders"],
    queryFn: getDashboardOrders,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: ["admin", "dashboard", "low-stock"],
    queryFn: getLowStock,
  });
}

export function useTopProducts() {
  return useQuery({
    queryKey: ["admin", "dashboard", "top-products"],
    queryFn: getTopProducts,
  });
}
