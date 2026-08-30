import { useState } from "react";

interface PriceFilterProps {
  setMinPrice: (value: string) => void;
  setMaxPrice: (value: string) => void;
}

function PriceFilter({
  setMinPrice,
  setMaxPrice,
}: PriceFilterProps) {
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  function handleApply() {
    setMinPrice(min);
    setMaxPrice(max);
  }

  return (
    <div className="space-y-3">
      <input
        type="number"
        placeholder="Min Price"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2"
      />

      <input
        type="number"
        placeholder="Max Price"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2"
      />

      <button
        onClick={handleApply}
        className="w-full rounded bg-[#6D4C1C] py-2 text-white hover:bg-[#5A3E17]"
      >
        Apply Price
      </button>
    </div>
  );
}

export default PriceFilter;