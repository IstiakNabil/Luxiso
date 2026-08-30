import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import StarRating from "./StarRating";
import ReviewList from "./ReviewList";
import ReviewForm from "./ReviewForm";
import { useReviews } from "../hooks/useReviews";
import {
  useCreateReview,
  useDeleteReview,
} from "../hooks/useReviewMutations";

interface ReviewsSectionProps {
  productId: number;
  slug: string;
  averageRating: number;
  reviewCount: number;
}

function ReviewsSection({
  productId,
  slug,
  averageRating,
  reviewCount,
}: ReviewsSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const { data: reviews, isLoading } = useReviews(slug);
  const createReview = useCreateReview(slug);
  const deleteReview = useDeleteReview(slug);

  const currentUserEmail = user?.email ?? null;

  const alreadyReviewed =
    !!currentUserEmail &&
    (reviews ?? []).some(
      (r) => r.user === currentUserEmail,
    );

  return (
    <section className="mt-[64px]">
      <h2 className="text-[32px] font-semibold leading-[1.4] text-[#1F1210]">
        Reviews
      </h2>

      {/* Summary */}
      <div className="mt-4 flex items-center gap-4">
        <StarRating value={Math.round(averageRating)} size={22} />
        <span className="text-[18px] font-bold text-[#1F1210]">
          {averageRating.toFixed(1)}
        </span>
        <span className="text-[15px] text-[#606060]">
          ({reviewCount}{" "}
          {reviewCount === 1 ? "review" : "reviews"})
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        {/* List */}
        <div>
          {isLoading ? (
            <p className="py-10 text-[16px] text-[#606060]">
              Loading reviews...
            </p>
          ) : (
            <ReviewList
              reviews={reviews ?? []}
              currentUser={currentUserEmail}
              onDelete={(id) => deleteReview.mutate(id)}
              deletingId={
                deleteReview.isPending
                  ? deleteReview.variables
                  : null
              }
            />
          )}
        </div>

        {/* Form / prompts */}
        <div>
          {!isAuthenticated ? (
            <div className="border border-[#CBCBCB] bg-[#F6EFE8] p-6 text-[15px] leading-[1.8] text-[#1F1210]">
              Please{" "}
              <Link
                to="/login"
                className="text-[#8A6A2E] underline"
              >
                log in
              </Link>{" "}
              to write a review. You can review products
              you've purchased and received.
            </div>
          ) : alreadyReviewed ? (
            <div className="border border-[#CBCBCB] bg-[#F6EFE8] p-6 text-[15px] leading-[1.8] text-[#1F1210]">
              You've already reviewed this product. Thanks
              for your feedback!
            </div>
          ) : (
            <ReviewForm
              submitting={createReview.isPending}
              onSubmit={(data) =>
                createReview.mutate({
                  product: productId,
                  ...data,
                })
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;
