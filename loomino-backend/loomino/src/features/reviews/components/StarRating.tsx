import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  /** When set, stars are clickable and call this on select. */
  onChange?: (value: number) => void;
  size?: number;
}

/**
 * Star rating. Read-only when no onChange is passed;
 * interactive (with hover preview) when it is.
 * Brown fill (#4C300D) matches the Loomino accent.
 */
function StarRating({
  value,
  onChange,
  size = 20,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !!onChange;
  const shown = hover ?? value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= shown;

        const starEl = (
          <Star
            size={size}
            className={
              filled
                ? "fill-[#4C300D] stroke-[#4C300D]"
                : "fill-transparent stroke-[#B9AE97]"
            }
          />
        );

        return interactive ? (
          <button
            key={star}
            type="button"
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(null)}
            className="transition hover:scale-110"
          >
            {starEl}
          </button>
        ) : (
          <span key={star}>{starEl}</span>
        );
      })}
    </div>
  );
}

export default StarRating;
