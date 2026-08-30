import api from "@/lib/api";

import type {
  OrderDetail,
  OrderListItem,
  Paginated,
} from "../types/order";

export async function getOrders(
  page: number,
): Promise<Paginated<OrderListItem>> {
  const response = await api.get<Paginated<OrderListItem>>(
    "/orders/",
    { params: { page } },
  );

  return response.data;
}

export async function getOrder(
  orderNumber: string,
): Promise<OrderDetail> {
  const response = await api.get<OrderDetail>(
    `/orders/${orderNumber}/`,
  );

  return response.data;
}

export async function cancelOrder(
  orderNumber: string,
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(
    `/orders/${orderNumber}/cancel/`,
  );

  return response.data;
}
