import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useIsInWishlist } from "../hooks/useIsInWishlist";
import {
  useAddToWishlist,
  useRemoveFromWishlist,
} from "../hooks/useWishlistMutations";

interface WishlistButtonProps {
  variantId: number | null | undefined;
  /** Product name, for the accessible label. */
  productName?: string;
  size?: number;
  className?: string;
}

/**
 * Reusable heart toggle. Adds/removes a variant from the
 * wishlist and reflects the current state (filled when
 * wishlisted). Guests are sent to /login.
 */
function WishlistButton({
  variantId,
  productName = "product",
  size = 24,
  className = "",
}: WishlistButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isWishlisted } = useIsInWishlist(variantId);

  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const isBusy =
    addMutation.isPending || removeMutation.isPending;

  const handleClick = (
    event: React.MouseEvent,
  ) => {
    // Cards are usually wrapped in a Link — don't navigate.
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (variantId == null) return;

    if (isWishlisted) {
      removeMutation.mutate(variantId);
    } else {
      addMutation.mutate({
        product_variant_id: variantId,
      });
    }
  };

  const disabled = isBusy || variantId == null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={isWishlisted}
      aria-label={
        isWishlisted
          ? `Remove ${productName} from wishlist`
          : `Add ${productName} to wishlist`
      }
      className={`transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <Heart
        size={size}
        className={
          isWishlisted
            ? "fill-[#C30000] stroke-[#C30000]"
            : "stroke-[#0C0C0C] stroke-[1.8]"
        }
      />
    </button>
  );
}

export default WishlistButton;
