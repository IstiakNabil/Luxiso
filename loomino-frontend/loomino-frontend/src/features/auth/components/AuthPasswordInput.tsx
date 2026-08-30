import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import type { InputHTMLAttributes } from "react";

type AuthPasswordInputProps =
  InputHTMLAttributes<HTMLInputElement>;

function AuthPasswordInput(
  props: AuthPasswordInputProps,
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className="h-[46px] w-full border border-[#6F6F6F] px-4 pr-12 text-[14px] outline-none transition focus:border-black"
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={
          visible ? "Hide password" : "Show password"
        }
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F6F6F] hover:text-black"
      >
        {visible ? (
          <Eye size={18} />
        ) : (
          <EyeOff size={18} />
        )}
      </button>
    </div>
  );
}

export default AuthPasswordInput;
