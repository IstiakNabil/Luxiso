import api from "@/lib/api";
import type { Category, PaginatedResponse } from "@/types/filter";

export async function getCategories() {
  const response = await api.get<PaginatedResponse<Category>>(
    "/products/categories/",
  );

  return response.data;
}