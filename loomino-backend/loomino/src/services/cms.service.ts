import api from "@/lib/api";

export interface HeroSection {
  id: number;
  title: string;
  subtitle: string;
  short_description: string;
  video_url: string;
  banner_image: string | null;
  display_order: number;
}

/** Active hero sections, in display order. No auth required. */
export async function getHeroSections(): Promise<
  HeroSection[]
> {
  const res = await api.get("/cms/hero-sections/");
  const data = res.data;
  return Array.isArray(data) ? data : (data.results ?? []);
}

export interface SiteBanner {
  key: string;
  label: string;
  image: string | null;
}

/** The current image for every fixed site-banner slot (e.g.
 * Collection tiles, Sustainability). No auth required. */
export async function getSiteBanners(): Promise<
  SiteBanner[]
> {
  const res = await api.get("/cms/site-banners/");
  return res.data;
}
