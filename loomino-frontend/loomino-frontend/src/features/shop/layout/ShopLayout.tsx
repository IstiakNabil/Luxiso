import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import Container from "@/components/layout/Container";

interface ShopLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shop page shell.
 *
 * Desktop keeps the 392px filter sidebar beside a fluid
 * product column. Mobile follows the Figma mobile Shop All
 * frames: a full-width "Filters" button (320x40) that opens
 * the filters as a full-screen sheet, with the products
 * flowing underneath in a 2-up grid.
 */
function ShopLayout({
  sidebar,
  children,
}: ShopLayoutProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Lock background scroll while the mobile sheet is open.
  useEffect(() => {
    if (!filtersOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filtersOpen]);

  return (
    <section className="py-10 lg:py-16">
      <Container>
        {/* Mobile filter trigger */}
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          className="mb-6 flex h-10 w-full items-center justify-center gap-2 border border-[#1F1210] text-[14px] capitalize text-[#1F1210] transition hover:bg-[#1F1210] hover:text-white lg:hidden"
        >
          <SlidersHorizontal size={18} strokeWidth={1.8} />
          Filters
        </button>

        <div className="flex items-start gap-6">
          {/* Sidebar — inline on desktop */}
          <aside className="hidden w-[392px] flex-shrink-0 lg:block">
            {sidebar}
          </aside>

          {/* Products */}
          <main className="w-full min-w-0 lg:w-[808px]">
            {children}
          </main>
        </div>
      </Container>

      {/* Mobile filter sheet */}
      {filtersOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#F0E6D8] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div className="flex h-[74px] shrink-0 items-center justify-between px-5">
            <h2 className="text-[22px] font-semibold capitalize text-[#1F1210]">
              Filters
            </h2>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
              className="text-[#1F1210]"
            >
              <X size={24} strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-4">
            {sidebar}
          </div>

          <div className="shrink-0 px-5 pb-8 pt-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="flex h-10 w-full items-center justify-center bg-[#5C1626] text-[14px] capitalize text-white transition hover:opacity-90"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ShopLayout;
