import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { addToCart } from "../services/cart.service";

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToCart,
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: ["cart"],
      });

      toast.success(
        response.message ?? "Added to cart.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not add to cart.",
        ),
      );
    },
  });
}
