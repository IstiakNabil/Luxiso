import api from "@/lib/api";

import type {
  AdminHeroSection,
  HeroSectionPayload,
  AdminCustomPage,
  CustomPagePayload,
  AdminOfferBanner,
  OfferBannerPayload,
  AdminSiteBanner,
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

/* ---------------- Hero Sections ---------------- */
const HERO_SECTIONS = "/cms/hero-sections/admin/";

export async function listHeroSections(): Promise<
  AdminHeroSection[]
> {
  const res = await api.get(HERO_SECTIONS);
  return unwrap<AdminHeroSection>(res.data);
}

function buildHeroSectionFormData(
  payload: HeroSectionPayload,
) {
  const body = new FormData();
  if (payload.title !== undefined)
    body.append("title", payload.title);
  if (payload.subtitle !== undefined)
    body.append("subtitle", payload.subtitle);
  if (payload.short_description !== undefined)
    body.append(
      "short_description",
      payload.short_description,
    );
  if (payload.video_url !== undefined)
    body.append("video_url", payload.video_url);
  if (payload.display_order !== undefined)
    body.append(
      "display_order",
      String(payload.display_order),
    );
  body.append(
    "is_active",
    String(payload.is_active ?? true),
  );
  // Only append the image when a new file was actually chosen —
  // omitting the key (as opposed to is_active) correctly leaves
  // the existing image untouched on update.
  if (payload.banner_image)
    body.append("banner_image", payload.banner_image);
  return body;
}

export async function createHeroSection(
  payload: HeroSectionPayload,
): Promise<AdminHeroSection> {
  const res = await api.post(
    HERO_SECTIONS,
    buildHeroSectionFormData(payload),
    { headers: { "Content-Type": undefined } },
  );
  return res.data;
}

export async function updateHeroSection(
  id: number,
  payload: HeroSectionPayload,
): Promise<AdminHeroSection> {
  const res = await api.patch(
    `${HERO_SECTIONS}${id}/`,
    buildHeroSectionFormData(payload),
    { headers: { "Content-Type": undefined } },
  );
  return res.data;
}

export async function deleteHeroSection(
  id: number,
): Promise<void> {
  await api.delete(`${HERO_SECTIONS}${id}/`);
}

export async function toggleHeroSectionActive(
  id: number,
): Promise<AdminHeroSection> {
  const res = await api.post(
    `${HERO_SECTIONS}${id}/toggle-active/`,
    {},
  );
  return res.data;
}

/* ---------------- Custom Pages ---------------- */
const PAGES = "/cms/pages/admin/";

export async function listCustomPages(): Promise<
  AdminCustomPage[]
> {
  const res = await api.get(PAGES);
  return unwrap<AdminCustomPage>(res.data);
}

export async function createCustomPage(
  payload: CustomPagePayload,
): Promise<AdminCustomPage> {
  const res = await api.post(PAGES, payload);
  return res.data;
}

export async function updateCustomPage(
  id: number,
  payload: CustomPagePayload,
): Promise<AdminCustomPage> {
  const res = await api.patch(`${PAGES}${id}/`, payload);
  return res.data;
}

export async function deleteCustomPage(
  id: number,
): Promise<void> {
  await api.delete(`${PAGES}${id}/`);
}

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
