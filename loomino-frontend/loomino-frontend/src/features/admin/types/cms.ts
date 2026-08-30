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
  | "our_story"
  | "hero_slide_1"
  | "hero_slide_2"
  | "hero_slide_3"
  | "hero_slide_1_mobile"
  | "hero_slide_2_mobile"
  | "hero_slide_3_mobile"
  | "on_sale_feature"
  | "community_1"
  | "community_2"
  | "community_3"
  | "community_4"
  | "community_5"
  | "shop_hero"
  | "shop_hero_mobile"
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
  | "sustainability_team_6"
  | "megamenu_collection_1"
  | "megamenu_collection_2"
  | "megamenu_new_in_1"
  | "megamenu_new_in_2"
  | "megamenu_on_sale_1"
  | "megamenu_on_sale_2"
  | "megamenu_sustainability_1"
  | "megamenu_sustainability_2";

export interface AdminSiteBanner {
  id: number;
  key: SiteBannerKey;
  label: string;
  image: string | null;
  eyebrow: string;
  heading: string;
  body: string;
  cta_label: string;
  updated_at: string;
}

export interface SiteBannerTextPayload {
  eyebrow?: string;
  heading?: string;
  body?: string;
  cta_label?: string;
}
