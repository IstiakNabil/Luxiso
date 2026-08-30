import type { ButtonHTMLAttributes, ReactNode } from "react";

interface AdminButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "danger";
  children: ReactNode;
}

const VARIANTS: Record<string, string> = {
  primary: "bg-[#A88548] text-white hover:opacity-90",
  outline:
    "border border-[#D8CDB8] text-[#6B5E48] hover:bg-[#F7F0E5]",
  danger:
    "border border-[#E0BdBd] text-[#9A3B3B] hover:bg-[#F7ECEC]",
};

function AdminButton({
  variant = "primary",
  children,
  className = "",
  ...props
}: AdminButtonProps) {
  return (
    <button
      {...props}
      className={`inline-flex h-[40px] items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-medium transition disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default AdminButton;
