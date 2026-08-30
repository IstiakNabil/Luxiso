import api from "@/lib/api";

export interface AdminSiteSettings {
  app_name: string;
  app_url: string;
  email_address: string;
  admin_notification_email: string;
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
  updated_at: string;
}

export async function getAdminSettings(): Promise<AdminSiteSettings> {
  const res = await api.get("/settings/admin/");
  return res.data;
}

export async function updateAdminSettings(
  payload: Partial<AdminSiteSettings>,
): Promise<AdminSiteSettings> {
  const res = await api.patch("/settings/admin/", payload);
  return res.data;
}
