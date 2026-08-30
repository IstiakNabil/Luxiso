import type { ReactNode } from "react";

interface AdminPageHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
}

function AdminPageHeader({
  icon,
  title,
  subtitle,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0E9DA] text-[#A88548]">
          {icon}
        </div>
        <div>
          <h1 className="text-[24px] font-bold text-[#2C2418]">
            {title}
          </h1>
          <p className="text-[13px] text-[#8A7C64]">
            {subtitle}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}

export default AdminPageHeader;
