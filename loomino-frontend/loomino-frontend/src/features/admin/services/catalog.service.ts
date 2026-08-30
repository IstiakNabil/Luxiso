import api from "@/lib/api";

import type {
  AdminCategory,
  AdminColor,
  AdminSize,
} from "../types/catalog";

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const paged = data as { results?: T[] };
  return paged.results ?? [];
}

/* ---------------- Categories ---------------- */
const CATEGORIES = "/products/categories/manage/";

export async function listCategories(): Promise<
  AdminCategory[]
> {
  const res = await api.get(CATEGORIES);
  return unwrap<AdminCategory>(res.data);
}

export interface CategoryPayload {
  name?: string;
  description?: string;
  display_order?: number;
  is_active?: boolean;
  banner_image?: File | null;
  icon_image?: File | null;
}

function buildCategoryFormData(payload: CategoryPayload) {
  const body = new FormData();
  if (payload.name !== undefined)
    body.append("name", payload.name);
  if (payload.description !== undefined)
    body.append("description", payload.description);
  if (payload.display_order !== undefined)
    body.append(
      "display_order",
      String(payload.display_order),
    );
  if (payload.is_active !== undefined)
    body.append("is_active", String(payload.is_active));
  // Only append image fields when a new file was actually
  // chosen — omitting the key leaves the existing image
  // untouched on update, rather than clearing it.
  if (payload.banner_image)
    body.append("banner_image", payload.banner_image);
  if (payload.icon_image)
    body.append("icon_image", payload.icon_image);
  return body;
}

export async function createCategory(
  payload: CategoryPayload,
): Promise<AdminCategory> {
  const res = await api.post(
    CATEGORIES,
    buildCategoryFormData(payload),
    { headers: { "Content-Type": undefined } },
  );
  return res.data;
}

export async function updateCategory(
  id: number,
  payload: CategoryPayload,
): Promise<AdminCategory> {
  const res = await api.patch(
    `${CATEGORIES}${id}/`,
    buildCategoryFormData(payload),
    { headers: { "Content-Type": undefined } },
  );
  return res.data;
}

export async function deleteCategory(
  id: number,
): Promise<void> {
  await api.delete(`${CATEGORIES}${id}/`);
}

/* ---------------- Colors ---------------- */
const COLORS = "/products/colors/manage/";

export async function listColors(): Promise<AdminColor[]> {
  const res = await api.get(COLORS);
  return unwrap<AdminColor>(res.data);
}

export async function createColor(
  payload: Partial<AdminColor>,
): Promise<AdminColor> {
  const res = await api.post(COLORS, payload);
  return res.data;
}

export async function updateColor(
  id: number,
  payload: Partial<AdminColor>,
): Promise<AdminColor> {
  const res = await api.patch(`${COLORS}${id}/`, payload);
  return res.data;
}

export async function deleteColor(
  id: number,
): Promise<void> {
  await api.delete(`${COLORS}${id}/`);
}

/* ---------------- Sizes ---------------- */
const SIZES = "/products/sizes/manage/";

export async function listSizes(): Promise<AdminSize[]> {
  const res = await api.get(SIZES);
  return unwrap<AdminSize>(res.data);
}

export async function createSize(
  payload: Partial<AdminSize>,
): Promise<AdminSize> {
  const res = await api.post(SIZES, payload);
  return res.data;
}

export async function updateSize(
  id: number,
  payload: Partial<AdminSize>,
): Promise<AdminSize> {
  const res = await api.patch(`${SIZES}${id}/`, payload);
  return res.data;
}

export async function deleteSize(
  id: number,
): Promise<void> {
  await api.delete(`${SIZES}${id}/`);
}
