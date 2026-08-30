import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import AuthInput from "./AuthInput";
import AuthPasswordInput from "./AuthPasswordInput";
import FieldError from "./FieldError";
import { useRegister } from "../hooks/useRegister";
import {
  registerSchema,
  type RegisterFormValues,
} from "../schemas/auth.schemas";

function RegisterForm() {
  const registerMutation = useRegister();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response =
        await registerMutation.mutateAsync(data);

      toast.success(
        response.message ??
          "Registration successful. Check your email for the OTP.",
      );

      navigate("/verify-email", {
        state: { email: data.email },
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Registration failed. Please try again.",
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
      <h1 className="mb-10 text-center text-[32px] font-semibold">
        Create Account
      </h1>

      {/* Name */}
      <div className="mb-4 flex gap-4">
        <div className="flex-1">
          <AuthInput
            type="text"
            placeholder="First Name"
            autoComplete="given-name"
            {...register("first_name")}
          />
          <FieldError
            message={errors.first_name?.message}
          />
        </div>

        <div className="flex-1">
          <AuthInput
            type="text"
            placeholder="Last Name"
            autoComplete="family-name"
            {...register("last_name")}
          />
          <FieldError
            message={errors.last_name?.message}
          />
        </div>
      </div>

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

      {/* Password */}
      <div className="mb-4">
        <AuthPasswordInput
          placeholder="Password"
          autoComplete="new-password"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      {/* Confirm Password */}
      <div>
        <AuthPasswordInput
          placeholder="Confirm Password"
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
        disabled={registerMutation.isPending}
        className="mt-8 h-[52px] w-full bg-[#5B3A0E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {registerMutation.isPending
          ? "Creating Account..."
          : "Create Account"}
      </button>

      {/* Login link */}
      <p className="mt-10 text-center text-[18px]">
        Already Have An Account?{" "}
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

export default RegisterForm;
