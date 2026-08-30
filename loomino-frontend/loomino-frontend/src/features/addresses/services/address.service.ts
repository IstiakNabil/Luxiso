import api from "@/lib/api";

import type { Address, AddressInput } from "../types/address";

export async function getAddresses(): Promise<Address[]> {
  const response = await api.get<Address[]>(
    "/auth/addresses/",
  );

  return response.data;
}

export async function createAddress(
  payload: AddressInput,
): Promise<Address> {
  const response = await api.post<Address>(
    "/auth/addresses/",
    payload,
  );

  return response.data;
}

export async function updateAddress(
  id: number,
  payload: Partial<AddressInput>,
): Promise<Address> {
  const response = await api.patch<Address>(
    `/auth/addresses/${id}/`,
    payload,
  );

  return response.data;
}

export async function deleteAddress(
  id: number,
): Promise<void> {
  await api.delete(`/auth/addresses/${id}/delete/`);
}

export async function setDefaultAddress(
  id: number,
): Promise<void> {
  await api.post(`/auth/addresses/${id}/default/`);
}
