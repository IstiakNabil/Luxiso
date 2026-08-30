import api from "@/lib/api";

import type {
  CreateReviewRequest,
  Review,
  ReviewMessageResponse,
} from "../types/review";

/** Public: list reviews for a product by slug. */
export async function getProductReviews(
  slug: string,
): Promise<Review[]> {
  const response = await api.get(
    `/reviews/product/${slug}/`,
  );

  const data = response.data;
  return Array.isArray(data) ? data : data.results;
}

/** Auth: create a review (purchased + delivered only). */
export async function createReview(
  payload: CreateReviewRequest,
): Promise<ReviewMessageResponse> {
  const response = await api.post("/reviews/", payload);
  return response.data;
}

/** Auth: update own review. */
export async function updateReview(
  id: number,
  payload: Partial<CreateReviewRequest>,
): Promise<Review> {
  const response = await api.patch(
    `/reviews/${id}/`,
    payload,
  );
  return response.data;
}

/** Auth: delete own review. */
export async function deleteReview(
  id: number,
): Promise<void> {
  await api.delete(`/reviews/${id}/delete/`);
}
