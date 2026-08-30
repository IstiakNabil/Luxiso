interface AppliedFiltersProps {
  filters: {
    category: string;
    product_type: string;
    color: string;
    size: string;
  };

  onRemoveFilter: (
    key: "category" | "product_type" | "color" | "size",
  ) => void;
}

function AppliedFilters({
  filters,
  onRemoveFilter,
}: AppliedFiltersProps) {
  const chips = [
    {
      key: "category" as const,
      value: filters.category,
    },
    {
      key: "product_type" as const,
      value: filters.product_type,
    },
    {
      key: "color" as const,
      value: filters.color,
    },
    {
      key: "size" as const,
      value: filters.size,
    },
  ].filter((chip) => chip.value);

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-lg font-medium">
        Applied Filters
      </h3>

      <div className="flex flex-wrap gap-2">
        {chips.length === 0 && (
          <p className="text-sm text-gray-500">
            No filters applied.
          </p>
        )}

        {chips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => onRemoveFilter(chip.key)}
            className="flex items-center gap-2 rounded-full border border-[#6D4C1C] px-3 py-1 text-sm"
          >
            {chip.value}

            <span>×</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AppliedFilters;