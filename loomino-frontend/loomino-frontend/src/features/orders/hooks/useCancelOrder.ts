import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { cancelOrder } from "../services/order.service";

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (response, orderNumber) => {
      void queryClient.invalidateQueries({
        queryKey: ["order", orderNumber],
      });
      void queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      toast.success(
        response.message ?? "Order cancelled.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "This order could not be cancelled.",
        ),
      );
    },
  });
}
