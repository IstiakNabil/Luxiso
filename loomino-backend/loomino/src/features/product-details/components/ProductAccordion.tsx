import { ChevronDown, ChevronUp } from "lucide-react";

interface ProductAccordionProps {
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}

function ProductAccordion({
  title,
  content,
  isOpen,
  onToggle,
}: ProductAccordionProps) {
  return (
    <div className="border-x border-t border-[#CBCBCB] bg-white last:border-b">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-5 py-5 text-left"
      >
        <span className="text-[18px] font-semibold text-[#0C0C0C]">
          {title}
        </span>

        {isOpen ? (
          <ChevronUp size={20} className="text-[#4C300D]" />
        ) : (
          <ChevronDown
            size={20}
            className="text-[#606060]"
          />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-[#CBCBCB] p-5">
          <p className="whitespace-pre-line text-[15px] leading-[1.8] text-[#606060]">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductAccordion;
