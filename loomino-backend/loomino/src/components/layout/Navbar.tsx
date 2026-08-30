import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, ShoppingBag } from "lucide-react";

import logo from "@/assets/images/logo.png";
import UserMenu from "./UserMenu";
import NavItem from "./megamenu/NavItem";
import SearchOverlay from "@/features/search/components/SearchOverlay";

function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="font-loomino relative h-[110px] bg-[#A88548]">
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
      <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-[108px]">
        {/* Logo */}
        <Link to="/" aria-label="Loomino home">
          <img
            src={logo}
            alt="Loomino"
            className="h-[86px] w-[259px] object-contain"
          />
        </Link>

        {/* Navigation */}
        <ul className="flex items-center gap-6 text-[18px] font-normal text-white">
          <NavItem label="Collection" to="/shop" />
          <NavItem label="New In" to="/shop" />
          <NavItem label="Modiweek" to="/modiweek" />
          <NavItem label="Plus Size" to="/plus-size" />
          <NavItem label="Sustainability" to="/sustainability" />
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-6 text-white">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <Search size={24} strokeWidth={1.8} />
          </button>

          <UserMenu />

          <Link to="/wishlist" aria-label="Wishlist">
            <Heart size={24} strokeWidth={1.8} />
          </Link>

          <Link to="/cart" aria-label="Cart">
            <ShoppingBag size={24} strokeWidth={1.8} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
