import { useId } from "react";
import type { InputHTMLAttributes } from "react";

import FieldError from "@/features/auth/components/FieldError";

interface ProfileFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function ProfileField({
  label,
  error,
  id,
  ...props
}: ProfileFieldProps) {
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
      <input
        id={fieldId}
        {...props}
        className="h-[52px] w-full border border-[#B9AE97] bg-transparent px-4 text-[15px] outline-none transition placeholder:text-[#8B8271] focus:border-[#4C300D] disabled:bg-[#EDE7DA] disabled:text-[#7A7060]"
      />
      <FieldError message={error} />
    </div>
  );
}

export default ProfileField;
