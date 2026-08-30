export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  thumbnail: string | null;
  regular_price: string;
  discount_price: string | null;
  is_active: boolean;
  total_stock: number;
  primary_category: string | null;
}

export interface VariantImages {
  front: string | null;
  back: string | null;
}
export interface AdminVariant {
  id: number;
  product: { id: number; name: string; thumbnail: string | null };
  color: { id: number; name: string; hex_code?: string };
  size: { id: number; name: string };
  price: string;
  unit_price: string;
  regular_price: string;
  stock: number;
  sku: string;
  images: VariantImages;
  is_active: boolean;
}

export interface AdminReview {
  id: number;
  product: { id?: number; name: string; thumbnail?: string | null };
  reviewer: { name?: string; email?: string };
  rating: number;
  title: string;
  review_text: string;
  status: string;
  created_at: string;
}

export interface AdminOrder {
  order_number: string;
  customer: { name?: string; email?: string; phone?: string };
  total: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  cancel_refund_status: string;
  courier_status: string;
  placed_date: string;
}

export interface AdminCoupon {
  id: number;
  code: string;
  description: string | null;
  type: string;
  value: string;
  cart_min_value: string | null;
  maximum_discount_amount: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  status: string;
  /** ISO datetime — when the coupon becomes valid. Required by the backend. */
  valid_from: string;
  /** ISO datetime — when the coupon expires. Required by the backend. */
  expiry_date: string;
}

export interface AdminMail {
  id: number;
  sender: { name?: string; email?: string; phone?: string } | string;
  subject: string;
  message_snippet: string;
  created_at: string;
}

export interface AdminSubscriber {
  id: number;
  email: string;
  subscribed_at: string;
}

/**
 * Product shape returned by the admin detail endpoint and
 * accepted by create/update. Note: unlike AdminProduct (the
 * list shape, where `category` is the category NAME), here
 * `category`/`brand` are foreign-key ids.
 */
export interface AdminProductDetail {
  id: number;
  name: string;
  slug: string;
  category: number | null;
  category_name: string | null;
  brand: number | null;
  brand_name: string | null;
  short_description: string;
  description: string;
  fitting: string;
  fabric_and_care: string;
  shipping_and_return: string;
  regular_price: string;
  discount_price: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_modiweek: boolean;
  is_active: boolean;
  thumbnail: string | null;
  total_stock: number;
}

/** Payload accepted by POST/PATCH /products/admin/ */
export interface ProductPayload {
  name: string;
  category: number | null;
  brand: number | null;
  short_description: string;
  description: string;
  fitting: string;
  fabric_and_care: string;
  shipping_and_return: string;
  regular_price: string;
  discount_price: string | null;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_modiweek: boolean;
  is_active: boolean;
}

export interface AdminBrand {
  id: number;
  name: string;
  slug: string;
}

/** Payload accepted by POST/PATCH /products/variants/admin/ */
export interface VariantPayload {
  product: number | null;
  color: number | null;
  size: number | null;
  sku: string;
  price_override: string | null;
  stock: number;
  is_active: boolean;
}

/** A product image row from /products/images/admin/ */
export interface AdminProductImage {
  id: number;
  product: number;
  product_name: string;
  image: string;
  image_url: string | null;
  image_type: "cover" | "hover" | "gallery";
  display_order: number;
  created_at: string;
}

export const IMAGE_TYPES = [
  "cover",
  "hover",
  "gallery",
] as const;

/** Brand row from /products/brands/manage/ */
export interface AdminBrandDetail {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  product_count: number;
}
