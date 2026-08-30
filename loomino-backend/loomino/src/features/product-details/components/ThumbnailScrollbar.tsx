import { ChevronUp, ChevronDown } from "lucide-react";
import type { RefObject } from "react";

interface ThumbnailScrollbarProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

const SCROLL_AMOUNT = 176; // 160 thumbnail + 16 gap

function ThumbnailScrollbar({
  containerRef,
}: ThumbnailScrollbarProps) {
  const scroll = (direction: "up" | "down") => {
    if (!containerRef.current) return;

    containerRef.current.scrollBy({
      top: direction === "up" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex h-[512px] w-[16px] flex-col items-center justify-between">
      <button
        type="button"
        onClick={() => scroll("up")}
        className="flex h-4 w-4 items-center justify-center text-gray-500 hover:text-black"
      >
        <ChevronUp size={12} />
      </button>

      <div className="flex-1 w-[2px] bg-[#E5E5E5] mx-auto relative">
        <div className="absolute top-0 left-1/2 h-16 w-[4px] -translate-x-1/2 rounded-full bg-[#9E9E9E]" />
      </div>

      <button
        type="button"
        onClick={() => scroll("down")}
        className="flex h-4 w-4 items-center justify-center text-gray-500 hover:text-black"
      >
        <ChevronDown size={12} />
      </button>
    </div>
  );
}

export default ThumbnailScrollbar;