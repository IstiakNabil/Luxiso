import api from "@/lib/api";

import type {
  AdminOfferBanner,
  OfferBannerPayload,
  AdminSiteBanner,
  SiteBannerTextPayload,
} from "../types/cms";

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const paged = data as { results?: T[] };
  return paged.results ?? [];
}

/**
 * IMPORTANT: DRF's BooleanField has special "HTML checkbox"
 * handling for multipart/form-data — if `is_active` is left out
 * of the FormData entirely, DRF treats that as an explicit
 * `false` rather than falling back to the model's default. So
 * every multipart request below always appends `is_active`
 * explicitly, even when the caller didn't change it.
 */

/* ---------------- Offer Banners ---------------- */
const OFFER_BANNERS = "/cms/banners/admin/";

export async function listOfferBanners(): Promise<
  AdminOfferBanner[]
> {
  const res = await api.get(OFFER_BANNERS);
  return unwrap<AdminOfferBanner>(res.data);
}

function buildOfferBannerFormData(
  payload: OfferBannerPayload,
) {
  const body = new FormData();
  if (payload.title !== undefined)
    body.append("title", payload.title);
  if (payload.subtitle !== undefined)
    body.append("subtitle", payload.subtitle);
  if (payload.placement_type !== undefined)
    body.append(
      "placement_type",
      payload.placement_type,
    );
  if (payload.display_order !== undefined)
    body.append(
      "display_order",
      String(payload.display_order),
    );
  body.append(
    "is_active",
    String(payload.is_active ?? true),
  );
  if (payload.image)
    body.append("image", payload.image);
  return body;
}

export async function createOfferBanner(
  payload: OfferBannerPayload,
): Promise<AdminOfferBanner> {
  const res = await api.post(
    OFFER_BANNERS,
    buildOfferBannerFormData(payload),
    { headers: { "Content-Type": undefined } },
  );
  return res.data;
}

export async function updateOfferBanner(
  id: number,
  payload: OfferBannerPayload,
): Promise<AdminOfferBanner> {
  const res = await api.patch(
    `${OFFER_BANNERS}${id}/`,
    buildOfferBannerFormData(payload),
    { headers: { "Content-Type": undefined } },
  );
  return res.data;
}

export async function deleteOfferBanner(
  id: number,
): Promise<void> {
  await api.delete(`${OFFER_BANNERS}${id}/`);
}

export async function toggleOfferBannerActive(
  id: number,
): Promise<AdminOfferBanner> {
  const res = await api.post(
    `${OFFER_BANNERS}${id}/toggle-active/`,
    {},
  );
  return res.data;
}

/* ---------------- Site Banners (fixed slots) ---------------- */
const SITE_BANNERS = "/cms/site-banners/admin/";

export async function listSiteBanners(): Promise<
  AdminSiteBanner[]
> {
  const res = await api.get(SITE_BANNERS);
  return res.data;
}

export async function updateSiteBanner(
  key: string,
  image: File,
): Promise<AdminSiteBanner> {
  const body = new FormData();
  body.append("image", image);
  const res = await api.patch(`${SITE_BANNERS}${key}/`, body, {
    headers: { "Content-Type": undefined },
  });
  return res.data;
}

/**
 * Update the editable copy on a text-carrying slot (e.g. the
 * Our Story band). Sent as JSON — no file involved — so it
 * doesn't touch the image on that slot.
 */
export async function updateSiteBannerText(
  key: string,
  payload: SiteBannerTextPayload,
): Promise<AdminSiteBanner> {
  const res = await api.patch(`${SITE_BANNERS}${key}/`, payload);
  return res.data;
}
