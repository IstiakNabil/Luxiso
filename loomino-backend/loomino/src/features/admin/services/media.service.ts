import api from "@/lib/api";

import type {
  AdminProductImage,
  AdminBrandDetail,
} from "../types/commerce";

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const paged = data as { results?: T[] };
  return paged.results ?? [];
}

/* ---------------- Product images ---------------- */
const IMAGES = "/products/images/admin/";

export async function listProductImages(
  productId: number,
): Promise<AdminProductImage[]> {
  const res = await api.get(IMAGES, {
    params: { product: productId },
  });
  return unwrap<AdminProductImage>(res.data);
}

export async function uploadProductImage(payload: {
  product: number;
  file: File;
  image_type: string;
  display_order: number;
}): Promise<AdminProductImage> {
  const body = new FormData();
  body.append("product", String(payload.product));
  body.append("image", payload.file);
  body.append("image_type", payload.image_type);
  body.append(
    "display_order",
    String(payload.display_order),
  );

  // Let the browser set the multipart boundary.
  const res = await api.post(IMAGES, body, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

export async function updateProductImage(
  id: number,
  payload: {
    image_type?: string;
    display_order?: number;
  },
): Promise<AdminProductImage> {
  const res = await api.patch(`${IMAGES}${id}/`, payload);
  return res.data;
}

export async function deleteProductImage(
  id: number,
): Promise<void> {
  await api.delete(`${IMAGES}${id}/`);
}

/* ---------------- Brands ---------------- */
const BRANDS = "/products/brands/manage/";

export async function listAdminBrands(): Promise<
  AdminBrandDetail[]
> {
  const res = await api.get(BRANDS);
  return unwrap<AdminBrandDetail>(res.data);
}

export async function createBrand(payload: {
  name: string;
  description?: string;
  is_active?: boolean;
  logo?: File | null;
}): Promise<AdminBrandDetail> {
  const body = new FormData();
  body.append("name", payload.name);
  if (payload.description)
    body.append("description", payload.description);
  body.append(
    "is_active",
    String(payload.is_active ?? true),
  );
  if (payload.logo) body.append("logo", payload.logo);

  const res = await api.post(BRANDS, body, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

export async function updateBrand(
  id: number,
  payload: {
    name?: string;
    description?: string;
    is_active?: boolean;
    logo?: File | null;
  },
): Promise<AdminBrandDetail> {
  const body = new FormData();
  if (payload.name !== undefined)
    body.append("name", payload.name);
  if (payload.description !== undefined)
    body.append("description", payload.description ?? "");
  if (payload.is_active !== undefined)
    body.append("is_active", String(payload.is_active));
  if (payload.logo) body.append("logo", payload.logo);

  const res = await api.patch(`${BRANDS}${id}/`, body, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

export async function deleteBrand(
  id: number,
): Promise<void> {
  await api.delete(`${BRANDS}${id}/`);
}
