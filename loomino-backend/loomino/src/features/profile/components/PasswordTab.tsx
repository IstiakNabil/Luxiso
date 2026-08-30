import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";
import ProfileField from "./ProfileField";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/auth.schemas";

/**
 * There is no authenticated change-password endpoint, so
 * this reuses the OTP reset flow scoped to the logged-in
 * user's email:
 *  1. Request an OTP (forgot-password) to their email.
 *  2. Enter OTP + new password (reset-password).
 */
function PasswordTab() {
  const { user } = useAuth();
  const email = user?.email ?? "";

  const forgot = useForgotPassword();
  const reset = useResetPassword();
  const [otpSent, setOtpSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      otp: "",
      password: "",
      confirm_password: "",
    },
  });

  const requestOtp = async () => {
    try {
      await forgot.mutateAsync({ email });
      setOtpSent(true);
      toast.success(
        "We've sent a verification code to your email.",
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not send the code. Please try again.",
        ),
      );
    }
  };

  const onSubmit = async (
    values: ResetPasswordFormValues,
  ) => {
    try {
      await reset.mutateAsync(values);
      toast.success(
        "Password changed successfully.",
      );
      setOtpSent(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not change your password.",
        ),
      );
    }
  };

  return (
    <div className="max-w-[560px]">
      <p className="text-[16px] leading-[1.8] text-[#606060]">
        To change your password, we'll send a verification
        code to{" "}
        <span className="font-semibold text-[#0C0C0C]">
          {email}
        </span>
        . Enter the code along with your new password.
      </p>

      {!otpSent ? (
        <button
          type="button"
          onClick={requestOtp}
          disabled={forgot.isPending}
          className="mt-8 h-[48px] w-[240px] bg-[#343E32] text-[14px] text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {forgot.isPending
            ? "Sending..."
            : "Send Verification Code"}
        </button>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
          noValidate
        >
          <ProfileField
            label="Verification Code"
            inputMode="numeric"
            placeholder="Enter the code from your email"
            error={errors.otp?.message}
            {...register("otp")}
          />

          <ProfileField
            label="New Password"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <ProfileField
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            error={errors.confirm_password?.message}
            {...register("confirm_password")}
          />

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={reset.isPending}
              className="h-[48px] w-[200px] bg-[#343E32] text-[14px] text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {reset.isPending
                ? "Updating..."
                : "Change Password"}
            </button>

            <button
              type="button"
              onClick={requestOtp}
              disabled={forgot.isPending}
              className="text-[15px] text-[#4C300D] hover:underline disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PasswordTab;
