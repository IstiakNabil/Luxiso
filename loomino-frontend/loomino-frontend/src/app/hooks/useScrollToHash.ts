import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * React Router doesn't scroll to `#section` anchors on
 * navigation by default (unlike traditional multi-page sites).
 * This restores that behavior site-wide, so links like
 * `/sustainability#mission` actually land on the right section
 * instead of just the top of the page.
 */
export function useScrollToHash() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;

    // Wait a tick for the new page's content to mount before
    // looking up the element.
    const id = hash.slice(1);
    const timer = setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash, pathname]);
}
