import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  createReview,
  deleteReview,
} from "../services/review.service";
import { reviewsKey } from "./useReviews";

export function useCreateReview(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: reviewsKey(slug),
      });
      toast.success(
        response.message ?? "Review submitted.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not submit your review.",
        ),
      );
    },
  });
}

export function useDeleteReview(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: reviewsKey(slug),
      });
      toast.success("Review deleted.");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete your review.",
        ),
      );
    },
  });
}
