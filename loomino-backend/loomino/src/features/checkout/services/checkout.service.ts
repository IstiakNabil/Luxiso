import api from "@/lib/api";

import type {
  ApplyCouponRequest,
  ApplyCouponResponse,
  CheckoutRequest,
  CheckoutResponse,
} from "../types/checkout";

export async function checkout(
  payload: CheckoutRequest,
): Promise<CheckoutResponse> {
  const response = await api.post<CheckoutResponse>(
    "/checkout/",
    payload,
  );

  return response.data;
}

export async function applyCoupon(
  payload: ApplyCouponRequest,
): Promise<ApplyCouponResponse> {
  const response = await api.post<ApplyCouponResponse>(
    "/coupons/apply/",
    payload,
  );

  return response.data;
}
