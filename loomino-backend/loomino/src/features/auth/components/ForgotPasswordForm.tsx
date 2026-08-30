import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import AuthInput from "./AuthInput";
import FieldError from "./FieldError";
import { useForgotPassword } from "../hooks/useForgotPassword";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../schemas/auth.schemas";

function ForgotPasswordForm() {
  const forgotMutation = useForgotPassword();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (
    data: ForgotPasswordFormValues,
  ) => {
    try {
      const response =
        await forgotMutation.mutateAsync(data);

      toast.success(
        response.message ??
          "Password reset OTP sent to your email.",
      );

      navigate("/reset-password", {
        state: { email: data.email },
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not send reset OTP. Please try again.",
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
        Forgot Password
      </h1>

      <p className="mb-10 text-center text-[16px] text-[#6F6F6F]">
        Enter your email and we'll send you an OTP to
        reset your password.
      </p>

      {/* Email */}
      <div>
        <AuthInput
          type="email"
          placeholder="Email"
          autoComplete="email"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={forgotMutation.isPending}
        className="mt-8 h-[52px] w-full bg-[#5B3A0E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {forgotMutation.isPending
          ? "Sending OTP..."
          : "Send Reset OTP"}
      </button>

      {/* Back to login */}
      <p className="mt-10 text-center text-[18px]">
        Remembered Your Password?{" "}
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

export default ForgotPasswordForm;
