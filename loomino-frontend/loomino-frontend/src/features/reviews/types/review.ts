export interface Review {
  id: number;
  user: string;
  rating: number;
  title: string;
  review: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface CreateReviewRequest {
  product: number;
  rating: number;
  title: string;
  review: string;
}

export interface ReviewMessageResponse {
  message: string;
}
