export interface AdminHeroSection {
  id: number;
  title: string;
  subtitle: string;
  short_description: string;
  video_url: string;
  banner_image: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeroSectionPayload {
  title?: string;
  subtitle?: string;
  short_description?: string;
  video_url?: string;
  display_order?: number;
  is_active?: boolean;
  banner_image?: File | null;
}

export interface AdminCustomPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomPagePayload {
  title?: string;
  content?: string;
  is_active?: boolean;
}

export type OfferBannerPlacement =
  | "mega_menu"
  | "offer_section";

export interface AdminOfferBanner {
  id: number;
  title: string;
  subtitle: string;
  placement_type: OfferBannerPlacement;
  image: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfferBannerPayload {
  title?: string;
  subtitle?: string;
  placement_type?: OfferBannerPlacement;
  display_order?: number;
  is_active?: boolean;
  image?: File | null;
}

export type SiteBannerKey =
  | "collection_kurti"
  | "collection_shrugs"
  | "collection_saree"
  | "collection_kameez"
  | "sustainability"
  | "hero_slide_1"
  | "hero_slide_2"
  | "hero_slide_3"
  | "modiweek_feature"
  | "sustainability_hero"
  | "sustainability_processing"
  | "sustainability_materials"
  | "sustainability_packaging"
  | "sustainability_product_caring"
  | "sustainability_team_1"
  | "sustainability_team_2"
  | "sustainability_team_3"
  | "sustainability_team_4"
  | "sustainability_team_5"
  | "sustainability_team_6";

export interface AdminSiteBanner {
  id: number;
  key: SiteBannerKey;
  label: string;
  image: string | null;
  updated_at: string;
}
