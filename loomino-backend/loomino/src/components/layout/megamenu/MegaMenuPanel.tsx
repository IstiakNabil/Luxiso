import { Link } from "react-router-dom";

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
 */
function MegaMenuPanel({
  menu,
  onNavigate,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuPanelProps) {
  const categories = useMenuCategories();

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
                <p className="text-[18px] capitalize text-[#0C0C0C]">
                  {column.title}
                </p>
                <ul className="mt-6 space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        onClick={onNavigate}
                        className="text-[18px] capitalize text-[#0B131D] transition hover:text-[#4C300D] hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MegaMenuPanel;
