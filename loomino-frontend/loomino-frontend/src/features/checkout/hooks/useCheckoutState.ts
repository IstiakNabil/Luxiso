import { useState } from "react";

import type { Address } from "@/features/addresses/types/address";
import type {
  ApplyCouponResponse,
  PaymentMethod,
} from "../types/checkout";

export type CheckoutStep = "info" | "payment";

/**
 * Holds the in-progress checkout selections that must
 * survive across steps (address, coupon, payment method).
 * Kept local to the checkout flow rather than in Redux —
 * it's ephemeral and scoped to this page.
 */
export function useCheckoutState() {
  const [step, setStep] = useState<CheckoutStep>("info");

  const [address, setAddress] = useState<Address | null>(
    null,
  );

  const [coupon, setCoupon] =
    useState<ApplyCouponResponse | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");

  return {
    step,
    setStep,
    address,
    setAddress,
    coupon,
    setCoupon,
    paymentMethod,
    setPaymentMethod,
  };
}
