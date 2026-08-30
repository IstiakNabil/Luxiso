import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: ReactNode;
  accent?: string;
}

function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "#A88548",
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#EFE9DE] bg-white p-5">
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
        >
          {icon}
        </div>
        {hint && (
          <span className="text-[11px] text-[#A89A80]">
            {hint}
          </span>
        )}
      </div>
      <p className="mt-4 text-[26px] font-bold text-[#2C2418]">
        {value}
      </p>
      <p className="text-[13px] text-[#8A7C64]">{label}</p>
    </div>
  );
}

export default StatCard;
