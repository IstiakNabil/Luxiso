import api from "@/lib/api";
import type { Type, PaginatedResponse } from "@/types/filter";

/**
 * Product types (formerly "Brands") for the Shop All filter.
 * Pass a category slug to only get types linked to that
 * category — omit it to get every active type.
 */
export async function getTypes(categorySlug?: string) {
  const response = await api.get<PaginatedResponse<Type>>(
    "/products/types/",
    {
      params: categorySlug ? { category: categorySlug } : undefined,
    },
  );

  return response.data;
}
