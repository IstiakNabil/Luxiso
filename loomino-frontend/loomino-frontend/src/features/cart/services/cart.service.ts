import api from "@/lib/api";

import type {
  AddToCartRequest,
  CartMessageResponse,
  CartResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
} from "../types/cart";

export async function getCart(): Promise<CartResponse> {
  const response = await api.get<CartResponse>("/cart/");

  return response.data;
}

export async function addToCart(
  payload: AddToCartRequest,
): Promise<CartMessageResponse> {
  const response = await api.post<CartMessageResponse>(
    "/cart/add/",
    payload,
  );

  return response.data;
}

export async function updateCartItem({
  id,
  quantity,
}: UpdateCartItemRequest): Promise<UpdateCartItemResponse> {
  const response = await api.patch<UpdateCartItemResponse>(
    `/cart/items/${id}/`,
    { quantity },
  );

  return response.data;
}

export async function removeCartItem(
  id: number,
): Promise<CartMessageResponse> {
  const response = await api.delete<CartMessageResponse>(
    `/cart/items/${id}/delete/`,
  );

  return response.data;
}

export async function clearCart(): Promise<CartMessageResponse> {
  const response = await api.delete<CartMessageResponse>(
    "/cart/clear/",
  );

  return response.data;
}
