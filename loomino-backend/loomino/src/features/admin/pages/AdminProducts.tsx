import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Package, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { formatPrice, getMediaUrl } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import AdminPageHeader from "../components/AdminPageHeader";
import AdminTable, {
  type Column,
} from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import AdminButton from "../components/AdminButton";
import StatusBadge from "../components/StatusBadge";
import ProductForm from "../components/ProductForm";
import {
  listProducts,
  deleteProduct,
  getProduct,
  createProduct,
  updateProduct,
} from "../services/commerce.service";
import type {
  AdminProduct,
  AdminProductDetail,
  ProductPayload,
} from "../types/commerce";

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: listProducts,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] =
    useState<AdminProductDetail | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin", "products"],
    });
    // The storefront reads these — refresh so a new product
    // shows up immediately without a hard reload.
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["modiweek"] });
    queryClient.invalidateQueries({
      queryKey: ["best-sellers"],
    });
  };

  const create = useMutation({
    mutationFn: createProduct,
    onSuccess: (product) => {
      invalidate();
      toast.success(
        "Product created — you can now add images.",
      );
      // Keep the modal open in edit mode so images can be
      // uploaded straight away (upload needs a product id).
      setEditing(product);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't create product."),
      ),
  });

  const update = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ProductPayload>;
    }) => updateProduct(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success("Product updated.");
      setModalOpen(false);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't update product."),
      ),
  });

  const del = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate();
      toast.success("Product deleted.");
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't delete product."),
      ),
  });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = async (id: number) => {
    setLoadingEdit(true);
    try {
      const detail = await getProduct(id);
      setEditing(detail);
      setModalOpen(true);
    } catch (e) {
      toast.error(
        getApiErrorMessage(e, "Couldn't load product."),
      );
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleSubmit = (payload: ProductPayload) => {
    if (editing) {
      update.mutate({ id: editing.id, payload });
    } else {
      create.mutate(payload);
    }
  };

  const columns: Column<AdminProduct>[] = [
    {
      header: "Product",
      cell: (p) => (
        <div className="flex items-center gap-3">
          {p.thumbnail ? (
            <img
              src={getMediaUrl(p.thumbnail) ?? ""}
              alt={p.name}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#F0E9DA] text-[12px] text-[#A88548]">
              {p.name[0]}
            </span>
          )}
          <span className="font-medium text-[#2C2418]">
            {p.name}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      cell: (p) => (
        <span className="text-[#6B5E48]">
          {p.category ?? "—"}
        </span>
      ),
    },
    {
      header: "Stock",
      cell: (p) => (
        <span className="text-[#6B5E48]">
          {p.total_stock}
        </span>
      ),
    },
    {
      header: "Price",
      cell: (p) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#2C7A4B]">
            {formatPrice(
              p.discount_price ?? p.regular_price,
            )}
          </span>
          {p.discount_price && (
            <span className="text-[12px] text-[#A89A80] line-through">
              {formatPrice(p.regular_price)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      cell: (p) => (
        <StatusBadge
          status={p.is_active ? "Active" : "Inactive"}
        />
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (p) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            aria-label="Edit"
            disabled={loadingEdit}
            onClick={() => void openEdit(p.id)}
            className="rounded-md p-2 text-[#6B5E48] hover:bg-[#F0E9DA] disabled:opacity-50"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label="Delete"
            onClick={() => {
              if (confirm(`Delete "${p.name}"?`))
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
        icon={<Package size={20} />}
        title="Products"
        subtitle="Manage your store catalog and inventory"
        action={
          <AdminButton onClick={openCreate}>
            <Plus size={16} /> Add Product
          </AdminButton>
        }
      />

      <AdminTable
        columns={columns}
        rows={data ?? []}
        keyField={(p) => p.id}
        isLoading={isLoading}
        isError={isError}
        emptyMessage="No products yet. Add your first product."
      />

      <AdminModal
        open={modalOpen}
        size="lg"
        title={editing ? "Edit Product" : "Add Product"}
        onClose={() => setModalOpen(false)}
      >
        <ProductForm
          initial={editing}
          submitting={create.isPending || update.isPending}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </AdminModal>
    </div>
  );
}

export default AdminProducts;
