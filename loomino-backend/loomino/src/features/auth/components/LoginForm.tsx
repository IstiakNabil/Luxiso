import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import type { AppDispatch } from "@/app/store/store";
import { getApiErrorMessage } from "@/lib/apiError";
import AuthInput from "./AuthInput";
import AuthPasswordInput from "./AuthPasswordInput";
import FieldError from "./FieldError";
import SocialLogin from "./SocialLogin";
import { useLogin } from "../hooks/useLogin";
import { loginSuccess } from "../store/authSlice";
import { authStorage } from "../utils/authStorage";
import {
  loginSchema,
  type LoginFormValues,
} from "../schemas/auth.schemas";

function LoginForm() {
  const loginMutation = useLogin();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo =
    (location.state as { from?: string } | null)?.from ??
    "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response =
        await loginMutation.mutateAsync(data);

      authStorage.setSession(
        response.access,
        response.refresh,
        response.user,
      );

      dispatch(
        loginSuccess({
          user: response.user,
          accessToken: response.access,
          refreshToken: response.refresh,
        }),
      );

      toast.success(`Welcome back, ${response.user.first_name}!`);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Login failed. Please check your credentials.",
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
        Log In
      </h1>

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
      <div>
        <AuthPasswordInput
          placeholder="Password"
          autoComplete="current-password"
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      {/* Forgot Password */}
      <Link
        to="/forgot-password"
        className="mt-4 inline-block text-[18px] text-[#6F4E37] hover:underline"
      >
        Forgot Your Password?
      </Link>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="mt-8 h-[52px] w-full bg-[#5B3A0E] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loginMutation.isPending
          ? "Logging In..."
          : "Log In"}
      </button>

      {/* Divider */}
      <p className="my-8 text-center text-[20px]">Or</p>

      {/* Social Login Placeholder */}
      <SocialLogin />

      {/* Register */}
      <p className="mt-10 text-center text-[18px]">
        New To Loomino?{" "}
        <Link
          to="/register"
          className="font-medium underline"
        >
          Create An Account
        </Link>
      </p>
    </form>
  );
}

export default LoginForm;
