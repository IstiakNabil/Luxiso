import { useQuery } from "@tanstack/react-query";

import {
  getPurchasePaymentReport,
  getSalePaymentReport,
  getProductPurchaseReport,
  getExpenseReport,
  getStockReport,
  getProductSaleReport,
  getTrendingProducts,
  getStockAdjustmentReport,
} from "../services/pos.service";
import type { ReportFilters } from "../types/pos";

export function usePurchasePaymentReport(page: number, filters: ReportFilters) {
  return useQuery({
    queryKey: ["pos", "reports", "purchase-payments", page, filters],
    queryFn: () => getPurchasePaymentReport(page, filters),
  });
}

export function useSalePaymentReport(page: number, filters: ReportFilters) {
  return useQuery({
    queryKey: ["pos", "reports", "sale-payments", page, filters],
    queryFn: () => getSalePaymentReport(page, filters),
  });
}

export function useProductPurchaseReport(page: number, filters: ReportFilters) {
  return useQuery({
    queryKey: ["pos", "reports", "product-purchases", page, filters],
    queryFn: () => getProductPurchaseReport(page, filters),
  });
}

export function useExpenseReport(filters: {
  location?: number;
  category?: number;
  date_from?: string;
  date_to?: string;
}) {
  return useQuery({
    queryKey: ["pos", "reports", "expenses", filters],
    queryFn: () => getExpenseReport(filters),
  });
}

export function useStockReport(page: number, filters: ReportFilters & { brand?: number; unit?: number }) {
  return useQuery({
    queryKey: ["pos", "reports", "stock", page, filters],
    queryFn: () => getStockReport(page, filters),
  });
}

export function useProductSaleReport(
  page: number,
  view: "detailed" | "grouped" | "by_category" | "by_brand",
  filters: ReportFilters & { brand?: number },
) {
  return useQuery({
    queryKey: ["pos", "reports", "product-sales", page, view, filters],
    queryFn: () => getProductSaleReport(page, view, filters),
  });
}

export function useTrendingProducts(filters: {
  location?: number;
  category?: number;
  subcategory?: number;
  brand?: number;
  unit?: number;
  product_type?: string;
  date_from?: string;
  date_to?: string;
  number_of_products?: number;
}) {
  return useQuery({
    queryKey: ["pos", "reports", "trending-products", filters],
    queryFn: () => getTrendingProducts(filters),
  });
}

export function useStockAdjustmentReport(
  page: number,
  filters: { location?: number; date_from?: string; date_to?: string },
) {
  return useQuery({
    queryKey: ["pos", "reports", "stock-adjustments", page, filters],
    queryFn: () => getStockAdjustmentReport(page, filters),
  });
}
