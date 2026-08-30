import { Truck } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import WishlistButton from "@/features/wishlist/components/WishlistButton";

interface ProductActionsProps {
  price: string;
  disabled?: boolean;
  isAdding?: boolean;
  /** Selected variant id (for wishlist); null until color+size chosen. */
  variantId: number | null;
  productName: string;
  onAddToCart: () => void;
}

function ProductActions({
  price,
  disabled = false,
  isAdding = false,
  variantId,
  productName,
  onAddToCart,
}: ProductActionsProps) {
  return (
    <div className="mt-4 w-full">
      <button
        type="button"
        disabled={disabled || isAdding}
        onClick={onAddToCart}
        className="h-[48px] w-full bg-[#343E32] text-[14px] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isAdding
          ? "Adding..."
          : `Add To Cart  ·  ${formatPrice(price)}`}
      </button>

      <div className="mt-4 flex items-center justify-between text-[14px] text-[#606060]">
        <span className="flex items-center gap-2">
          <Truck size={18} /> Easy Return
        </span>

        <span className="flex items-center gap-2">
          <WishlistButton
            variantId={variantId}
            productName={productName}
            size={20}
          />
          Add To Wish List
        </span>
      </div>
    </div>
  );
}

export default ProductActions;
