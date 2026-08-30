import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { KeyRound, Loader2, ArrowLeft } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  forgotPassword,
  resetPassword,
} from "@/features/auth/services/auth.service";

/**
 * Admin password reset. Two steps, matching the backend:
 *   1. POST /auth/forgot-password/  { email }        → sends OTP
 *   2. POST /auth/reset-password/   { email, otp, password, confirm_password }
 */
function AdminForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "reset">(
    "request",
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const input =
    "h-[46px] w-full rounded-lg border border-[#DDD3C0] px-3 text-[14px] outline-none focus:border-[#A88548]";
  const label =
    "mb-1.5 block text-[13px] font-medium text-[#3A2E1B]";

  const requestOtp = async () => {
    if (!email) {
      toast.error("Enter your email address.");
      return;
    }
    setSubmitting(true);
    try {
      await forgotPassword({ email });
      toast.success(
        "We've sent a verification code to your email.",
      );
      setStep("reset");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Couldn't send the reset code.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const doReset = async () => {
    if (!otp || !password) {
      toast.error("Enter the code and your new password.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword({
        email,
        otp,
        password,
        confirm_password: confirm,
      });
      toast.success(
        "Password updated. You can now sign in.",
      );
      navigate("/admin/login", { replace: true });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Couldn't reset your password.",
        ),
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="font-loomino flex min-h-screen items-center justify-center bg-[#211B12] px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A88548]">
            <KeyRound size={26} className="text-white" />
          </div>
          <h1 className="text-[24px] font-bold tracking-[1px] text-[#4C300D]">
            LOOMINO
          </h1>
          <p className="mt-1 text-[13px] text-[#8A7C64]">
            {step === "request"
              ? "Reset your admin password"
              : "Enter the code we emailed you"}
          </p>
        </div>

        {step === "request" ? (
          <>
            <label className="mb-5 block">
              <span className={label}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void requestOtp();
                }}
                placeholder="admin@loomino.com"
                className={input}
              />
            </label>

            <button
              type="button"
              onClick={() => void requestOtp()}
              disabled={submitting}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#A88548] text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Sending…
                </>
              ) : (
                "Send Reset Code"
              )}
            </button>
          </>
        ) : (
          <>
            <label className="mb-4 block">
              <span className={label}>
                Verification Code
              </span>
              <input
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                className={`${input} tracking-[4px]`}
              />
            </label>

            <label className="mb-4 block">
              <span className={label}>New Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="At least 8 characters"
                className={input}
              />
            </label>

            <label className="mb-5 block">
              <span className={label}>
                Confirm Password
              </span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void doReset();
                }}
                className={input}
              />
            </label>

            <button
              type="button"
              onClick={() => void doReset()}
              disabled={submitting}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#A88548] text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Updating…
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep("request")}
              className="mt-4 w-full text-center text-[13px] text-[#8A7C64] hover:text-[#4C300D]"
            >
              Didn't get a code? Try again
            </button>
          </>
        )}

        <Link
          to="/admin/login"
          className="mt-6 flex items-center justify-center gap-1.5 text-[13px] font-medium text-[#A88548] hover:underline"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default AdminForgotPassword;
