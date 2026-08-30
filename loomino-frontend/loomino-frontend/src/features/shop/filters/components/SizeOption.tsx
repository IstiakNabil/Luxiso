interface SizeOptionProps {
  label: string;
  selected: boolean;
  onChange: (value: string) => void;
}

function SizeOption({
  label,
  selected,
  onChange,
}: SizeOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(label)}
      className={`
        h-10 min-w-[48px]
        rounded-md
        border
        px-4
        text-sm
        transition-colors
        ${
          selected
            ? "border-black bg-black text-white"
            : "border-gray-300 bg-white text-black hover:border-black"
        }
      `}
    >
      {label}
    </button>
  );
}

export default SizeOption;