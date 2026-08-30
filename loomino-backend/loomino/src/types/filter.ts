export interface Category {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  product_count: number;
}

export interface Color {
  id: number;
  name: string;
  hex_code: string;
}

export interface Size {
  id: number;
  name: string;
  display_order: number;
}

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}