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
  /** Shown instead of the list when `items` is empty. */
  emptyLabel?: string;
}

function FilterGroup({
  title,
  items,
  selected,
  onChange,
  emptyLabel,
}: FilterGroupProps) {
  return (
    <FilterSection title={title}>
  {items.length === 0 && emptyLabel ? (
    <p className="text-[13px] text-[#8A7C64]">{emptyLabel}</p>
  ) : (
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
  )}
</FilterSection>
  );
}

export default FilterGroup;