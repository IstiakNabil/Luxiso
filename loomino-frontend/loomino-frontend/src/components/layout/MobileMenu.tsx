import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

import logo from "@/assets/images/logo.png";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSiteBanners } from "@/features/home/hooks/useSiteBanners";
import { getMediaUrl } from "@/lib/utils";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Full-screen mobile navigation drawer, matching the Figma
 * mobile hamburger frame (node 1:4192):
 *
 *   HEADER            360x64
 *   nav block         320 wide at x=20, starting y=96
 *   secondary links   25px tall on a 57px pitch
 *   button row        two 152x40 buttons, 16px apart
 *
 * Rendered only under `lg`; the desktop navbar keeps its
 * hover mega-menus.
 */

const PRIMARY_LINKS = [
  { label: "Collection", to: "/shop" },
  { label: "New In", to: "/shop" },
  { label: "On Sale", to: "/on-sale" },
  { label: "Plus Size", to: "/plus-size" },
  { label: "Our Story", to: "/sustainability" },
];

const SECONDARY_LINKS = [
  { label: "Best Sellers", to: "/best-sellers" },
  { label: "FAQs", to: "/faqs" },
  { label: "Contact Us", to: "/contact" },
];

function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { isAuthenticated } = useAuth();
  const { logout, isPending } = useLogout();
  const { data: banners } = useSiteBanners();
  const logoBanner = banners?.find((b) => b.key === "logo");
  const logoSrc = (logoBanner?.image ? getMediaUrl(logoBanner.image) : null) ?? logo;

  // Lock background scrolling while the drawer is open, and
  // close it on Escape.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#5C1626] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      {/* Header row — mirrors the 64px mobile header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="text-white"
        >
          <X size={24} strokeWidth={1.8} />
        </button>

        <Link to="/" onClick={onClose} aria-label="Loomino home">
          <img
            src={logoSrc}
            alt="Loomino"
            className="h-10 w-[138px] object-contain"
          />
        </Link>

        {/* Spacer keeps the logo optically centred */}
        <span className="w-6" aria-hidden />
      </div>

      {/* Nav block */}
      <nav className="flex-1 overflow-y-auto px-5 pt-4">
        <ul className="flex flex-col gap-6">
          {PRIMARY_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                onClick={onClose}
                className="block text-[22px] font-medium capitalize text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-10 flex flex-col gap-8 border-t border-white/25 pt-8">
          {SECONDARY_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={link.to}
                onClick={onClose}
                className="block text-[16px] capitalize text-white"
              >
                {link.label}
              </Link>
            </li>
          ))}

          {isAuthenticated && (
            <>
              <li>
                <Link
                  to="/orders"
                  onClick={onClose}
                  className="block text-[16px] capitalize text-white"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/account/profile"
                  onClick={onClose}
                  className="block text-[16px] capitalize text-white"
                >
                  My Account
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Button row — two 152x40 buttons, 16px apart (320 total) */}
      <div className="shrink-0 px-5 pb-8 pt-6">
        {isAuthenticated ? (
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            disabled={isPending}
            className="flex h-10 w-full items-center justify-center bg-[#5C1626] text-[14px] capitalize text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Log Out
          </button>
        ) : (
          <div className="flex gap-4">
            <Link
              to="/login"
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center bg-[#5C1626] text-[14px] capitalize text-white transition hover:opacity-90"
            >
              Log In
            </Link>
            <Link
              to="/register"
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center border border-white text-[14px] capitalize text-white transition hover:bg-white/10"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileMenu;
