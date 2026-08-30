import api from "@/lib/api";

import type {
  DashboardStats,
  DashboardOrder,
  LowStockItem,
  TopProduct,
  MonthlySales,
} from "../types/dashboard";

/** All endpoints require an admin (IsAdminUser) token. */

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get("/dashboard/stats/");
  return res.data;
}

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const paged = data as { results?: T[] };
  return paged.results ?? [];
}

export async function getDashboardOrders(): Promise<
  DashboardOrder[]
> {
  const res = await api.get("/dashboard/orders/");
  return unwrap<DashboardOrder>(res.data);
}

export async function getLowStock(): Promise<
  LowStockItem[]
> {
  const res = await api.get("/dashboard/low-stock/");
  return unwrap<LowStockItem>(res.data);
}

export async function getTopProducts(): Promise<
  TopProduct[]
> {
  const res = await api.get("/dashboard/top-products/");
  return unwrap<TopProduct>(res.data);
}

export async function getMonthlySales(): Promise<
  MonthlySales[]
> {
  const res = await api.get("/dashboard/sales/");
  return unwrap<MonthlySales>(res.data);
}


import type { DashboardCustomer } from "../types/dashboard";

export async function getCustomers(): Promise<
  DashboardCustomer[]
> {
  const res = await api.get("/dashboard/customers/");
  return unwrap<DashboardCustomer>(res.data);
}
