import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import AuthInput from "./AuthInput";
import AuthPasswordInput from "./AuthPasswordInput";
import FieldError from "./FieldError";
import { useResetPassword } from "../hooks/useResetPassword";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/auth.schemas";

function ResetPasswordForm() {
  const resetMutation = useResetPassword();
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState =
    (location.state as { email?: string } | null)
      ?.email ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromState,
      otp: "",
      password: "",
      confirm_password: "",
    },
  });

  const onSubmit = async (
    data: ResetPasswordFormValues,
  ) => {
    try {
      const response =
        await resetMutation.mutateAsync(data);

      toast.success(
        response.message ??
          "Password reset successful. Please log in.",
      );

      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Password reset failed. Please check the OTP.",
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
        Reset Password
      </h1>

      <p className="mb-10 text-center text-[16px] text-[#6F6F6F]">
        Enter the OTP from your email and choose a new
        password.
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
      <div className="mb-4">
        <AuthInput
          type="text"
          inputMode="numeric"
          placeholder="OTP Code"
          autoComplete="one-time-code"
          {...register("otp")}
        />
        <FieldError message={errors.otp?.message} />
      </div>

      {/* New Password */}
      <div className="mb-4">
        <AuthPasswordInput
          placeholder="New Password"
          autoComplete="new-password"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      {/* Confirm Password */}
      <div>
        <AuthPasswordInput
          placeholder="Confirm New Password"
          autoComplete="new-password"
          {...register("confirm_password")}
        />
        <FieldError
          message={errors.confirm_password?.message}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={resetMutation.isPending}
        className="mt-8 h-[52px] w-full bg-[#5B3A0E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {resetMutation.isPending
          ? "Resetting Password..."
          : "Reset Password"}
      </button>

      {/* Back to login */}
      <p className="mt-10 text-center text-[18px]">
        Back To{" "}
        <Link
          to="/login"
          className="font-medium underline"
        >
          Log In
        </Link>
      </p>
    </form>
  );
}

export default ResetPasswordForm;
