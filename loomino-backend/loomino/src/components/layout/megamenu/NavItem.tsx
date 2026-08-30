import { useRef, useState } from "react";
import { Link } from "react-router-dom";

import { MEGA_MENUS } from "./menuData";
import MegaMenuPanel from "./MegaMenuPanel";

interface NavItemProps {
  label: string;
  to: string;
}

/**
 * A single nav label. If it has a mega-menu defined, the
 * panel opens on hover/focus and stays open while the cursor
 * is over EITHER the label or the panel.
 *
 * A short close delay bridges the visual gap between the
 * label and the panel so the menu doesn't vanish while the
 * cursor travels down to it.
 */
function NavItem({ label, to }: NavItemProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const menu = MEGA_MENUS[label];

  const openMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };

  const closeMenu = () => {
    // Delay closing so moving the cursor across the gap
    // between the label and the panel doesn't dismiss it.
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <li
      className="static"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <Link
        to={to}
        className="cursor-pointer"
        onFocus={openMenu}
        onBlur={closeMenu}
      >
        {label}
      </Link>

      {menu && open && (
        <MegaMenuPanel
          menu={menu}
          onMouseEnter={openMenu}
          onMouseLeave={closeMenu}
          onNavigate={() => setOpen(false)}
        />
      )}
    </li>
  );
}

export default NavItem;
