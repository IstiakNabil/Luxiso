export interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_sales: number;
  today_sales: number;
  today_orders: number;
}

export interface DashboardOrder {
  order_number: string;
  customer: string;
  status: string;
  total: string;
  created_at: string;
}

export interface LowStockItem {
  sku: string;
  product: string;
  color: string;
  size: string;
  stock: number;
}

export interface TopProduct {
  product: string;
  units_sold: number;
  revenue: string;
}

export interface MonthlySales {
  month: string;
  orders: number;
  sales: string;
}

export interface DashboardCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  location: string | null;
  date_joined: string;
}
