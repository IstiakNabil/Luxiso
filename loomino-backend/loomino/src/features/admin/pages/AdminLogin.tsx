import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";

import type { AppDispatch } from "@/app/store/store";
import { getApiErrorMessage } from "@/lib/apiError";
import {
  login,
  getProfile,
} from "@/features/auth/services/auth.service";
import { adminLoginSuccess } from "../store/adminAuthSlice";
import { adminStorage } from "../utils/adminStorage";

function AdminLogin() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!email || !password) {
      toast.error("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await login({ email, password });

      // Store the session FIRST so the token is attached to
      // the profile request below.
      adminStorage.setSession(res.access, res.refresh, res.user);

      let user = res.user;
      try {
        const profile = await getProfile();
        user = { ...res.user, ...profile };
        adminStorage.setUser(user);
      } catch {
        // fall back to login user
      }

      const isAdmin =
        user.is_staff === true || user.is_superuser === true;

      if (!isAdmin) {
        adminStorage.clear();
        toast.error("This account doesn't have admin access.");
        setSubmitting(false);
        return;
      }

      dispatch(
        adminLoginSuccess({
          user,
          accessToken: res.access,
          refreshToken: res.refresh,
        }),
      );

      toast.success(`Welcome back, ${user.first_name}!`);
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Login failed. Check your credentials.",
        ),
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="font-loomino flex min-h-screen items-center justify-center bg-[#211B12] px-4">
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A88548]">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-[24px] font-bold tracking-[1px] text-[#4C300D]">
            LOOMINO
          </h1>
          <p className="mt-1 text-[13px] text-[#8A7C64]">
            Admin Panel — sign in to continue
          </p>
        </div>

        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="admin@loomino.com"
            className="h-[46px] w-full rounded-lg border border-[#DDD3C0] px-3 text-[14px] outline-none focus:border-[#A88548]"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="••••••••"
            className="h-[46px] w-full rounded-lg border border-[#DDD3C0] px-3 text-[14px] outline-none focus:border-[#A88548]"
          />
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#A88548] text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <Link
          to="/admin/forgot-password"
          className="mt-4 block text-center text-[13px] font-medium text-[#A88548] hover:underline"
        >
          Forgot your password?
        </Link>

        <p className="mt-6 text-center text-[12px] text-[#A89A80]">
          Authorized personnel only. Access is restricted to
          staff accounts.
        </p>

        <p className="mt-4 text-center text-[13px] text-[#8A7C64]">
          Need an account?{" "}
          <Link
            to="/admin/register"
            className="font-semibold text-[#A88548] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;