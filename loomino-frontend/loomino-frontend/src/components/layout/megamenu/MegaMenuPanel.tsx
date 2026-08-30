import { Link } from "react-router-dom";

import { getMediaUrl } from "@/lib/utils";
import ImagePlaceholder from "@/features/sustainability/components/ImagePlaceholder";
import { useSiteBanners } from "@/features/home/hooks/useSiteBanners";
import type { MegaMenu } from "./menuData";
import { useMenuCategories } from "./useMenuCategories";

interface MegaMenuPanelProps {
  menu: MegaMenu;
  onNavigate: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

/**
 * The drop-down panel for a nav item. Full-width cream
 * panel with text columns, matching the Figma menu frames.
 * Columns marked `dynamicCategories` are filled with live
 * categories from the API. Keeps the menu open while hovered.
 *
 * The right side shows a couple of photo tiles per menu
 * (`menu.tiles`) — their images come from CMS > Site Banners,
 * falling back to the same gray placeholder used elsewhere on
 * the site until an admin uploads one.
 */
function MegaMenuPanel({
  menu,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuPanelProps) {
  const categories = useMenuCategories();
  const { data: banners } = useSiteBanners();

  return (
    <div
      className="absolute left-0 right-0 top-full z-40 bg-[#F0E6D8]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Invisible bridge: fills the gap between the header
          and the panel so the cursor never crosses dead space. */}
      <div className="h-3 w-full" />

      <div className="border-t border-[#CBCBCB] shadow-lg">
        <div className="mx-auto flex max-w-[1920px] gap-16 px-[108px] py-12">
          {/* Text columns */}
          {menu.columns.map((column) => {
            const links = column.dynamicCategories
              ? categories.map((category) => ({
                  label: category.name,
                  to: `/shop?category=${category.slug}`,
                }))
              : column.links;

            return (
              <div
                key={column.title}
                className="min-w-[154px]"
              >
                <p className="text-[18px] capitalize text-[#1F1210]">
                  {column.title}
                </p>
                <ul className="mt-6 space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        onClick={onNavigate}
                        className="text-[18px] capitalize text-[#0B131D] transition hover:text-[#8A6A2E] hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Photo tiles */}
          {menu.tiles.length > 0 && (
            <div className="ml-auto flex gap-6">
              {menu.tiles.map((tile) => {
                const banner = banners?.find(
                  (b) => b.key === tile.bannerKey,
                );
                const imageUrl = banner?.image
                  ? getMediaUrl(banner.image)
                  : null;

                return (
                  <Link
                    key={tile.bannerKey}
                    to={tile.to}
                    onClick={onNavigate}
                    className="group block shrink-0"
                    style={{ width: menu.tileWidth }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={tile.label}
                        className="w-full object-cover transition group-hover:opacity-90"
                        style={{ height: menu.tileHeight }}
                      />
                    ) : (
                      <ImagePlaceholder
                        label={tile.label}
                        className="w-full"
                        style={{ height: menu.tileHeight }}
                      />
                    )}
                    <p className="mt-3 text-[16px] text-[#1F1210] group-hover:underline">
                      {tile.label}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MegaMenuPanel;
