import api from "@/lib/api";

export interface SiteBanner {
  key: string;
  label: string;
  image: string | null;
  eyebrow: string;
  heading: string;
  body: string;
  cta_label: string;
}

/** The current image for every fixed site-banner slot (e.g.
 * Collection tiles, Sustainability). No auth required. */
export async function getSiteBanners(): Promise<
  SiteBanner[]
> {
  const res = await api.get("/cms/site-banners/");
  return res.data;
}
