import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Image, Pencil, Trash2, Pause, Play } from "lucide-react";

import { getMediaUrl } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, { type Column } from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import AdminButton from "../components/AdminButton";
import AdminField from "../components/AdminField";
import StatusBadge from "../components/StatusBadge";
import {
  listOfferBanners,
  createOfferBanner,
  updateOfferBanner,
  deleteOfferBanner,
  toggleOfferBannerActive,
} from "../services/cms.service";
import type {
  AdminOfferBanner,
  OfferBannerPayload,
  OfferBannerPlacement,
} from "../types/cms";

const PLACEMENT_LABELS: Record<OfferBannerPlacement, string> = {
  mega_menu: "Mega Menu Banner",
  offer_section: "Offer Section Banner",
};

function AdminOfferBanners() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "offer-banners"],
    queryFn: listOfferBanners,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<AdminOfferBanner | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [placement, setPlacement] =
    useState<OfferBannerPlacement>("mega_menu");
  const [order, setOrder] = useState("1");
  const [imageFile, setImageFile] = useState<File | null>(
    null,
  );
  const [existingImage, setExistingImage] = useState<
    string | null
  >(null);

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "offer-banners"],
    });

  const create = useMutation({
    mutationFn: (payload: OfferBannerPayload) =>
      createOfferBanner(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Banner added.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't add banner.")),
  });

  const update = useMutation({
    mutationFn: (payload: OfferBannerPayload) =>
      updateOfferBanner(editing!.id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Banner updated.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update banner."),
      ),
  });

  const del = useMutation({
    mutationFn: (id: number) => deleteOfferBanner(id),
    onSuccess: () => {
      invalidate();
      toast.success("Banner deleted.");
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't delete banner."),
      ),
  });

  const toggle = useMutation({
    mutationFn: (id: number) => toggleOfferBannerActive(id),
    onSuccess: invalidate,
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update status."),
      ),
  });

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setSubtitle("");
    setPlacement("mega_menu");
    setOrder("1");
    setImageFile(null);
    setExistingImage(null);
    setModalOpen(true);
  };

  const openEdit = (b: AdminOfferBanner) => {
    setEditing(b);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setPlacement(b.placement_type);
    setOrder(String(b.display_order));
    setImageFile(null);
    setExistingImage(b.image);
    setModalOpen(true);
  };

  const submit = () => {
    if (!title.trim()) {
      toast.error("Banner title is required.");
      return;
    }
    const payload: OfferBannerPayload = {
      title,
      subtitle,
      placement_type: placement,
      display_order: Number(order) || 0,
      is_active: editing ? editing.is_active : true,
      ...(imageFile ? { image: imageFile } : {}),
    };
    if (editing) update.mutate(payload);
    else create.mutate(payload);
  };

  const columns: Column<AdminOfferBanner>[] = [
    {
      header: "Banner Image",
      cell: (b) =>
        b.image ? (
          <img
            src={getMediaUrl(b.image) ?? ""}
            alt={b.title}
            className="h-12 w-16 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-16 rounded-lg bg-[#F0E9DA]" />
        ),
    },
    {
      header: "Banner Content",
      cell: (b) => (
        <div>
          <p className="font-medium text-[#2C2418]">
            {b.title}
          </p>
          <p className="line-clamp-1 max-w-[280px] text-[13px] text-[#8A7C64]">
            {b.subtitle}
          </p>
        </div>
      ),
    },
    {
      header: "Order / Sequence",
      cell: (b) => (
        <span className="text-[#8A7C64]">
          #{b.display_order}
        </span>
      ),
    },
    {
      header: "Type / Placement",
      cell: (b) => (
        <span className="inline-flex rounded-full bg-[#EEE7F7] px-3 py-1 text-[12px] font-medium text-[#6B4FA0]">
          {PLACEMENT_LABELS[b.placement_type]}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (b) => (
        <StatusBadge
          status={b.is_active ? "active" : "inactive"}
        />
      ),
    },
    {
      header: "Actions",
      cell: (b) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={
              b.is_active ? "Deactivate" : "Activate"
            }
            onClick={() => toggle.mutate(b.id)}
            className="rounded-md p-2 text-[#9A7B1E] hover:bg-[#FBF3D9]"
          >
            {b.is_active ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </button>
          <button
            type="button"
            aria-label="Edit banner"
            onClick={() => openEdit(b)}
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F7F0E5]"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete banner"
            onClick={() => {
              if (confirm("Delete this banner?"))
                del.mutate(b.id);
            }}
            className="rounded-md p-2 text-[#9A3B3B] hover:bg-[#F7ECEC]"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="font-loomino">
      <AdminPageHeader
        icon={<Image size={20} />}
        title="Offer Banners"
        subtitle="Manage promotional banners across the store"
        action={
          <AdminButton onClick={openCreate}>
            + Add Banner
          </AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(b) => b.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No offer banners yet."
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Update Banner" : "Add Banner"}
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
          <div>
            <AdminField
              label="Banner Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
                Subtitle / Description
              </span>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[#DDD3C0] bg-white px-3 py-2 text-[14px] text-[#2C2418] outline-none focus:border-[#A88548]"
              />
            </label>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
                Placement Type
              </span>
              <select
                value={placement}
                onChange={(e) =>
                  setPlacement(
                    e.target.value as OfferBannerPlacement,
                  )
                }
                className="h-[42px] w-full rounded-lg border border-[#DDD3C0] bg-white px-3 text-[14px] text-[#2C2418] outline-none focus:border-[#A88548]"
              >
                <option value="mega_menu">
                  Mega Menu Banner
                </option>
                <option value="offer_section">
                  Offer Section Banner
                </option>
              </select>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-[#3A2E1B]">
                Primary Image
              </p>
              {(imageFile || existingImage) && (
                <img
                  src={
                    imageFile
                      ? URL.createObjectURL(imageFile)
                      : (getMediaUrl(existingImage) ?? "")
                  }
                  alt="Banner preview"
                  className="mb-2 h-28 w-full rounded-lg object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files?.[0] ?? null)
                }
                className="block w-full text-[13px] text-[#6B5E48] file:mr-3 file:rounded-md file:border-0 file:bg-[#F0E9DA] file:px-3 file:py-2 file:text-[13px] file:text-[#6B5E48] hover:file:bg-[#E5DBC5]"
              />
            </div>

            <AdminField
              label="Order / Sequence Num"
              type="number"
              value={order}
              onChange={(e) => setOrder(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <AdminButton
            variant="outline"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </AdminButton>
          <AdminButton
            onClick={submit}
            disabled={create.isPending || update.isPending}
          >
            {editing ? "Save Changes" : "Add Banner"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}

export default AdminOfferBanners;
