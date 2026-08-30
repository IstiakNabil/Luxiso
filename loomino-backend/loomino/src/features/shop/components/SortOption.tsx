interface SortOptionProps {
  label: string;
  value: string;
  selected: string;
  onChange: (value: string) => void;
}

function SortOption({
  label,
  value,
  selected,
  onChange,
}: SortOptionProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2">
      <input
        type="radio"
        name="sorting"
        checked={selected === value}
        onChange={() => onChange(value)}
      />

      <span className="text-[15px] text-[#4B4B4B]">
        {label}
      </span>
    </label>
  );
}

export default SortOption;