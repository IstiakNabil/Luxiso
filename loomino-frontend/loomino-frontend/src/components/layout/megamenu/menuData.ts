/**
 * Nav mega-menu content — ONLY links backed by real backend
 * functionality. Merchandising-only labels from the Figma
 * design (Bundles, Occasion Wear, Matching Set, Suiting) are
 * intentionally omitted until a Collection concept exists on
 * the backend, to avoid fake filters.
 *
 * Each menu's `tiles` are the small photo previews shown on
 * the right of the panel. Their images come from CMS > Site
 * Banners (see `bannerKey`), so an admin can swap them without
 * touching code — but the label + destination stay hardcoded
 * here so every tile always points somewhere real.
 *
 * Sustainability's links deep-link into real sections of
 * SustainabilityPage.tsx via anchor ids (#mission, #processing,
 * etc.) — not fabricated destinations.
 *
 * Supported backend filters on /shop:
 *   - is_new_arrival=true        (New In)
 *   - is_featured=true           (Featured)
 *   - category=<slug>            (real categories, loaded live)
 */

export interface MenuLink {
  label: string;
  to: string;
}

export interface MenuColumn {
  title: string;
  links: MenuLink[];
  /** When true, this column is filled with live categories. */
  dynamicCategories?: boolean;
}

export interface MenuTile {
  label: string;
  to: string;
  /** CMS > Site Banners key that supplies this tile's photo. */
  bannerKey: string;
}

export interface MegaMenu {
  columns: MenuColumn[];
  tiles: MenuTile[];
  /**
   * Tile photo size in px. New In's 208×420 is pulled directly
   * from the real Figma mega-menu frame (not eyeballed).
   * Collection and On Sale were sized to match Sustainability
   * (392×438) per request, rather than their own Figma frame
   * (Collection's real spec was 288×420) — On Sale has no
   * Figma reference at all, since it wasn't in the original
   * design.
   */
  tileWidth: number;
  tileHeight: number;
}

export const MEGA_MENUS: Record<string, MegaMenu> = {
  Collection: {
    columns: [
      {
        title: "Shop",
        links: [
          { label: "Shop All", to: "/shop" },
          { label: "New In", to: "/shop?is_new_arrival=true" },
          { label: "Featured", to: "/shop?is_featured=true" },
          { label: "Best Sellers", to: "/best-sellers" },
        ],
      },
      {
        title: "Category",
        links: [],
        dynamicCategories: true,
      },
    ],
    tiles: [
      {
        label: "Featured Picks",
        to: "/shop?is_featured=true",
        bannerKey: "megamenu_collection_1",
      },
      {
        label: "Best Sellers",
        to: "/best-sellers",
        bannerKey: "megamenu_collection_2",
      },
    ],
    tileWidth: 392,
    tileHeight: 438,
  },

  "New In": {
    columns: [
      {
        title: "Just Arrived",
        links: [
          {
            label: "All New Arrivals",
            to: "/shop?is_new_arrival=true",
          },
        ],
      },
      {
        title: "Category",
        links: [],
        dynamicCategories: true,
      },
    ],
    tiles: [
      {
        label: "New Arrivals",
        to: "/shop?is_new_arrival=true",
        bannerKey: "megamenu_new_in_1",
      },
      {
        label: "Featured",
        to: "/shop?is_featured=true",
        bannerKey: "megamenu_new_in_2",
      },
      {
        label: "Best Sellers",
        to: "/best-sellers",
        bannerKey: "megamenu_new_in_3",
      },
    ],
    tileWidth: 208,
    tileHeight: 420,
  },

  "On Sale": {
    columns: [
      {
        title: "On Sale",
        links: [
          { label: "This Week's Looks", to: "/on-sale" },
        ],
      },
      {
        title: "Category",
        links: [],
        dynamicCategories: true,
      },
    ],
    tiles: [
      {
        label: "This Week's Looks",
        to: "/on-sale",
        bannerKey: "megamenu_on_sale_1",
      },
      {
        label: "New In",
        to: "/shop?is_new_arrival=true",
        bannerKey: "megamenu_on_sale_2",
      },
    ],
    tileWidth: 392,
    tileHeight: 438,
  },

  Sustainability: {
    columns: [
      {
        title: "Sustainability",
        links: [
          { label: "Mission", to: "/sustainability#mission" },
          {
            label: "Processing",
            to: "/sustainability#processing",
          },
          {
            label: "Materials",
            to: "/sustainability#materials",
          },
          {
            label: "Packaging",
            to: "/sustainability#packaging",
          },
          {
            label: "Product Care",
            to: "/sustainability#product-caring",
          },
          {
            label: "Our Suppliers",
            to: "/sustainability#suppliers",
          },
        ],
      },
    ],
    tiles: [
      {
        label: "Our Story",
        to: "/sustainability",
        bannerKey: "megamenu_sustainability_1",
      },
      {
        label: "Our Suppliers",
        to: "/sustainability#suppliers",
        bannerKey: "megamenu_sustainability_2",
      },
    ],
    tileWidth: 392,
    tileHeight: 438,
  },
};
