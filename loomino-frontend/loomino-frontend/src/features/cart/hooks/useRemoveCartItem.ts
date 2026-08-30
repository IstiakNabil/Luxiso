import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { removeCartItem } from "../services/cart.service";

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      toast.success(
        response.message ?? "Item removed from cart.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not remove item.",
        ),
      );
    },
  });
}
