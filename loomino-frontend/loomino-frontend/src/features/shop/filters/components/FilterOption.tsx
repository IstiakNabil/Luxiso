interface FilterOptionProps {
  label: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
}

function FilterOption({
  label,
  value,
  checked,
  onChange,
}: FilterOptionProps) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3 py-2"
      onClick={() => onChange(value)}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
          checked
            ? "border-black bg-black"
            : "border-gray-300 bg-white"
        }`}
      >
        {checked && (
          <svg
            className="h-3 w-3"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 10L8.5 13.5L15 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      <span
        className={`text-[15px] ${
          checked
            ? "font-medium text-black"
            : "text-[#4B4B4B]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export default FilterOption;