export type PaymentMethod =
  | "cod"
  | "bkash"
  | "nagad"
  | "rocket"
  | "sslcommerz"
  | "stripe";

export interface CheckoutRequest {
  address_id: number;
  payment_method: PaymentMethod;
  coupon_code?: string;
}

export interface CheckoutResponse {
  message: string;
  order_number: string;
  order_id: number;
  subtotal: string;
  total: string;
}

export interface ApplyCouponRequest {
  code: string;
  subtotal: string | number;
}

export interface ApplyCouponResponse {
  coupon: string;
  discount: string;
  subtotal: string;
  total: string;
}
