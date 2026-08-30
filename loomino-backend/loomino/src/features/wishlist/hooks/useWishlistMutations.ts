import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlist.service";
import { WISHLIST_QUERY_KEY } from "./useWishlist";

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addToWishlist,
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: WISHLIST_QUERY_KEY,
      });
      toast.success(
        response.message ?? "Added to wishlist.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not add to wishlist.",
        ),
      );
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromWishlist,
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: WISHLIST_QUERY_KEY,
      });
      toast.success(
        response.message ?? "Removed from wishlist.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not remove from wishlist.",
        ),
      );
    },
  });
}
