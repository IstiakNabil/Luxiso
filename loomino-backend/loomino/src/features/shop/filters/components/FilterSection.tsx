import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  /** Open by default. */
  defaultOpen?: boolean;
}

/**
 * Collapsible filter section styled to the Figma Shop All
 * Filters design: a solid brown (#4C300D) bar with a bold
 * white title and a chevron that rotates when open. The
 * body reveals below on a cream/panel background.
 */
function FilterSection({
  title,
  children,
  defaultOpen = false,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="font-loomino w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex h-[48px] w-full items-center gap-4 bg-[#4C300D] px-4 text-left"
      >
        <span className="flex-1 text-[16px] font-bold capitalize leading-[1.4] text-white">
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-white transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border border-t-0 border-[#CBCBCB] bg-[#F0F2EF] p-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default FilterSection;
