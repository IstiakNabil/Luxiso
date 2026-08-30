import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { getMediaUrl } from "@/lib/utils";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, { type Column } from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import {
  listReviews,
  updateReviewStatus,
  deleteReview,
} from "../services/commerce.service";
import type { AdminReview } from "../types/commerce";

function Stars({ n }: { n: number }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={
            i <= n
              ? "fill-[#C9A227] stroke-[#C9A227]"
              : "fill-transparent stroke-[#D8CDB8]"
          }
        />
      ))}
    </span>
  );
}

function AdminReviews() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: listReviews,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "reviews"],
    });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      updateReviewStatus(id, status),
    onSuccess: () => {
      invalidate();
      toast.success("Review updated.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't update.")),
  });

  const del = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      invalidate();
      toast.success("Review deleted.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't delete.")),
  });

  const columns: Column<AdminReview>[] = [
    {
      header: "Product",
      cell: (r) => (
        <div className="flex items-center gap-3">
          {r.product.thumbnail ? (
            <img
              src={getMediaUrl(r.product.thumbnail) ?? ""}
              alt={r.product.name}
              className="h-9 w-9 rounded-md object-cover"
            />
          ) : null}
          <span className="font-medium text-[#2C2418]">
            {r.product.name}
          </span>
        </div>
      ),
    },
    {
      header: "Reviewer",
      cell: (r) => (
        <div>
          <p className="text-[#2C2418]">
            {r.reviewer.name ?? "—"}
          </p>
          <p className="text-[12px] text-[#A89A80]">
            {r.reviewer.email}
          </p>
        </div>
      ),
    },
    { header: "Rating", cell: (r) => <Stars n={r.rating} /> },
    {
      header: "Status",
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-1.5">
          <button
            type="button"
            aria-label="Approve"
            title="Publish"
            onClick={() =>
              setStatus.mutate({
                id: r.id,
                status: "published",
              })
            }
            className="rounded-md p-2 text-[#2F7D4F] hover:bg-[#E7F3EA]"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            aria-label="Reject"
            title="Reject"
            onClick={() =>
              setStatus.mutate({
                id: r.id,
                status: "rejected",
              })
            }
            className="rounded-md p-2 text-[#B4832A] hover:bg-[#FBF3D9]"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => {
              if (confirm("Delete this review?"))
                del.mutate(r.id);
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
        icon={<Star size={20} />}
        title="Product Reviews"
        subtitle="Manage ratings and customer feedback"
      />
      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(r) => r.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No reviews yet."
      />
    </div>
  );
}

export default AdminReviews;
