import { ArrowUp } from "lucide-react";

function FooterBottom() {
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <div className="mt-10 flex flex-col-reverse items-start gap-6 border-t border-[#2B2F36] pt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
      <p className="text-xs text-[#B8BDC7] sm:text-sm">
        © 2026 Loomino. All Rights Reserved.
      </p>

      <button
        onClick={scrollToTop}
        className="flex h-12 w-12 items-center justify-center border border-[#7A5B2E] text-[#D4B483] transition hover:bg-[#7A5B2E] hover:text-white"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
}

export default FooterBottom;