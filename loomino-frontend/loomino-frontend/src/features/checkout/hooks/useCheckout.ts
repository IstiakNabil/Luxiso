import { useMutation, useQueryClient } from "@tanstack/react-query";

import { checkout } from "../services/checkout.service";

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      // Backend clears the cart on success — reflect that.
      void queryClient.invalidateQueries({
        queryKey: ["cart"],
      });
    },
  });
}
