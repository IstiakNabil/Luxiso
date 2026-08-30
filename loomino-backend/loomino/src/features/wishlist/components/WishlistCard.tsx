import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import { formatPrice, getMediaUrl } from "@/lib/utils";
import { useRemoveFromWishlist } from "../hooks/useWishlistMutations";
import type { WishlistItem } from "../types/wishlist";

interface WishlistCardProps {
  item: WishlistItem;
}

/**
 * Wishlist product card matching the Figma Favourite design:
 * 392x438 image with a filled heart (remove) top-right,
 * bold product name, variant subtitle, color dot, price.
 */
function WishlistCard({ item }: WishlistCardProps) {
  const removeMutation = useRemoveFromWishlist();
  const variant = item.product_variant;
  const imageUrl = getMediaUrl(item.product_image);

  return (
    <article
      className={`w-full transition-opacity ${
        removeMutation.isPending ? "opacity-50" : ""
      }`}
    >
      <div className="relative h-[438px] w-full overflow-hidden bg-[#E4DACA]">
        <Link to={`/products/${item.product_slug}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={item.product_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#9A8F79]">
              No image
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() =>
            removeMutation.mutate(variant.id)
          }
          disabled={removeMutation.isPending}
          aria-label={`Remove ${item.product_name} from wishlist`}
          className="absolute right-6 top-6 transition hover:scale-110 disabled:opacity-50"
        >
          <Heart
            size={24}
            className="fill-[#C30000] stroke-[#C30000]"
          />
        </button>
      </div>

      <div className="mt-4 flex items-start justify-between px-2">
        <div className="flex flex-col gap-2">
          <Link
            to={`/products/${item.product_slug}`}
            className="text-[16px] font-bold capitalize leading-[1.4] text-[#0C0C0C] hover:underline"
          >
            {item.product_name}
          </Link>

          <p className="text-[15px] text-[#0C0C0C]">
            {variant.size?.name
              ? `Size: ${variant.size.name}`
              : ""}
            {variant.size?.name && variant.color?.name
              ? " · "
              : ""}
            {variant.color?.name
              ? `Color: ${variant.color.name}`
              : ""}
          </p>

          {variant.color?.hex_code && (
            <span
              className="mt-1 inline-block h-6 w-6 rounded-full border border-[#CBCBCB]"
              style={{
                backgroundColor: variant.color.hex_code,
              }}
              title={variant.color.name}
            />
          )}
        </div>

        <p className="text-[16px] font-bold text-[#0C0C0C]">
          {formatPrice(variant.price)}
        </p>
      </div>
    </article>
  );
}

export default WishlistCard;
