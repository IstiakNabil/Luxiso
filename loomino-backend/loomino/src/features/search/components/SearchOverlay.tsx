import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Header search overlay, matching the Figma Search frame:
 * a full-width white bar drops below the header with an
 * underlined search input, and the page dims behind it.
 * Submitting navigates to the shop filtered by the query.
 */
function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus the field when opened; close on Escape.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () =>
      window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/shop?search=${encodeURIComponent(trimmed)}`);
    setQuery("");
    onClose();
  };

  return (
    <div className="font-loomino fixed inset-0 z-50">
      {/* Dim + blur backdrop */}
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
      />

      {/* White search bar below the header */}
      <div className="absolute left-0 right-0 top-0 bg-white">
        <div className="mx-auto flex h-[152px] max-w-[1920px] items-center px-6 md:px-[108px]">
          <div className="flex w-full items-center gap-4 border-b border-[#ADADAD] pb-4">
            <Search size={24} className="text-[#ADADAD]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Search"
              className="w-full bg-transparent text-[20px] capitalize text-[#0C0C0C] outline-none placeholder:text-[#ADADAD]"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="text-[#202020] transition hover:opacity-70"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchOverlay;
