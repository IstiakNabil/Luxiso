import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { deleteAddress } from "../services/address.service";
import { ADDRESSES_QUERY_KEY } from "./useAddresses";

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADDRESSES_QUERY_KEY,
      });
      toast.success("Address deleted.");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete this address.",
        ),
      );
    },
  });
}
