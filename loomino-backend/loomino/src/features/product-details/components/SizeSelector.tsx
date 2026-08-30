import { useMemo } from "react";

import type { ProductVariant } from "@/types/product";

interface SizeSelectorProps {
  variants: ProductVariant[];
  selectedColor: number | null;
  selectedSize: number | null;
  onSelect: (sizeId: number) => void;
}

function SizeSelector({
  variants,
  selectedColor,
  selectedSize,
  onSelect,
}: SizeSelectorProps) {

    const allSizes = useMemo(() => {
  const unique = new Map<number, ProductVariant["size"]>();

  variants.forEach((variant) => {
    unique.set(variant.size.id, variant.size);
  });

  return [...unique.values()];
}, [variants]);

  const availableSizes = useMemo(() => {
    if (selectedColor === null) return [];

    const filtered = variants.filter(
      (variant) =>
        variant.color.id === selectedColor &&
        variant.available,
    );

    const unique = new Map<number, ProductVariant["size"]>();

    filtered.forEach((variant) => {
      unique.set(variant.size.id, variant.size);
    });

    return [...unique.values()];
  }, [variants, selectedColor]);

  return (
    <div className="mt-8">
      <label
        htmlFor="size"
        className="mb-2 block text-[16px] font-medium text-[#0C0C0C]"
      >
        Size
      </label>

      <select
  id="size"
  disabled={selectedColor === null}
  value={selectedSize ?? ""}
  onChange={(e) => onSelect(Number(e.target.value))}
  className="h-[52px] w-full border border-[#B9AE97] bg-transparent px-4 text-[15px] outline-none focus:border-[#4C300D] disabled:opacity-50"
>
  <option value="">Select Size</option>
        {allSizes.map((size) => {
  const isAvailable = availableSizes.some(
    (availableSize) => availableSize.id === size.id,
  );

  return (
    <option
      key={size.id}
      value={size.id}
      disabled={!isAvailable}
    >
      {size.name}
    </option>
  );
})}

      </select>
    </div>
  );
}

export default SizeSelector;