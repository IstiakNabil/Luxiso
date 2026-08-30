import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Images, Upload } from "lucide-react";

import { getMediaUrl } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import {
  listSiteBanners,
  updateSiteBanner,
} from "../services/cms.service";
import type { AdminSiteBanner } from "../types/cms";

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
          <div className="flex h-full w-full items-center justify-center text-center text-[13px] text-[#A89A80]">
            No image uploaded yet
          </div>
        )}
      </div>

      <p className="mb-2 text-[14px] font-semibold text-[#2C2418]">
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
    </div>
  );
}

function groupLabel(key: string): string {
  if (
    key.startsWith("collection_") ||
    key.startsWith("hero_slide_") ||
    key === "sustainability"
  )
    return "Homepage";
  if (key.startsWith("modiweek_")) return "Modiweek Page";
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
  const orderedGroups = ["Homepage", "Modiweek Page", "Sustainability Page"]
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
        <p className="py-10 text-center text-[14px] text-[#A89A80]">
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
