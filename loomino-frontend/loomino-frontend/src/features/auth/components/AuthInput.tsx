import type { InputHTMLAttributes } from "react";

interface AuthInputProps
  extends InputHTMLAttributes<HTMLInputElement> {}

function AuthInput({
  ...props
}: AuthInputProps) {
  return (
    <input
      {...props}
      className="h-[46px] w-full border border-[#6F6F6F] px-4 text-[14px] outline-none transition focus:border-black"
    />
  );
}

export default AuthInput;