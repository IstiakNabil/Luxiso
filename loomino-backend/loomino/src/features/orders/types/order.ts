import type { Address } from "@/features/addresses/types/address";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Row shape from GET /orders/ (list). */
export interface OrderListItem {
  order_number: string;
  status: OrderStatus;
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  created_at: string;
}

export interface OrderItem {
  product_name: string;
  sku: string;
  color: string;
  size: string;
  price: string;
  quantity: number;
  subtotal: string;
}

/** Shape from GET /orders/<order_number>/ (detail). */
export interface OrderDetail extends OrderListItem {
  shipping_address: Address;
  shipment_status: string | null;
  tracking_number: string | null;
  items: OrderItem[];
}

/** Generic DRF page wrapper (matches StandardResultsSetPagination). */
export interface Paginated<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
