import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Images, Upload } from "lucide-react";

import { getMediaUrl } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import {
  listSiteBanners,
  updateSiteBanner,
  updateSiteBannerText,
} from "../services/cms.service";
import type { AdminSiteBanner } from "../types/cms";

// Slots that carry editable copy in addition to an image. Any
// key listed here renders a text-editing form under its image.
const TEXT_SLOT_KEYS = new Set<string>(["our_story"]);

function BannerCard({ banner }: { banner: AdminSiteBanner }) {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const update = useMutation({
    mutationFn: (file: File) =>
      updateSiteBanner(banner.key, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "site-banners"],
      });
      toast.success(`${banner.label} updated.`);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update image."),
      ),
  });

  return (
    <div className="rounded-2xl border border-[#EFE9DE] bg-white p-4">
      <div className="mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F0E9DA]">
        {banner.image ? (
          <img
            src={getMediaUrl(banner.image) ?? ""}
            alt={banner.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-[13px] text-[#B08C7A]">
            No image uploaded yet
          </div>
        )}
      </div>

      <p className="mb-2 text-[14px] font-semibold text-[#3A1620]">
        {banner.label}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) update.mutate(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={update.isPending}
        className="inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-lg border border-[#D8CDB8] text-[13px] font-medium text-[#6B5E48] transition hover:bg-[#F7F0E5] disabled:opacity-50"
      >
        <Upload size={14} />
        {update.isPending ? "Uploading…" : "Change Image"}
      </button>

      {TEXT_SLOT_KEYS.has(banner.key) && (
        <BannerTextForm banner={banner} />
      )}
    </div>
  );
}

/**
 * Editable copy for text-carrying slots (Our Story). Sits below
 * the image controls; saves independently of the image.
 */
function BannerTextForm({ banner }: { banner: AdminSiteBanner }) {
  const queryClient = useQueryClient();
  const [eyebrow, setEyebrow] = useState(banner.eyebrow);
  const [heading, setHeading] = useState(banner.heading);
  const [body, setBody] = useState(banner.body);
  const [ctaLabel, setCtaLabel] = useState(banner.cta_label);

  const save = useMutation({
    mutationFn: () =>
      updateSiteBannerText(banner.key, {
        eyebrow,
        heading,
        body,
        cta_label: ctaLabel,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "site-banners"],
      });
      toast.success(`${banner.label} text updated.`);
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't update text.")),
  });

  const fieldClass =
    "w-full rounded-lg border border-[#D8CDB8] bg-white px-3 py-2 text-[13px] text-[#3A1620] outline-none transition focus:border-[#6B5E48]";

  return (
    <div className="mt-4 space-y-2 border-t border-[#EFE9DE] pt-4">
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#B08C7A]">
          Eyebrow
        </span>
        <input
          value={eyebrow}
          onChange={(e) => setEyebrow(e.target.value)}
          className={fieldClass}
          placeholder="OUR STORY"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#B08C7A]">
          Heading
        </span>
        <input
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className={fieldClass}
          placeholder="The Essence of Loomino"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#B08C7A]">
          Body
        </span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          className={`${fieldClass} resize-y`}
          placeholder="We celebrate curated craftsmanship…"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-[#B08C7A]">
          Button Label
        </span>
        <input
          value={ctaLabel}
          onChange={(e) => setCtaLabel(e.target.value)}
          className={fieldClass}
          placeholder="Learn More"
        />
      </label>

      <button
        type="button"
        onClick={() => save.mutate()}
        disabled={save.isPending}
        className="inline-flex h-[36px] w-full items-center justify-center rounded-lg bg-[#5C1626] text-[13px] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
      >
        {save.isPending ? "Saving…" : "Save Text"}
      </button>
    </div>
  );
}

function groupLabel(key: string): string {
  if (key === "logo" || key === "auth_image") return "Global";
  if (key.startsWith("megamenu_")) return "Mega Menu";
  if (
    key.startsWith("collection_") ||
    key.startsWith("hero_slide_") ||
    key.startsWith("community_") ||
    key === "sustainability" ||
    key === "our_story"
  )
    return "Homepage";
  if (key.startsWith("shop_")) return "Shop Page";
  if (key.startsWith("on_sale_")) return "On Sale Page";
  if (key.startsWith("sustainability_")) return "Sustainability Page";
  return "Other";
}

function AdminSiteBanners() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "site-banners"],
    queryFn: listSiteBanners,
  });

  const groups = new Map<string, AdminSiteBanner[]>();
  for (const banner of data ?? []) {
    const group = groupLabel(banner.key);
    groups.set(group, [...(groups.get(group) ?? []), banner]);
  }
  // Keep a stable, sensible section order rather than
  // whatever order Object/Map iteration happens to produce.
  const orderedGroups = ["Global", "Homepage", "Shop Page", "Mega Menu", "On Sale Page", "Sustainability Page"]
    .filter((g) => groups.has(g))
    .map((g) => [g, groups.get(g)!] as const);

  return (
    <div className="font-loomino">
      <AdminPageHeader
        icon={<Images size={20} />}
        title="Site Banners"
        subtitle="Replace storefront images across the site without touching code"
      />

      {isLoading && (
        <p className="py-10 text-center text-[14px] text-[#B08C7A]">
          Loading…
        </p>
      )}

      {isError && (
        <p className="py-10 text-center text-[14px] text-[#9A3B3B]">
          Couldn't load site banners.
        </p>
      )}

      {!isLoading &&
        !isError &&
        orderedGroups.map(([group, banners]) => (
          <div key={group} className="mb-10">
            <h2 className="mb-4 text-[16px] font-semibold text-[#3A2E1B]">
              {group}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {banners.map((banner) => (
                <BannerCard key={banner.key} banner={banner} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export default AdminSiteBanners;
