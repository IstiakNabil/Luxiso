import api from "@/lib/api";

import type {
  AddWishlistRequest,
  WishlistItem,
  WishlistMessageResponse,
} from "../types/wishlist";

export async function getWishlist(): Promise<WishlistItem[]> {
  const response = await api.get<WishlistItem[]>(
    "/wishlist/",
  );

  return response.data;
}

export async function addToWishlist(
  payload: AddWishlistRequest,
): Promise<WishlistMessageResponse> {
  const response = await api.post<WishlistMessageResponse>(
    "/wishlist/add/",
    payload,
  );

  return response.data;
}

export async function removeFromWishlist(
  variantId: number,
): Promise<WishlistMessageResponse> {
  const response =
    await api.delete<WishlistMessageResponse>(
      `/wishlist/${variantId}/remove/`,
    );

  return response.data;
}
