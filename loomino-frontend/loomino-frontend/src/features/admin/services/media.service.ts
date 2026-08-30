import api from "@/lib/api";

import type {
  AdminProductImage,
  AdminTypeDetail,
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

/* ---------------- Types ---------------- */
const TYPES = "/products/types/manage/";

export async function listAdminTypes(): Promise<
  AdminTypeDetail[]
> {
  const res = await api.get(TYPES);
  return unwrap<AdminTypeDetail>(res.data);
}

export async function createType(payload: {
  name: string;
  description?: string;
  is_active?: boolean;
  logo?: File | null;
  /** Category IDs this type belongs to. */
  categories?: number[];
}): Promise<AdminTypeDetail> {
  const body = new FormData();
  body.append("name", payload.name);
  if (payload.description)
    body.append("description", payload.description);
  body.append(
    "is_active",
    String(payload.is_active ?? true),
  );
  if (payload.logo) body.append("logo", payload.logo);
  for (const id of payload.categories ?? []) {
    body.append("categories", String(id));
  }

  const res = await api.post(TYPES, body, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

export async function updateType(
  id: number,
  payload: {
    name?: string;
    description?: string;
    is_active?: boolean;
    logo?: File | null;
    categories?: number[];
  },
): Promise<AdminTypeDetail> {
  const body = new FormData();
  if (payload.name !== undefined)
    body.append("name", payload.name);
  if (payload.description !== undefined)
    body.append("description", payload.description ?? "");
  if (payload.is_active !== undefined)
    body.append("is_active", String(payload.is_active));
  if (payload.logo) body.append("logo", payload.logo);
  if (payload.categories !== undefined) {
    // Note: if you need to clear a Type down to zero
    // categories, this multipart PATCH can't represent an
    // explicit empty list — send at least one, or clear it
    // from the Django admin instead.
    for (const id of payload.categories) {
      body.append("categories", String(id));
    }
  }

  const res = await api.patch(`${TYPES}${id}/`, body, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

export async function deleteType(
  id: number,
): Promise<void> {
  await api.delete(`${TYPES}${id}/`);
}
