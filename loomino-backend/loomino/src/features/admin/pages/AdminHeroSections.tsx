import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LayoutGrid, Pencil, Trash2, Pause, Play } from "lucide-react";

import { getMediaUrl } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, { type Column } from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import AdminButton from "../components/AdminButton";
import AdminField from "../components/AdminField";
import StatusBadge from "../components/StatusBadge";
import {
  listHeroSections,
  createHeroSection,
  updateHeroSection,
  deleteHeroSection,
  toggleHeroSectionActive,
} from "../services/cms.service";
import type {
  AdminHeroSection,
  HeroSectionPayload,
} from "../types/cms";

function AdminHeroSections() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "hero-sections"],
    queryFn: listHeroSections,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<AdminHeroSection | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [shortDescription, setShortDescription] =
    useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState("1");
  const [imageFile, setImageFile] = useState<File | null>(
    null,
  );
  const [existingImage, setExistingImage] = useState<
    string | null
  >(null);

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "hero-sections"],
    });

  const create = useMutation({
    mutationFn: (payload: HeroSectionPayload) =>
      createHeroSection(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Hero section added.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't add hero section."),
      ),
  });

  const update = useMutation({
    mutationFn: (payload: HeroSectionPayload) =>
      updateHeroSection(editing!.id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Hero section updated.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update hero section."),
      ),
  });

  const del = useMutation({
    mutationFn: (id: number) => deleteHeroSection(id),
    onSuccess: () => {
      invalidate();
      toast.success("Hero section deleted.");
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't delete hero section."),
      ),
  });

  const toggle = useMutation({
    mutationFn: (id: number) => toggleHeroSectionActive(id),
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
    setShortDescription("");
    setVideoUrl("");
    setOrder("1");
    setImageFile(null);
    setExistingImage(null);
    setModalOpen(true);
  };

  const openEdit = (h: AdminHeroSection) => {
    setEditing(h);
    setTitle(h.title);
    setSubtitle(h.subtitle);
    setShortDescription(h.short_description);
    setVideoUrl(h.video_url);
    setOrder(String(h.display_order));
    setImageFile(null);
    setExistingImage(h.banner_image);
    setModalOpen(true);
  };

  const submit = () => {
    if (!title.trim()) {
      toast.error("Section title is required.");
      return;
    }
    const payload: HeroSectionPayload = {
      title,
      subtitle,
      short_description: shortDescription,
      video_url: videoUrl,
      display_order: Number(order) || 0,
      is_active: editing ? editing.is_active : true,
      ...(imageFile ? { banner_image: imageFile } : {}),
    };
    if (editing) update.mutate(payload);
    else create.mutate(payload);
  };

  const columns: Column<AdminHeroSection>[] = [
    {
      header: "Banner Image",
      cell: (h) =>
        h.banner_image ? (
          <img
            src={getMediaUrl(h.banner_image) ?? ""}
            alt={h.title}
            className="h-12 w-16 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-16 rounded-lg bg-[#F0E9DA]" />
        ),
    },
    {
      header: "Section Title",
      cell: (h) => (
        <span className="font-medium text-[#2C2418]">
          {h.title}
        </span>
      ),
    },
    {
      header: "Short Description",
      cell: (h) => (
        <span className="line-clamp-1 max-w-[280px] text-[#6B5E48]">
          {h.short_description || "—"}
        </span>
      ),
    },
    {
      header: "Order",
      cell: (h) => (
        <span className="text-[#8A7C64]">
          #{h.display_order}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (h) => (
        <StatusBadge
          status={h.is_active ? "active" : "inactive"}
        />
      ),
    },
    {
      header: "Actions",
      cell: (h) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={
              h.is_active ? "Deactivate" : "Activate"
            }
            onClick={() => toggle.mutate(h.id)}
            className="rounded-md p-2 text-[#9A7B1E] hover:bg-[#FBF3D9]"
          >
            {h.is_active ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </button>
          <button
            type="button"
            aria-label="Edit hero section"
            onClick={() => openEdit(h)}
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F7F0E5]"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete hero section"
            onClick={() => {
              if (confirm("Delete this hero section?"))
                del.mutate(h.id);
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
        icon={<LayoutGrid size={20} />}
        title="Hero Sections"
        subtitle="Manage customizable hero content blocks on the homepage"
        action={
          <AdminButton onClick={openCreate}>
            + Add Hero Section
          </AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(h) => h.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No hero sections yet."
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Update Hero Section" : "Add Hero Section"}
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
          <div>
            <AdminField
              label="Section Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
                Subtitle / Sub Title
              </span>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-[#DDD3C0] bg-white px-3 py-2 text-[14px] text-[#2C2418] outline-none focus:border-[#A88548]"
              />
            </label>
            <label className="mb-4 block">
              <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
                Short Description
              </span>
              <textarea
                value={shortDescription}
                onChange={(e) =>
                  setShortDescription(e.target.value)
                }
                rows={3}
                className="w-full rounded-lg border border-[#DDD3C0] bg-white px-3 py-2 text-[14px] text-[#2C2418] outline-none focus:border-[#A88548]"
              />
            </label>
            <AdminField
              label="Video URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-[#3A2E1B]">
                Banner Image
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
            <p className="-mt-3 text-[12px] text-[#A89A80]">
              Lower numbers appear first on the page.
            </p>
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
            {editing ? "Save Changes" : "Add Hero Section"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}

export default AdminHeroSections;
