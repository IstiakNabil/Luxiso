import api from "@/lib/api";
import type { Color, PaginatedResponse } from "@/types/filter";

export async function getColors() {
  const response = await api.get<PaginatedResponse<Color>>(
    "/products/colors/",
  );

  return response.data;
}