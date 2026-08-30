import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import FieldError from "@/features/auth/components/FieldError";

interface CheckoutSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: string[];
}

/**
 * Dropdown variant of CheckoutInput — same visual style,
 * used for fields with a fixed set of valid values (e.g.
 * Country / Region).
 */
function CheckoutSelect({
  error,
  options,
  ...props
}: CheckoutSelectProps) {
  return (
    <div>
      <div className="relative">
        <select
          {...props}
          className="h-[52px] w-full appearance-none border border-[#B9AE97] bg-transparent px-4 pr-10 text-[15px] text-[#3F3A30] outline-none transition focus:border-[#5B3A0E]"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7060]"
        />
      </div>

      <FieldError message={error} />
    </div>
  );
}

export default CheckoutSelect;
