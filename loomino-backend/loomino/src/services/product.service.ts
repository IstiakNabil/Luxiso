import api from "@/lib/api";
import type { ProductDetail } from "@/types/product";
import type {
  PaginatedResponse,
} from "@/types/filter";

import type {
  Product,
} from "@/types/product";


interface GetProductsParams {
  ordering?: string;

  search?: string;

  category?: string;

  brand?: string;

  color?: string;

  size?: string;

  min_price?: string;

  max_price?: string;

  is_featured?: boolean;

  is_new_arrival?: boolean;

  page?: number;
}

export async function getProducts(params?: GetProductsParams) {
  const cleanedParams = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => {
      if (value === "") return false;
      if (value === false) return false;
      if (value === undefined) return false;
      return true;
    }),
  );

  const response = await api.get("/products/", {
    params: cleanedParams,
  });



  return response.data;
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail> {
  const response = await api.get<ProductDetail>(`/products/${slug}/`);

  return response.data;
}



export async function getRelatedProducts(
  slug: string,
): Promise<PaginatedResponse<Product>> {
  const response = await api.get<
    PaginatedResponse<Product>
  >(`/products/${slug}/related/`);

  return response.data;
}

export async function getBestSellers(): Promise<Product[]> {
  const response = await api.get("/products/best-sellers/");

  // Endpoint returns a plain array of up to 8 products.
  const data = response.data;
  return Array.isArray(data) ? data : data.results;
}


export async function getModiweekProducts(): Promise<Product[]> {
  const response = await api.get("/products/modiweek/");

  const data = response.data;
  return Array.isArray(data) ? data : data.results;
}
