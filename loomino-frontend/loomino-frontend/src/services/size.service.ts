import api from "@/lib/api";
import type { Size, PaginatedResponse } from "@/types/filter";

export async function getSizes() {
  const response = await api.get<PaginatedResponse<Size>>(
    "/products/sizes/",
  );

  return response.data;
}