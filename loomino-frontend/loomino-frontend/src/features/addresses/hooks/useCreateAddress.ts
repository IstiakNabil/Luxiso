import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createAddress } from "../services/address.service";
import { ADDRESSES_QUERY_KEY } from "./useAddresses";

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ADDRESSES_QUERY_KEY,
      });
    },
  });
}
