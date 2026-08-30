import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAddToCart } from "../hooks/useAddToCart";

interface AddToCartButtonProps {
  variantId: number | null | undefined;
  /** Product name, for the accessible label. */
  productName?: string;
  size?: number;
  className?: string;
  /**
   * "icon" — small circular bag icon (Midweek cards, wherever
   * it sits next to the wishlist heart on its own).
   * "bar" — full-width text bar meant to sit along the bottom
   * edge of a product image and be revealed on hover.
   */
  variant?: "icon" | "bar";
}

/**
 * Reusable "quick add" button for product cards that don't have
 * their own size/color picker (Best Sellers, On Sale, Shop).
 * Adds the product's default variant directly. Guests are sent
 * to /login, same as the wishlist button. Disabled if the
 * product has no default variant (e.g. no stock/no variants
 * configured).
 */
function AddToCartButton({
  variantId,
  productName = "product",
  size = 18,
  className = "",
  variant = "icon",
}: AddToCartButtonProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const addMutation = useAddToCart();

  const handleClick = (event: React.MouseEvent) => {
    // Cards are usually wrapped in a Link — don't navigate.
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (variantId == null) return;

    addMutation.mutate({
      product_variant_id: variantId,
      quantity: 1,
    });
  };

  const disabled = addMutation.isPending || variantId == null;

  if (variant === "bar") {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={`Add ${productName} to cart`}
        title={
          variantId == null
            ? "Currently unavailable"
            : `Add ${productName} to cart`
        }
        className={`flex w-full items-center justify-center bg-[#5C1626] py-3 text-[14px] font-medium capitalize text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      >
        {addMutation.isPending ? "Adding..." : "Add To Cart"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={`Add ${productName} to cart`}
      title={
        variantId == null
          ? "Currently unavailable"
          : `Add ${productName} to cart`
      }
      className={`flex items-center justify-center transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <ShoppingBag size={size} className="stroke-[#1F1210] stroke-[1.8]" />
    </button>
  );
}

export default AddToCartButton;
