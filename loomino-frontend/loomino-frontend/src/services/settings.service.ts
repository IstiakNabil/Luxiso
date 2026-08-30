import api from "@/lib/api";

/** The storefront-safe subset of Site Settings. */
export interface PublicSiteSettings {
  app_name: string;
  email_address: string;
  phone_number: string;
  hotline_number: string;
  currency_name: string;
  currency_symbol: string;
  delivery_charge: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  youtube_url: string;
  linkedin_url: string;
  privacy_policy_link: string;
  terms_conditions_link: string;
  service_hours: string;
  physical_address: string;
  google_map_embed_url: string;
}

export async function getSiteSettings(): Promise<PublicSiteSettings> {
  const res = await api.get("/settings/");
  return res.data;
}
