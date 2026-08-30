import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

import FieldError from "@/features/auth/components/FieldError";

interface ProfileSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: string[];
}

/**
 * Dropdown variant of ProfileField — same visual style, used
 * for fields with a fixed set of valid values (e.g.
 * Country / Region).
 */
function ProfileSelect({
  label,
  error,
  options,
  id,
  ...props
}: ProfileSelectProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-[15px] text-[#0C0C0C]"
      >
        {label}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          {...props}
          className="h-[52px] w-full appearance-none border border-[#B9AE97] bg-transparent px-4 pr-10 text-[15px] outline-none transition focus:border-[#4C300D] disabled:bg-[#EDE7DA] disabled:text-[#7A7060]"
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

export default ProfileSelect;
