import { useMemo } from "react";
import type { ProductColor, ProductVariant } from "@/types/product";


interface ColorSelectorProps {
  variants: ProductVariant[];
  selectedColor: number | null;
  onSelect: (colorId: number) => void;
}

function ColorSelector({
  variants,
  selectedColor,
  onSelect,
}: ColorSelectorProps) {
  const colors = useMemo(() => {
    const unique = new Map<number, ProductColor>();

    variants.forEach((variant) => {
      unique.set(variant.color.id, variant.color);
    });

    return [...unique.values()];
  }, [variants]);

  return (
    <div className="mt-8">
      <p className="mb-4 text-[16px] font-medium text-[#1F1210]">Colors</p>

      <div className="flex gap-3">
        {colors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => onSelect(color.id)}
            className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
              selectedColor === color.id
                ? "border-[#8A6A2E]"
                : "border-[#CBCBCB]"
            }`}
            title={color.name}
          >
            <span
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor: color.hex_code,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ColorSelector;