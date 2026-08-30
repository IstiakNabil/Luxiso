import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import AuthInput from "./AuthInput";
import FieldError from "./FieldError";
import { useVerifyEmail } from "../hooks/useVerifyEmail";
import { useResendOtp } from "../hooks/useResendOtp";
import {
  verifyEmailSchema,
  type VerifyEmailFormValues,
} from "../schemas/auth.schemas";

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyOTPForm() {
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendOtp();
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState =
    (location.state as { email?: string } | null)
      ?.email ?? "";

  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: emailFromState, otp: "" },
  });

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN_SECONDS);

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (
    data: VerifyEmailFormValues,
  ) => {
    try {
      const response =
        await verifyMutation.mutateAsync(data);

      toast.success(
        response.message ??
          "Email verified successfully.",
      );

      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Verification failed. Please check the OTP.",
        ),
      );
    }
  };

  const onResend = async () => {
    const email = getValues("email");

    if (!email) {
      toast.error("Enter your email first.");
      return;
    }

    try {
      const response =
        await resendMutation.mutateAsync({ email });

      toast.success(
        response.message ?? "OTP sent successfully.",
      );

      startCooldown();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not resend OTP. Please try again.",
        ),
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-[392px]"
      noValidate
    >
      {/* Heading */}
      <h1 className="mb-4 text-center text-[32px] font-semibold">
        Verify Your Email
      </h1>

      <p className="mb-10 text-center text-[16px] text-[#6F6F6F]">
        Enter the OTP we sent to your email address.
      </p>

      {/* Email */}
      <div className="mb-4">
        <AuthInput
          type="email"
          placeholder="Email"
          autoComplete="email"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      {/* OTP */}
      <div>
        <AuthInput
          type="text"
          inputMode="numeric"
          placeholder="OTP Code"
          autoComplete="one-time-code"
          {...register("otp")}
        />
        <FieldError message={errors.otp?.message} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={verifyMutation.isPending}
        className="mt-8 h-[52px] w-full bg-[#5B3A0E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {verifyMutation.isPending
          ? "Verifying..."
          : "Verify Email"}
      </button>

      {/* Resend */}
      <p className="mt-10 text-center text-[18px]">
        Didn't Receive The Code?{" "}
        <button
          type="button"
          onClick={onResend}
          disabled={
            resendMutation.isPending || cooldown > 0
          }
          className="font-medium underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cooldown > 0
            ? `Resend In ${cooldown}s`
            : "Resend OTP"}
        </button>
      </p>
    </form>
  );
}

export default VerifyOTPForm;
