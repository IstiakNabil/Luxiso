/**
 * NOTE: price fields are strings — DRF serializes Decimal
 * values as strings by default. Use formatPrice() to display.
 */
export interface CartItem {
  id: number;
  product: string;
  slug: string;
  image: string | null;
  color: string;
  size: string;
  price: string;
  quantity: number;
  subtotal: string;
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_price: string;
}

export interface AddToCartRequest {
  product_variant_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  id: number;
  quantity: number;
}

export interface UpdateCartItemResponse {
  message: string;
  quantity: number;
}

export interface CartMessageResponse {
  message: string;
}
