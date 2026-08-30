import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag } from "lucide-react";

import logo from "@/assets/images/logo.png";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";
import NavItem from "./megamenu/NavItem";
import SearchOverlay from "@/features/search/components/SearchOverlay";
import { useCart } from "@/features/cart/hooks/useCart";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useSiteBanners } from "@/features/home/hooks/useSiteBanners";
import { getMediaUrl } from "@/lib/utils";

/** Small count bubble shared by the wishlist and cart icons. */
function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#5C1626] px-1 text-[11px] font-semibold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/**
 * Site header.
 *
 * Mobile follows the Figma mobile HEADER exactly: 64px bar,
 * 138x40 logo, 24px icons. Desktop keeps the 110px bar with
 * the hover mega-menus.
 *
 * The two layouts share one DOM tree — only the pieces that
 * genuinely differ are toggled — so the cart and wishlist
 * links are never duplicated.
 */
function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const { data: banners } = useSiteBanners();

  const cartCount = cart?.total_items ?? 0;
  const wishlistCount = wishlist?.length ?? 0;
  // CMS > Site Banners > Site Logo -- falls back to the bundled
  // default until an admin uploads a replacement.
  const logoBanner = banners?.find((b) => b.key === "logo");
  const logoSrc = (logoBanner?.image ? getMediaUrl(logoBanner.image) : null) ?? logo;

  return (
    <nav className="font-loomino relative h-16 bg-[#5C1626] lg:h-[110px]">
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-5 md:px-10 lg:px-[108px]">
        {/* Left cluster — mobile only */}
        <div className="flex items-center gap-3 text-white lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" strokeWidth={1.8} />
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search className="h-6 w-6" strokeWidth={1.8} />
          </button>
        </div>

        {/* Logo — 138x40 on mobile, 259x86 on desktop */}
        <Link to="/" aria-label="Loomino home">
          <img
            src={logoSrc}
            alt="Loomino"
            className="h-10 w-[138px] object-contain lg:h-[86px] lg:w-[259px]"
          />
        </Link>

        {/* Primary navigation — desktop only */}
        <ul
          className="hidden items-center text-[18px] font-normal text-white lg:flex"
          style={{ gap: "clamp(20px, calc(100vw * 32 / 1440), 42.67px)" }}
        >
          <NavItem label="Collection" to="/shop" />
          <NavItem label="New In" to="/shop" />
          <NavItem label="On Sale" to="/on-sale" />
          <NavItem label="Plus Size" to="/plus-size" />
          <NavItem label="Our Story" to="/sustainability" />
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-3 text-white lg:gap-6">
          {/* Search sits on the left on mobile, here on desktop */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="hidden lg:block"
          >
            <Search className="h-6 w-6" strokeWidth={1.8} />
          </button>

          <div className="hidden lg:block">
            <UserMenu />
          </div>

          <Link to="/wishlist" aria-label="Wishlist" className="relative">
            <Heart className="h-6 w-6" strokeWidth={1.8} />
            <CountBadge count={wishlistCount} />
          </Link>

          <Link to="/cart" aria-label="Cart" className="relative">
            <ShoppingBag className="h-6 w-6" strokeWidth={1.8} />
            <CountBadge count={cartCount} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
