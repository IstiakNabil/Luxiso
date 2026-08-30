import { useState } from "react";

import StarRating from "./StarRating";

interface ReviewFormProps {
  submitting?: boolean;
  onSubmit: (data: {
    rating: number;
    title: string;
    review: string;
  }) => void;
}

/**
 * Write-a-review form. Star input + title + body.
 * Built from the Loomino design philosophy (no Figma frame).
 */
function ReviewForm({
  submitting = false,
  onSubmit,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    if (!title.trim() || !review.trim()) {
      setError("Please add a title and your review.");
      return;
    }
    setError(null);
    onSubmit({ rating, title, review });
    setRating(0);
    setTitle("");
    setReview("");
  };

  return (
    <div className="border border-[#CBCBCB] bg-[#F0F2EF] p-6">
      <h3 className="text-[18px] font-bold text-[#0C0C0C]">
        Write a Review
      </h3>

      <div className="mt-4">
        <p className="mb-2 text-[14px] text-[#0C0C0C]">
          Your Rating
        </p>
        <StarRating
          value={rating}
          onChange={setRating}
          size={26}
        />
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Review title"
        className="mt-4 h-[48px] w-full border border-[#B9AE97] bg-transparent px-4 text-[15px] outline-none focus:border-[#4C300D]"
      />

      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="What did you think of this product?"
        rows={4}
        className="mt-4 w-full border border-[#B9AE97] bg-transparent p-4 text-[15px] outline-none focus:border-[#4C300D]"
      />

      {error && (
        <p className="mt-2 text-[14px] text-[#8A3B3B]">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 h-[48px] w-full bg-[#343E32] text-[14px] text-white transition hover:opacity-90 disabled:opacity-50 md:w-[220px]"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </div>
  );
}

export default ReviewForm;
