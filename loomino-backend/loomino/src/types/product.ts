export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  thumbnail: string;
  category: string;
  brand: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  in_stock: boolean;
  default_variant_id: number | null;
  average_rating: number;
  review_count: number;
  /**
   * Not yet returned by the list endpoints — the backend's
   * ProductListSerializer doesn't include variant colors. Once
   * it does, ProductCard will render swatches automatically.
   */
  colors?: { id: number; name: string; hex_code: string }[];
}

export interface ProductImage {
  id: number;
  image: string;
  image_type: string;
  display_order: number;
}

export interface ProductColor {
  id: number;
  name: string;
  hex_code: string;
}

export interface ProductSize {
  id: number;
  name: string;
}

export interface ProductVariant {
  id: number;
  sku: string;

  color: ProductColor;

  size: ProductSize;

  price: number;
  stock: number;
  available: boolean;
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  fitting: string;
  fabric_and_care: string;
  shipping_and_return: string;
  regular_price: string;
  discount_price: string | null;
  category: string;
  brand: string;
  is_featured: boolean;
  is_new_arrival: boolean;
  average_rating: number;
  review_count: number;
  images: ProductImage[];
  variants: ProductVariant[];
}