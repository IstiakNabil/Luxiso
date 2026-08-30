import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FileText, Pencil, Trash2 } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, { type Column } from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import AdminButton from "../components/AdminButton";
import AdminField from "../components/AdminField";
import {
  listCustomPages,
  createCustomPage,
  updateCustomPage,
  deleteCustomPage,
} from "../services/cms.service";
import type {
  AdminCustomPage,
  CustomPagePayload,
} from "../types/cms";

function AdminPages() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "pages"],
    queryFn: listCustomPages,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<AdminCustomPage | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "pages"],
    });

  const create = useMutation({
    mutationFn: (payload: CustomPagePayload) =>
      createCustomPage(payload),
    onSuccess: () => {
      invalidate();
      toast.success("Page created.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't create page."),
      ),
  });

  const update = useMutation({
    mutationFn: (payload: CustomPagePayload) =>
      updateCustomPage(editing!.id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Page updated.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update page."),
      ),
  });

  const del = useMutation({
    mutationFn: (id: number) => deleteCustomPage(id),
    onSuccess: () => {
      invalidate();
      toast.success("Page deleted.");
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't delete page."),
      ),
  });

  const openCreate = () => {
    setEditing(null);
    setTitle("");
    setContent("");
    setModalOpen(true);
  };

  const openEdit = (p: AdminCustomPage) => {
    setEditing(p);
    setTitle(p.title);
    setContent(p.content);
    setModalOpen(true);
  };

  const submit = () => {
    if (!title.trim()) {
      toast.error("Page title is required.");
      return;
    }
    const payload: CustomPagePayload = { title, content };
    if (editing) update.mutate(payload);
    else create.mutate(payload);
  };

  const columns: Column<AdminCustomPage>[] = [
    {
      header: "Name",
      cell: (p) => (
        <span className="font-medium text-[#2C2418]">
          {p.title}
        </span>
      ),
    },
    {
      header: "URL Slug",
      cell: (p) => (
        <span className="rounded-md bg-[#F0E9DA] px-2 py-1 font-mono text-[12px] text-[#6B5E48]">
          /{p.slug}
        </span>
      ),
    },
    {
      header: "Created Date",
      cell: (p) => (
        <span className="text-[#8A7C64]">
          {formatDate(p.created_at)}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (p) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Edit page"
            onClick={() => openEdit(p)}
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F7F0E5]"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete page"
            onClick={() => {
              if (confirm("Delete this page?"))
                del.mutate(p.id);
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
        icon={<FileText size={20} />}
        title="Custom Pages"
        subtitle="Manage terms, privacy, and other informational pages"
        action={
          <AdminButton onClick={openCreate}>
            + Create Page
          </AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(p) => p.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No custom pages yet."
      />

      <AdminModal
        open={modalOpen}
        title={editing ? "Edit Custom Page" : "Create Custom Page"}
        onClose={() => setModalOpen(false)}
        size="lg"
      >
        <AdminField
          label="Page Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="mb-4 block">
          <span className="mb-1.5 block text-[13px] font-medium text-[#3A2E1B]">
            Page Content
          </span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full rounded-lg border border-[#DDD3C0] bg-white px-3 py-2 font-mono text-[13px] leading-relaxed text-[#2C2418] outline-none focus:border-[#A88548]"
            placeholder="Plain text or HTML — this is rendered as-is on the page."
          />
          <p className="mt-1.5 text-[12px] text-[#A89A80]">
            Supports plain text or basic HTML. A rich-text editor
            can be added here later if needed.
          </p>
        </label>

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
            {editing ? "Save Changes" : "Create Page"}
          </AdminButton>
        </div>
      </AdminModal>
    </div>
  );
}

export default AdminPages;
