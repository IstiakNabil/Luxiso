import type { InputHTMLAttributes } from "react";

interface AdminFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function AdminField({
  label,
  error,
  ...props
}: AdminFieldProps) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
        {label}
      </span>
      <input
        {...props}
        className="h-[42px] w-full rounded-lg border border-[#DDD3C0] bg-white px-3 text-[14px] text-[#2C2418] outline-none focus:border-[#A88548]"
      />
      {error && (
        <span className="mt-1 block text-[12px] text-[#9A3B3B]">
          {error}
        </span>
      )}
    </label>
  );
}

export default AdminField;
