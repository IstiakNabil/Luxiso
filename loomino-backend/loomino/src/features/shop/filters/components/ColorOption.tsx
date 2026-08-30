interface ColorOptionProps {
  label: string;
  hexCode: string;
  selected: boolean;
  onChange: (value: string) => void;
}

function ColorOption({
  label,
  hexCode,
  selected,
  onChange,
}: ColorOptionProps) {
  return (
    <label
      className="flex cursor-pointer items-center gap-3 py-2"
      onClick={() => onChange(label)}
    >
      <span
        className={`h-5 w-5 rounded-full border-2 ${
          selected
            ? "border-black"
            : "border-gray-300"
        }`}
        style={{ backgroundColor: hexCode }}
      />

      <span
        className={`text-[15px] ${
          selected
            ? "font-medium text-black"
            : "text-[#4B4B4B]"
        }`}
      >
        {label}
      </span>
    </label>
  );
}

export default ColorOption;