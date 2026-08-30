import type { InputHTMLAttributes, ReactNode } from "react";

import FieldError from "@/features/auth/components/FieldError";

interface CheckoutInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
}

function CheckoutInput({
  error,
  icon,
  ...props
}: CheckoutInputProps) {
  return (
    <div>
      <div className="relative">
        <input
          {...props}
          className="h-10 w-full border border-[#B9AE97] bg-transparent px-4 text-[14px] outline-none transition placeholder:text-[#8B8271] focus:border-[#5B3A0E] lg:h-[52px] lg:text-[15px]"
        />

        {icon && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7060]">
            {icon}
          </span>
        )}
      </div>

      <FieldError message={error} />
    </div>
  );
}

export default CheckoutInput;
