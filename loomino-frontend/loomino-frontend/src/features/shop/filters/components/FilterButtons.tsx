interface FilterButtonsProps {
  onClearFilters: () => void;
}

/**
 * "Clear All Filters" button, styled to the Figma design:
 * an outlined brown button. (The design's second "Applied
 * Filters" button is represented by the AppliedFilters chips
 * shown above the sections.)
 */
function FilterButtons({
  onClearFilters,
}: FilterButtonsProps) {
  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={onClearFilters}
        className="h-[40px] w-full border border-[#8A6A2E] text-[14px] capitalize text-[#8A6A2E] transition hover:bg-[#E7DFCF]"
      >
        Clear All Filters
      </button>
    </div>
  );
}

export default FilterButtons;
