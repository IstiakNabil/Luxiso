import { useQuery } from "@tanstack/react-query";

import { getProductReviews } from "../services/review.service";

export const reviewsKey = (slug: string) => [
  "reviews",
  slug,
];

export function useReviews(slug: string) {
  return useQuery({
    queryKey: reviewsKey(slug),
    queryFn: () => getProductReviews(slug),
    enabled: !!slug,
  });
}
