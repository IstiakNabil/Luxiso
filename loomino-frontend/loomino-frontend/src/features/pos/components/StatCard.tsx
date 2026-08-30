import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: string;
}

function StatCard({ label, value, icon, accent = "#7C6AE8" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}1A`, color: accent }}
      >
        {icon}
      </div>
      <p className="mt-4 text-[22px] font-bold text-[#221F35]">{value}</p>
      <p className="text-[13px] text-[#726C8C]">{label}</p>
    </div>
  );
}

export default StatCard;
