interface StatusBadgeProps {
  status: string;
}

const STYLES: Record<string, string> = {
  pending: "bg-[#FBF3D9] text-[#9A7B1E]",
  paid: "bg-[#DDF3E4] text-[#2F7D4F]",
  delivered: "bg-[#DDF3E4] text-[#2F7D4F]",
  completed: "bg-[#DDF3E4] text-[#2F7D4F]",
  active: "bg-[#DDF3E4] text-[#2F7D4F]",
  published: "bg-[#DDF3E4] text-[#2F7D4F]",
  cancelled: "bg-[#F7E0E0] text-[#9A3B3B]",
  rejected: "bg-[#F7E0E0] text-[#9A3B3B]",
  inactive: "bg-[#F7E0E0] text-[#9A3B3B]",
  processing: "bg-[#E3ECF7] text-[#3A5E8C]",
  shipped: "bg-[#E3ECF7] text-[#3A5E8C]",
};

function StatusBadge({ status }: StatusBadgeProps) {
  const key = status?.toLowerCase?.() ?? "";
  const cls =
    STYLES[key] ?? "bg-[#EFEAE0] text-[#6B5E48]";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium capitalize ${cls}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
