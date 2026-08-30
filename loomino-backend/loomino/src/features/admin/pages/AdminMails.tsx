import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, { type Column } from "../components/AdminTable";
import {
  listMails,
  deleteMail,
} from "../services/commerce.service";
import type { AdminMail } from "../types/commerce";

function senderName(m: AdminMail) {
  if (typeof m.sender === "string") return m.sender;
  return m.sender.name ?? m.sender.email ?? "—";
}
function senderEmail(m: AdminMail) {
  if (typeof m.sender === "string") return "";
  return m.sender.email ?? "";
}

function AdminMails() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "mails"],
    queryFn: listMails,
  });

  const del = useMutation({
    mutationFn: deleteMail,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "mails"],
      });
      toast.success("Message deleted.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't delete.")),
  });

  const columns: Column<AdminMail>[] = [
    {
      header: "Sender",
      cell: (m) => (
        <div>
          <p className="font-medium text-[#2C2418]">
            {senderName(m)}
          </p>
          <p className="text-[12px] text-[#A89A80]">
            {senderEmail(m)}
          </p>
        </div>
      ),
    },
    {
      header: "Subject",
      cell: (m) => (
        <span className="text-[#3A2E1B]">{m.subject}</span>
      ),
    },
    {
      header: "Message",
      cell: (m) => (
        <span className="text-[#8A7C64]">
          {m.message_snippet}
        </span>
      ),
    },
    {
      header: "Received",
      cell: (m) => (
        <span className="text-[#8A7C64]">
          {formatDate(m.created_at)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (m) => (
        <button
          type="button"
          aria-label="Delete"
          onClick={() => {
            if (confirm("Delete this message?"))
              del.mutate(m.id);
          }}
          className="rounded-md p-2 text-[#9A3B3B] hover:bg-[#F7ECEC]"
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="font-loomino">
      <AdminPageHeader
        icon={<Mail size={20} />}
        title="Customer Mails"
        subtitle="View and manage contact form messages"
      />
      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(m) => m.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No messages yet."
      />
    </div>
  );
}

export default AdminMails;
