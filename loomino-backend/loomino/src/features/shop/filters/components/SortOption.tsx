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
  const isSelected = selected === value;

  return (
    <label
      className="flex cursor-pointer items-center gap-3 py-2"
      onClick={() => onChange(value)}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
          isSelected
            ? "border-black"
            : "border-gray-300"
        }`}
      >
        {isSelected && (
          <span className="h-2.5 w-2.5 rounded-full bg-black" />
        )}
      </span>

      <span
        className={`text-[15px] ${
          isSelected
            ? "font-medium text-black"
            : "text-[#4B4B4B]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export default SortOption;