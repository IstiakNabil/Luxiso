import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import {
  useProducts,
  useDeleteProduct,
  useCategories,
  useBrands,
  useTaxRates,
  useAllUnits,
} from "../hooks/useProducts";
import { getProducts } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import type { ProductRow, ProductFilters } from "../types/pos";

const DEFAULT_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23C9C4E8" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  );

function POSProductListPage() {
  const { me } = usePOSAuth();
  const canEdit = me?.has_pos_access && me.permissions.can_edit_products;

  const [tab, setTab] = useState<"all" | "stock-report">("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [productType, setProductType] = useState<"" | "single" | "variable">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [unitId, setUnitId] = useState<number | "">("");
  const [taxId, setTaxId] = useState<number | "">("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [locationId, setLocationId] = useState<number | "">("");
  const [notForSelling, setNotForSelling] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();
  const taxRatesQuery = useTaxRates();
  const unitsQuery = useAllUnits();
  const locationsQuery = usePOSLocations();
  const deleteMutation = useDeleteProduct();

  const filters: ProductFilters = {
    ...(search ? { search } : {}),
    ...(productType ? { product_type: productType } : {}),
    ...(categoryId ? { category: categoryId } : {}),
    ...(unitId ? { unit: unitId } : {}),
    ...(taxId ? { tax_rate: taxId } : {}),
    ...(brandId ? { brand: brandId } : {}),
    ...(locationId ? { location: locationId } : {}),
    ...(notForSelling ? { not_for_selling: true } : {}),
  };

  const listQuery = useProducts(page, filters);

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Product deleted.");
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-[#221F35]">Products</h1>
          <p className="text-[13px] text-[#726C8C]">Manage your products</p>
        </div>
        {canEdit && (
          <Link
            to="/admin/pos/products/add"
            className="flex items-center gap-2 rounded-lg bg-[#7C6AE8] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
          >
            <Plus size={16} /> Add
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <FilterSelect
            label="Product Type"
            value={productType}
            onChange={(v) => {
              setProductType(v as typeof productType);
              setPage(1);
            }}
            options={[
              { value: "", label: "All" },
              { value: "single", label: "Single" },
              { value: "variable", label: "Variable" },
            ]}
          />
          <FilterSelect
            label="Category"
            value={categoryId}
            onChange={(v) => {
              setCategoryId(v === "" ? "" : Number(v));
              setPage(1);
            }}
            options={[
              { value: "", label: "All" },
              ...(categoriesQuery.data?.map((c) => ({ value: c.id, label: c.name })) ?? []),
            ]}
          />
          <FilterSelect
            label="Unit"
            value={unitId}
            onChange={(v) => {
              setUnitId(v === "" ? "" : Number(v));
              setPage(1);
            }}
            options={[
              { value: "", label: "All" },
              ...(unitsQuery.data?.map((u) => ({ value: u.id, label: u.name })) ?? []),
            ]}
          />
          <FilterSelect
            label="Tax"
            value={taxId}
            onChange={(v) => {
              setTaxId(v === "" ? "" : Number(v));
              setPage(1);
            }}
            options={[
              { value: "", label: "All" },
              ...(taxRatesQuery.data?.map((t) => ({ value: t.id, label: t.name })) ?? []),
            ]}
          />
          <FilterSelect
            label="Brand"
            value={brandId}
            onChange={(v) => {
              setBrandId(v === "" ? "" : Number(v));
              setPage(1);
            }}
            options={[
              { value: "", label: "All" },
              ...(brandsQuery.data?.map((b) => ({ value: b.id, label: b.name })) ?? []),
            ]}
          />
          <FilterSelect
            label="Business Location"
            value={locationId}
            onChange={(v) => {
              setLocationId(v === "" ? "" : Number(v));
              setPage(1);
            }}
            options={[
              { value: "", label: "All" },
              ...(locationsQuery.data?.map((l) => ({ value: l.id, label: l.name })) ?? []),
            ]}
          />
          <label className="flex items-end gap-2 pb-2 text-[13px] text-[#221F35]">
            <input
              type="checkbox"
              checked={notForSelling}
              onChange={(e) => {
                setNotForSelling(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
            />
            Not for selling
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#E7E4F3]">
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>
          All Products
        </TabButton>
        <TabButton active={tab === "stock-report"} onClick={() => setTab("stock-report")}>
          Stock Report
        </TabButton>
      </div>

      {tab === "stock-report" ? (
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-10 text-center text-[13px] text-[#A8A2C9]">
          Stock Report is part of the Reports section, coming later.
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] bg-white px-3 py-2 md:w-72">
            <Search size={14} className="text-[#8A84B8]" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name or SKU…"
              className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
            />
          </div>

          <DataTableShell<ProductRow>
            title="All Products"
            data={listQuery.data}
            isLoading={listQuery.isLoading}
            page={page}
            onPageChange={setPage}
            rowKey={(row) => row.id}
            emptyLabel="No products yet — click Add to get started."
            filenameBase="products"
            fetchAll={() => fetchAllPages((p) => getProducts(p, filters))}
            columns={[
              {
                header: "Image",
                exportable: false,
                render: (row) => (
                  <img
                    src={row.image_url ?? DEFAULT_IMAGE}
                    alt={row.name}
                    className="h-9 w-9 rounded-md border border-[#E7E4F3] object-cover"
                  />
                ),
              },
              { header: "Product", render: (row) => row.name },
              { header: "SKU", render: (row) => row.sku || "—" },
              { header: "Business Location", render: (row) => row.location_names },
              {
                header: "Unit Purchase Price",
                align: "right",
                render: (row) => row.unit_purchase_price,
              },
              { header: "Selling Price", align: "right", render: (row) => row.selling_price },
              { header: "Current Stock", align: "right", render: (row) => row.current_stock },
              { header: "Product Type", render: (row) => row.product_type },
              { header: "Category", render: (row) => row.category_name },
              { header: "Brand", render: (row) => row.brand_name },
              { header: "Tax", render: (row) => row.tax_name },
              { header: "Custom Field1", render: (row) => row.custom_field_1 || "—" },
              { header: "Custom Field2", render: (row) => row.custom_field_2 || "—" },
              { header: "Custom Field3", render: (row) => row.custom_field_3 || "—" },
              { header: "Custom Field4", render: (row) => row.custom_field_4 || "—" },
              {
                header: "Status",
                render: (row) => (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      row.is_active
                        ? "bg-[#E6F7EC] text-[#2E9E5B]"
                        : "bg-[#F1F0F8] text-[#726C8C]"
                    }`}
                  >
                    {row.is_active ? "Active" : "Inactive"}
                  </span>
                ),
                exportValue: (row) => (row.is_active ? "Active" : "Inactive"),
              },
              {
                header: "Action",
                exportable: false,
                render: (row) =>
                  canEdit ? (
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/pos/products/${row.id}/edit`}
                        className="flex items-center gap-1 rounded-md border border-[#E7E4F3] px-2.5 py-1 text-[12px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
                      >
                        <Pencil size={12} /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(row.id)}
                        className="flex items-center gap-1 rounded-md border border-[#F3DCDC] px-2.5 py-1 text-[12px] font-medium text-[#C24F4F] hover:bg-[#FBE9E9]"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 text-[12px] text-[#A8A2C9]">
                      <Package size={12} /> View only
                    </span>
                  ),
              },
            ]}
          />
        </>
      )}

      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-[15px] font-semibold text-[#221F35]">Delete this product?</h3>
            <p className="mt-1 text-[13px] text-[#726C8C]">
              Products with stock movement history can't be deleted — set them Inactive
              instead.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-lg border border-[#E7E4F3] px-4 py-2 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-[#C24F4F] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#B03F3F] disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number | string;
  onChange: (v: string) => void;
  options: { value: number | string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-2 text-[13px] font-medium transition ${
        active
          ? "border-[#7C6AE8] text-[#7C6AE8]"
          : "border-transparent text-[#726C8C] hover:text-[#221F35]"
      }`}
    >
      {children}
    </button>
  );
}

export default POSProductListPage;
