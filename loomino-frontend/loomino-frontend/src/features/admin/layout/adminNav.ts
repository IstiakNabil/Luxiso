/**
 * Admin sidebar navigation, grouped as in the reference
 * design: Main, Catalog, Commerce, Content.
 */
export interface AdminNavChild {
  label: string;
  to: string;
}

export interface AdminNavItem {
  label: string;
  to?: string;
  icon: string;
  children?: AdminNavChild[];
}

export interface AdminNavSection {
  heading: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV: AdminNavSection[] = [
  {
    heading: "Main",
    items: [
      { label: "Dashboard", to: "/admin", icon: "home" },
    ],
  },
  {
    heading: "Catalog",
    items: [
      {
        label: "Products",
        icon: "package",
        children: [
          { label: "All Products", to: "/admin/products" },
          { label: "Categories", to: "/admin/categories" },
          { label: "Types", to: "/admin/types" },
          { label: "Colors", to: "/admin/colors" },
          { label: "Sizes", to: "/admin/sizes" },
          {
            label: "Variant Products",
            to: "/admin/variants",
          },
          {
            label: "Product Reviews",
            to: "/admin/reviews",
          },
        ],
      },
    ],
  },
  {
    heading: "Commerce",
    items: [
      { label: "Orders", to: "/admin/orders", icon: "cart" },
      {
        label: "Coupons",
        to: "/admin/coupons",
        icon: "ticket",
      },
      {
        label: "Customers",
        to: "/admin/customers",
        icon: "users",
      },
      {
        label: "Customer Mails",
        to: "/admin/mails",
        icon: "mail",
      },
      {
        label: "Newsletters",
        to: "/admin/newsletters",
        icon: "send",
      },
    ],
  },
  {
    heading: "Content",
    items: [
      {
        label: "CMS",
        icon: "layout",
        children: [
          {
            label: "Offer Banner",
            to: "/admin/offer-banners",
          },
          {
            label: "Site Banners",
            to: "/admin/site-banners",
          },
        ],
      },
    ],
  },
  {
    heading: "System",
    items: [
      { label: "Settings", to: "/admin/settings", icon: "settings" },
    ],
  },
];
