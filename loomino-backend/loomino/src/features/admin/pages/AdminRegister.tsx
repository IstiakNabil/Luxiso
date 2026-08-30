import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ShieldPlus, Loader2 } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { register as registerUser } from "@/features/auth/services/auth.service";

/**
 * Admin account creation. Registers through the standard
 * account endpoint. NOTE: new accounts are created as normal
 * users — staff/admin access must be granted on the backend
 * (Django admin: set is_staff=True), since self-service admin
 * elevation would be a security risk.
 */
function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (
      !form.first_name ||
      !form.email ||
      !form.password
    ) {
      toast.error("Please fill in the required fields.");
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await registerUser(form);
      toast.success(
        "Account created. An existing admin must grant you staff access before you can sign in.",
      );
      navigate("/admin/login", { replace: true });
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Couldn't create the account.",
        ),
      );
      setSubmitting(false);
    }
  };

  const field = (
    label: string,
    key: string,
    type = "text",
  ) => (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
        {label}
      </span>
      <input
        type={type}
        value={form[key as keyof typeof form]}
        onChange={(e) => set(key, e.target.value)}
        className="h-[44px] w-full rounded-lg border border-[#DDD3C0] px-3 text-[14px] outline-none focus:border-[#A88548]"
      />
    </label>
  );

  return (
    <div className="font-loomino flex min-h-screen items-center justify-center bg-[#211B12] px-4 py-10">
      <div className="w-full max-w-[460px] rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A88548]">
            <ShieldPlus size={28} className="text-white" />
          </div>
          <h1 className="text-[24px] font-bold tracking-[1px] text-[#4C300D]">
            LOOMINO
          </h1>
          <p className="mt-1 text-[13px] text-[#8A7C64]">
            Create an admin account
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {field("First Name", "first_name")}
          {field("Last Name", "last_name")}
        </div>
        {field("Email", "email", "email")}
        {field("Password", "password", "password")}
        {field(
          "Confirm Password",
          "confirm_password",
          "password",
        )}

        <div className="mb-4 rounded-lg bg-[#FBF3D9] px-3 py-2 text-[12px] leading-[1.6] text-[#8A6D1E]">
          New accounts are created as standard users. An
          existing administrator must grant staff access
          before you can enter the admin panel.
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-[#A88548] text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Creating…
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="mt-5 text-center text-[13px] text-[#8A7C64]">
          Already have access?{" "}
          <Link
            to="/admin/login"
            className="font-semibold text-[#A88548] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default AdminRegister;
