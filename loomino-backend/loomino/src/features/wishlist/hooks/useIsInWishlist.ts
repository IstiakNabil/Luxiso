import { useWishlist } from "./useWishlist";

/**
 * Returns whether a given variant is wishlisted, and its
 * wishlist item id. Used by product cards / detail heart
 * buttons to toggle correctly.
 */
export function useIsInWishlist(
  variantId: number | null | undefined,
) {
  const { data } = useWishlist();

  if (variantId == null || !data) {
    return { isWishlisted: false };
  }

  const match = data.find(
    (item) => item.product_variant.id === variantId,
  );

  return { isWishlisted: !!match };
}
