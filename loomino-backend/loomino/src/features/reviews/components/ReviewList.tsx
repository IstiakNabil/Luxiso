import { Trash2, BadgeCheck } from "lucide-react";

import { formatDate } from "@/lib/utils";
import StarRating from "./StarRating";
import type { Review } from "../types/review";

interface ReviewListProps {
  reviews: Review[];
  currentUser?: string | null;
  onDelete: (id: number) => void;
  deletingId?: number | null;
}

function ReviewList({
  reviews,
  currentUser,
  onDelete,
  deletingId,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="py-10 text-[16px] text-[#606060]">
        No reviews yet. Be the first to share your thoughts.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#CBCBCB]">
      {reviews.map((review) => {
        const isOwn =
          !!currentUser && review.user === currentUser;

        return (
          <li key={review.id} className="py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <StarRating value={review.rating} />
                <h4 className="mt-2 text-[16px] font-bold text-[#0C0C0C]">
                  {review.title}
                </h4>
              </div>

              {isOwn && (
                <button
                  type="button"
                  onClick={() => onDelete(review.id)}
                  disabled={deletingId === review.id}
                  aria-label="Delete your review"
                  className="text-[#8A3B3B] transition hover:opacity-80 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <p className="mt-3 text-[15px] leading-[1.8] text-[#0C0C0C]">
              {review.review}
            </p>

            <div className="mt-3 flex items-center gap-3 text-[13px] text-[#606060]">
              <span className="font-medium text-[#0C0C0C]">
                {review.user.includes("@")
                  ? review.user.split("@")[0]
                  : review.user}
              </span>
              <span>·</span>
              <span>{formatDate(review.created_at)}</span>
              {review.is_verified_purchase && (
                <span className="flex items-center gap-1 text-[#3B5537]">
                  <BadgeCheck size={14} /> Verified
                  Purchase
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default ReviewList;
