export interface WishlistColor {
  id: number;
  name: string;
  hex_code?: string;
}

export interface WishlistSize {
  id: number;
  name: string;
}

export interface WishlistVariant {
  id: number;
  sku: string;
  color: WishlistColor | null;
  size: WishlistSize | null;
  price: string;
  stock: number;
  available: boolean;
}

/**
 * Item shape from GET /wishlist/. The product_name/slug/image
 * fields come from the wishlist serializer (added so cards can
 * render a title, link, and photo).
 */
export interface WishlistItem {
  id: number;
  product_variant: WishlistVariant;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  created_at: string;
}

export interface AddWishlistRequest {
  product_variant_id: number;
}

export interface WishlistMessageResponse {
  message: string;
}
