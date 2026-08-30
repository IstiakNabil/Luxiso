import { useMutation } from "@tanstack/react-query";

import { applyCoupon } from "../services/checkout.service";

export function useApplyCoupon() {
  return useMutation({
    mutationFn: applyCoupon,
  });
}
