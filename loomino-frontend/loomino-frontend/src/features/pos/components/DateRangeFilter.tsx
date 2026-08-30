import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onChange: (next: { dateFrom: string; dateTo: string }) => void;
}

function DateRangeFilter({ dateFrom, dateTo, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] bg-white px-3 py-1.5">
      <Calendar size={14} className="text-[#7C6AE8]" />
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onChange({ dateFrom: e.target.value, dateTo })}
        className="bg-transparent text-[13px] text-[#3A3560] outline-none"
      />
      <span className="text-[#C9C4E8]">–</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onChange({ dateFrom, dateTo: e.target.value })}
        className="bg-transparent text-[13px] text-[#3A3560] outline-none"
      />
      {(dateFrom || dateTo) && (
        <button
          type="button"
          onClick={() => onChange({ dateFrom: "", dateTo: "" })}
          className="ml-1 text-[12px] font-medium text-[#7C6AE8] hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default DateRangeFilter;
