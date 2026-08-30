import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { setDefaultAddress } from "../services/address.service";
import { ADDRESSES_QUERY_KEY } from "./useAddresses";

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADDRESSES_QUERY_KEY,
      });
      toast.success("Default address updated.");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not set default address.",
        ),
      );
    },
  });
}
