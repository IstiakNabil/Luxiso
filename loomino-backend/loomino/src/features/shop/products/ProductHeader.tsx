import { useState } from "react";

interface ProductHeaderProps {
  totalProducts: number;

  search: string;

  setSearch: (value: string) => void;
}

function ProductHeader({
  totalProducts,
  search,
  setSearch,
}: ProductHeaderProps) {

  const [searchText, setSearchText] = useState(search);

  return (
    <div className="mb-8">
      <input
  type="text"
  placeholder="Search products..."
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      setSearch(searchText);
    }
  }}
  className="mb-6 w-full rounded-md border border-[#D8D8D8] px-4 py-3 outline-none transition focus:border-[#6D4C1C]"
/>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#666]">
          Showing {totalProducts} products
        </p>
      </div>
    </div>
  );
}
console.log("ProductHeader rendered");
export default ProductHeader;