/**
 * Nav mega-menu content — ONLY links backed by real backend
 * functionality. Merchandising-only labels from the Figma
 * design (Bundles, Occasion Wear, Matching Set, Suiting,
 * Modiweek) are intentionally omitted until a Collection
 * concept exists on the backend, to avoid fake filters.
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
}

export interface MegaMenu {
  columns: MenuColumn[];
  tiles: MenuTile[];
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
    tiles: [],
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
    tiles: [],
  },
};
