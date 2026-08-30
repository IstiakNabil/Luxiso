export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  banner_image: string | null;
  icon_image: string | null;
  display_order: number;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminColor {
  id: number;
  name: string;
  hex_code: string;
  is_active: boolean;
}

export interface AdminSize {
  id: number;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface AdminCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  date_joined: string;
}
