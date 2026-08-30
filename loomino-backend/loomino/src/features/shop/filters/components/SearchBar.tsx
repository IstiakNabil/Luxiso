interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Search products..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-[#D8D8D8] px-4 py-3 outline-none focus:border-[#6D4C1C]"
    />
  );
}

export default SearchBar;