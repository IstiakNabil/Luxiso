import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Trash2, Mail } from "lucide-react";
import { toast } from "sonner";

import { formatDate } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, { type Column } from "../components/AdminTable";
import {
  listSubscribers,
  deleteSubscriber,
} from "../services/commerce.service";
import type { AdminSubscriber } from "../types/commerce";

function AdminNewsletters() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "subscribers"],
    queryFn: listSubscribers,
  });

  const del = useMutation({
    mutationFn: deleteSubscriber,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "subscribers"],
      });
      toast.success("Subscriber removed.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't remove.")),
  });

  const columns: Column<AdminSubscriber>[] = [
    {
      header: "Email Address",
      cell: (s) => (
        <div className="flex items-center gap-2">
          <Mail size={15} className="text-[#A88548]" />
          <span className="font-medium text-[#2C2418]">
            {s.email}
          </span>
        </div>
      ),
    },
    {
      header: "Subscribed",
      cell: (s) => (
        <span className="text-[#8A7C64]">
          {formatDate(s.subscribed_at)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (s) => (
        <button
          type="button"
          aria-label="Delete"
          onClick={() => {
            if (confirm(`Remove ${s.email}?`))
              del.mutate(s.id);
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
        icon={<Send size={20} />}
        title="Newsletter Subscribers"
        subtitle="Manage emails subscribed to your newsletter"
      />
      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(s) => s.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No subscribers yet."
      />
    </div>
  );
}

export default AdminNewsletters;
