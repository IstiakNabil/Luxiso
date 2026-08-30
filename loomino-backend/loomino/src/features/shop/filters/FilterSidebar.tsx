import AppliedFilters from "./components/AppliedFilters";
import FilterButtons from "./components/FilterButtons";
import FilterSection from "./components/FilterSection";
import SortOption from "./components/SortOption";
import FilterGroup from "./components/FilterGroup";
import ColorOption from "./components/ColorOption";
import PriceFilter from "./components/PriceFilter";
import SizeOption from "./components/SizeOption";

import type {
  Brand,
  Category,
  Color,
  Size,
} from "@/types/filter";



const sortOptions = [
  {
    label: "Newest",
    value: "-created_at",
  },
  {
    label: "Name (A–Z)",
    value: "name",
  },
  {
    label: "Price: Low to High",
    value: "regular_price",
  },
  {
    label: "Price: High to Low",
    value: "-regular_price",
  },
];


interface FilterSidebarProps {
  ordering: string;
  setOrdering: (value: string) => void;

  categories: Category[];
  brands: Brand[];
  colors: Color[];
  sizes: Size[];

  selectedCategory: string;
  setCategory: (value: string) => void;

  selectedBrand: string;
  setBrand: (value: string) => void;

  selectedColor: string;
  setColor: (value: string) => void;

  selectedSize: string;
  setSize: (value: string) => void;

  onClearFilters: () => void;

  setMinPrice: (value: string) => void;
setMaxPrice: (value: string) => void;

  filters: {
  category: string;
  brand: string;
  color: string;
  size: string;
};

removeFilter: (
  key: "category" | "brand" | "color" | "size"
) => void;
}

function FilterSidebar({
  ordering,
  setOrdering,
  categories,
  brands,
  colors,
  sizes,
  selectedCategory,
  setCategory,

  selectedBrand,
  setBrand,

  selectedColor,
  setColor,

  selectedSize,
  setSize,
  onClearFilters,

  filters,
  removeFilter,

  setMinPrice,
setMaxPrice,
}: FilterSidebarProps)
 {
  return (
    <div className="font-loomino space-y-4">
      <h2 className="text-[32px] font-semibold capitalize leading-[1.4] text-[#0C0C0C]">
        Filters
      </h2>

      <AppliedFilters
  filters={filters}
  onRemoveFilter={removeFilter}
/>

      <FilterButtons
  onClearFilters={onClearFilters}
/>

      <FilterSection title="Sort">
  {sortOptions.map((option) => (
    <SortOption
      key={option.value}
      label={option.label}
      value={option.value}
      selected={ordering}
      onChange={setOrdering}
    />
  ))}
</FilterSection>

<FilterSection title="Price">
  <PriceFilter
    setMinPrice={setMinPrice}
    setMaxPrice={setMaxPrice}
  />
</FilterSection>

<FilterSection title="Size">
  <div className="flex flex-wrap gap-2">
    {sizes
      .slice()
      .sort((a, b) => a.display_order - b.display_order)
      .map((size) => (
        <SizeOption
          key={size.id}
          label={size.name}
          selected={selectedSize === size.name}
          onChange={setSize}
        />
      ))}
  </div>
</FilterSection>


<FilterSection title="Color">
  {colors.map((color) => (
    <ColorOption
      key={color.id}
      label={color.name}
      hexCode={color.hex_code}
      selected={selectedColor === color.name}
      onChange={setColor}
    />
  ))}
</FilterSection>

  <FilterGroup
  title="Brand"
  items={brands.map((brand) => ({
    id: brand.id,
    label: brand.name,
    value: brand.slug,
  }))}
  selected={selectedBrand}
  onChange={setBrand}
/>


<FilterGroup
  title="Category"
  items={categories.map((category) => ({
    id: category.id,
    label: category.name,
    value: category.slug,
  }))}
  selected={selectedCategory}
  onChange={setCategory}
/>
{/* TODO: Connect Fabric filter when backend support is added 
<FilterSection title="Fabric">
  <FilterOption label="Cotton" />
  <FilterOption label="Linen" />
  <FilterOption label="Wool" />
  <FilterOption label="Silk" />
  <FilterOption label="Cashmere" />
</FilterSection>*/}

    </div>
  );
}

export default FilterSidebar;