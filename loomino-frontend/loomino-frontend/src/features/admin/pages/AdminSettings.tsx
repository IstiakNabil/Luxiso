import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Settings, Share2, MapPin, Save } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import {
  getAdminSettings,
  updateAdminSettings,
  type AdminSiteSettings,
} from "../services/settings.service";

type FormState = Omit<AdminSiteSettings, "updated_at">;

const EMPTY: FormState = {
  app_name: "",
  app_url: "",
  email_address: "",
  admin_notification_email: "",
  phone_number: "",
  hotline_number: "",
  currency_name: "",
  currency_symbol: "",
  delivery_charge: "",
  facebook_url: "",
  instagram_url: "",
  twitter_url: "",
  youtube_url: "",
  linkedin_url: "",
  privacy_policy_link: "",
  terms_conditions_link: "",
  service_hours: "",
  physical_address: "",
  google_map_embed_url: "",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#6B5E48]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-[#E5DECF] bg-[#FBF8F2] px-3 text-[14px] text-[#3A1620] outline-none transition focus:border-[#A88548]"
      />
    </label>
  );
}

function AreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#6B5E48]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-lg border border-[#E5DECF] bg-[#FBF8F2] px-3 py-2 text-[14px] text-[#3A1620] outline-none transition focus:border-[#A88548]"
      />
      {hint && (
        <span className="mt-1 block text-[12px] text-[#B08C7A]">
          {hint}
        </span>
      )}
    </label>
  );
}

function AdminSettings() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: getAdminSettings,
  });

  const [form, setForm] = useState<FormState>(EMPTY);

  useEffect(() => {
    if (data) {
      const { updated_at: _ignored, ...rest } = data;
      setForm(rest);
    }
  }, [data]);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: () => updateAdminSettings(form),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "settings"],
      });
      // Storefront reads a separate public endpoint/cache.
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings saved.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't save settings.")),
  });

  return (
    <div className="font-loomino">
      <AdminPageHeader
        icon={<Settings size={20} />}
        title="System Settings"
        subtitle="Manage global configuration for your storefront"
      />

      {isLoading && (
        <p className="py-10 text-center text-[14px] text-[#B08C7A]">
          Loading…
        </p>
      )}

      {isError && (
        <p className="py-10 text-center text-[14px] text-[#9A3B3B]">
          Couldn't load settings.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="space-y-6">
          {/* Core configuration */}
          <section className="rounded-2xl border border-[#EFE9DE] bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <Settings size={18} className="text-[#A88548]" />
              <h2 className="text-[16px] font-semibold text-[#3A1620]">
                Core Configuration
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="App URL"
                value={form.app_url}
                onChange={set("app_url")}
                placeholder="https://…"
              />
              <Field
                label="App Name"
                value={form.app_name}
                onChange={set("app_name")}
                placeholder="Loomino Store"
              />
              <Field
                label="Email Address"
                type="email"
                value={form.email_address}
                onChange={set("email_address")}
                placeholder="info@loomino.com"
              />
              <Field
                label="Admin Notification Email"
                type="email"
                value={form.admin_notification_email}
                onChange={set("admin_notification_email")}
                placeholder="admin@loomino.com"
              />
              <Field
                label="Phone Number"
                value={form.phone_number}
                onChange={set("phone_number")}
                placeholder="+8801XXXXXXXXX"
              />
              <Field
                label="Hotline / Support Number"
                value={form.hotline_number}
                onChange={set("hotline_number")}
                placeholder="123456789"
              />
              <Field
                label="Currency Name"
                value={form.currency_name}
                onChange={set("currency_name")}
                placeholder="BDT"
              />
              <Field
                label="Currency Symbol"
                value={form.currency_symbol}
                onChange={set("currency_symbol")}
                placeholder="৳"
              />
              <Field
                label="Delivery Charge (Base)"
                type="number"
                value={form.delivery_charge}
                onChange={set("delivery_charge")}
                placeholder="60"
              />
            </div>
          </section>

          {/* Social & links */}
          <section className="rounded-2xl border border-[#EFE9DE] bg-white p-6">
            <div className="mb-5 flex items-center gap-2">
              <Share2 size={18} className="text-[#A88548]" />
              <h2 className="text-[16px] font-semibold text-[#3A1620]">
                Social &amp; Links
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Facebook URL"
                value={form.facebook_url}
                onChange={set("facebook_url")}
                placeholder="https://www.facebook.com/…"
              />
              <Field
                label="Instagram URL"
                value={form.instagram_url}
                onChange={set("instagram_url")}
                placeholder="https://www.instagram.com/…"
              />
              <Field
                label="Twitter (X) URL"
                value={form.twitter_url}
                onChange={set("twitter_url")}
                placeholder="https://www.twitter.com/…"
              />
              <Field
                label="YouTube URL"
                value={form.youtube_url}
                onChange={set("youtube_url")}
                placeholder="https://www.youtube.com/…"
              />
              <Field
                label="LinkedIn URL"
                value={form.linkedin_url}
                onChange={set("linkedin_url")}
                placeholder="https://www.linkedin.com/…"
              />
              <Field
                label="Privacy Policy Link"
                value={form.privacy_policy_link}
                onChange={set("privacy_policy_link")}
                placeholder="https://…"
              />
              <Field
                label="Terms & Conditions Link"
                value={form.terms_conditions_link}
                onChange={set("terms_conditions_link")}
                placeholder="https://…"
              />
            </div>

            <div className="mt-5 space-y-5">
              <AreaField
                label="Service Hours / Footer Text"
                value={form.service_hours}
                onChange={set("service_hours")}
                placeholder="Sat – Thu · 9:00 AM – 9:00 PM"
                rows={2}
              />
              <AreaField
                label="Physical Address"
                value={form.physical_address}
                onChange={set("physical_address")}
                placeholder="House 12, Road 4, Mirpur-1, Dhaka-1216, Bangladesh"
              />
              <AreaField
                label="Google Map Embed URL"
                value={form.google_map_embed_url}
                onChange={set("google_map_embed_url")}
                placeholder="https://www.google.com/maps/embed?pb=…"
                rows={3}
                hint="Go to Google Maps → Share → Embed a map → copy only the src value from the iframe."
              />

              {form.google_map_embed_url.trim() && (
                <div className="overflow-hidden rounded-lg border border-[#E5DECF]">
                  <div className="flex items-center gap-2 border-b border-[#E5DECF] bg-[#FBF8F2] px-3 py-2 text-[12px] text-[#8A7C64]">
                    <MapPin size={14} className="text-[#A88548]" />
                    Map preview
                  </div>
                  <iframe
                    src={form.google_map_embed_url}
                    title="Store location preview"
                    className="h-[280px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => save.mutate()}
              disabled={save.isPending}
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#5C1626] px-6 text-[14px] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Save size={16} />
              {save.isPending ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
