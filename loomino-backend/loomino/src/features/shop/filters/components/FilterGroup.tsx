import FilterOption from "./FilterOption";
import FilterSection from "./FilterSection";

interface FilterItem {
  id: number;
  label: string;
  value: string;
}

interface FilterGroupProps {
  title: string;
  items: FilterItem[];
  selected: string;
  onChange: (value: string) => void;
}

function FilterGroup({
  title,
  items,
  selected,
  onChange,
}: FilterGroupProps) {
  return (
    <FilterSection title={title}>
  <div className="space-y-2">
    {items.map((item) => (
      <FilterOption
        key={item.id}
        label={item.label}
        value={item.value}
        checked={selected === item.value}
        onChange={onChange}
      />
    ))}
  </div>
</FilterSection>
  );
}

export default FilterGroup;