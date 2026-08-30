import api from "@/lib/api";
import type { Brand, PaginatedResponse } from "@/types/filter";

export async function getBrands() {
  const response = await api.get<PaginatedResponse<Brand>>(
    "/products/brands/",
  );

  return response.data;
}