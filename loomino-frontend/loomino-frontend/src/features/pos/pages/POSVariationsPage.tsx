import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Search, Package } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  useProducts,
  useProductDetail,
  useVariations,
  useCreateVariation,
  useUpdateVariation,
  useDeleteVariation,
  useColors,
  useSizes,
} from "../hooks/useProducts";
import ColorFormModal from "../components/ColorFormModal";
import SizeFormModal from "../components/SizeFormModal";
import type { VariationRow, VariationWritePayload, ColorOption, SizeOption } from "../types/pos";

function Select({
  value,
  onChange,
  options,
  placeholder = "Select",
}: {
  value: number | "";
  onChange: (v: number | "") => void;
  options: { id: number; name: string }[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
    />
  );
}

/** Product picker shown until a product is chosen via ?product=<id>. */
function ProductPicker() {
  const [, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const listQuery = useProducts(1, search ? { search } : {});

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Variations</h1>
        <p className="text-[13px] text-[#726C8C]">
          Pick a product to add, edit, or remove its color/size variants.
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] bg-white px-3 py-2 md:w-96">
        <Search size={14} className="text-[#8A84B8]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product or SKU…"
          className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
        />
      </div>
      <div className="rounded-2xl border border-[#E7E4F3] bg-white">
        {listQuery.isLoading ? (
          <p className="p-5 text-[13px] text-[#A8A2C9]">Loading…</p>
        ) : (listQuery.data?.results.length ?? 0) === 0 ? (
          <p className="p-5 text-[13px] text-[#A8A2C9]">No matching products.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[#F5F4FA]">
            {listQuery.data!.results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSearchParams({ product: String(p.id) })}
                className="flex items-center justify-between px-5 py-3 text-left text-[13px] hover:bg-[#F5F4FA]"
              >
                <span className="text-[#221F35]">{p.name}</span>
                <span className="text-[#726C8C]">{p.sku}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function emptyNewRow(): VariationWritePayload {
  return { variant_name: "", color: "", size: "", sku: "", purchase_price: "0", selling_price: "0" };
}

function VariantEditor({ productId }: { productId: number }) {
  const [, setSearchParams] = useSearchParams();
  const productQuery = useProductDetail(productId);
  const variationsQuery = useVariations(productId);
  const colorsQuery = useColors();
  const sizesQuery = useSizes();
  const createMutation = useCreateVariation();
  const updateMutation = useUpdateVariation(productId);
  const deleteMutation = useDeleteVariation(productId);

  const [edits, setEdits] = useState<Record<number, Partial<VariationWritePayload>>>({});
  const [newRow, setNewRow] = useState<VariationWritePayload | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [colorModalTarget, setColorModalTarget] = useState<number | "new" | null>(null);
  const [sizeModalTarget, setSizeModalTarget] = useState<number | "new" | null>(null);

  const handleColorCreated = (color: ColorOption) => {
    if (colorModalTarget === "new") {
      setNewRow((prev) => (prev ? { ...prev, color: color.id } : prev));
    } else if (colorModalTarget !== null) {
      patchEdit(colorModalTarget, { color: color.id });
    }
    setColorModalTarget(null);
  };
  const handleSizeCreated = (size: SizeOption) => {
    if (sizeModalTarget === "new") {
      setNewRow((prev) => (prev ? { ...prev, size: size.id } : prev));
    } else if (sizeModalTarget !== null) {
      patchEdit(sizeModalTarget, { size: size.id });
    }
    setSizeModalTarget(null);
  };

  const getValue = <K extends keyof VariationRow>(row: VariationRow, key: K) =>
    (edits[row.id]?.[key as keyof VariationWritePayload] ?? row[key]) as never;

  const patchEdit = (id: number, patch: Partial<VariationWritePayload>) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const handleSaveRow = async (row: VariationRow) => {
    const payload = edits[row.id];
    if (!payload) return;
    try {
      const result = await updateMutation.mutateAsync({ id: row.id, payload });
      if (result.publish_warning) {
        toast.warning(`Saved, but not published online yet: ${result.publish_warning}`);
      } else {
        toast.success("Variant updated.");
      }
      setEdits((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Variant deleted.");
      setConfirmDeleteId(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setConfirmDeleteId(null);
    }
  };

  const handleAddNew = async () => {
    if (!newRow) return;
    if (!newRow.variant_name?.trim() && !(newRow.color && newRow.size)) {
      toast.error("Give the variant a name, or a color and size.");
      return;
    }
    try {
      const result = await createMutation.mutateAsync({ ...newRow, product: productId });
      if (result.publish_warning) {
        toast.warning(`Added, but not published online yet: ${result.publish_warning}`);
      } else {
        toast.success("Variant added.");
      }
      setNewRow(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (productQuery.isLoading || !productQuery.data) {
    return <p className="text-[13px] text-[#A8A2C9]">Loading…</p>;
  }
  const product = productQuery.data;
  const rows = variationsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className="mb-2 text-[12px] font-medium text-[#7C6AE8] hover:underline"
        >
          ← Choose a different product
        </button>
        <h1 className="text-[20px] font-bold text-[#221F35]">Variations — {product.name}</h1>
        <p className="text-[13px] text-[#726C8C]">SKU {product.sku}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#E7E4F3] bg-white">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[#E7E4F3] text-left text-[#726C8C]">
              <th className="px-4 py-3 font-medium">Label</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Purchase Price</th>
              <th className="px-4 py-3 font-medium">Selling Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F4FA]">
            {rows.map((row) => {
              const dirty = Boolean(edits[row.id]);
              return (
                <tr key={row.id}>
                  <td className="px-4 py-2">
                    <Input
                      value={getValue(row, "variant_name") ?? ""}
                      onChange={(v) => patchEdit(row.id, { variant_name: v })}
                      placeholder="Optional"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <Select
                        value={(edits[row.id]?.color ?? row.color ?? "") as number | ""}
                        onChange={(v) => patchEdit(row.id, { color: v })}
                        options={colorsQuery.data ?? []}
                      />
                      <button
                        type="button"
                        onClick={() => setColorModalTarget(row.id)}
                        className="shrink-0 rounded-md bg-[#7C6AE8] p-1.5 text-white hover:bg-[#6C5AD8]"
                        title="Add new color"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <Select
                        value={(edits[row.id]?.size ?? row.size ?? "") as number | ""}
                        onChange={(v) => patchEdit(row.id, { size: v })}
                        options={sizesQuery.data ?? []}
                      />
                      <button
                        type="button"
                        onClick={() => setSizeModalTarget(row.id)}
                        className="shrink-0 rounded-md bg-[#7C6AE8] p-1.5 text-white hover:bg-[#6C5AD8]"
                        title="Add new size"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      value={getValue(row, "sku") ?? ""}
                      onChange={(v) => patchEdit(row.id, { sku: v })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      value={getValue(row, "purchase_price") ?? ""}
                      onChange={(v) => patchEdit(row.id, { purchase_price: v })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      value={getValue(row, "selling_price") ?? ""}
                      onChange={(v) => patchEdit(row.id, { selling_price: v })}
                    />
                  </td>
                  <td className="px-4 py-2 text-[#726C8C]">{row.total_stock}</td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={(edits[row.id]?.is_active ?? row.is_active) as boolean}
                      onChange={(e) => patchEdit(row.id, { is_active: e.target.checked })}
                      className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {dirty && (
                        <button
                          type="button"
                          onClick={() => handleSaveRow(row)}
                          disabled={updateMutation.isPending}
                          className="rounded-md bg-[#7C6AE8] px-2.5 py-1 text-[12px] font-medium text-white hover:bg-[#6C5AD8] disabled:opacity-60"
                        >
                          Save
                        </button>
                      )}
                      {confirmDeleteId === row.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="rounded-md bg-[#C24F4F] px-2.5 py-1 text-[12px] font-medium text-white hover:bg-[#A83F3F]"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-md border border-[#E7E4F3] px-2.5 py-1 text-[12px] text-[#726C8C] hover:bg-[#F5F4FA]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(row.id)}
                          className="text-[#C24F4F] hover:underline"
                          title="Delete variant"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {newRow && (
              <tr className="bg-[#FAF9FF]">
                <td className="px-4 py-2">
                  <Input
                    value={newRow.variant_name ?? ""}
                    onChange={(v) => setNewRow({ ...newRow, variant_name: v })}
                    placeholder="Optional"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <Select
                      value={newRow.color ?? ""}
                      onChange={(v) => setNewRow({ ...newRow, color: v })}
                      options={colorsQuery.data ?? []}
                    />
                    <button
                      type="button"
                      onClick={() => setColorModalTarget("new")}
                      className="shrink-0 rounded-md bg-[#7C6AE8] p-1.5 text-white hover:bg-[#6C5AD8]"
                      title="Add new color"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <Select
                      value={newRow.size ?? ""}
                      onChange={(v) => setNewRow({ ...newRow, size: v })}
                      options={sizesQuery.data ?? []}
                    />
                    <button
                      type="button"
                      onClick={() => setSizeModalTarget("new")}
                      className="shrink-0 rounded-md bg-[#7C6AE8] p-1.5 text-white hover:bg-[#6C5AD8]"
                      title="Add new size"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={newRow.sku ?? ""}
                    onChange={(v) => setNewRow({ ...newRow, sku: v })}
                    placeholder="Auto-generated"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={newRow.purchase_price ?? "0"}
                    onChange={(v) => setNewRow({ ...newRow, purchase_price: v })}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={newRow.selling_price ?? "0"}
                    onChange={(v) => setNewRow({ ...newRow, selling_price: v })}
                  />
                </td>
                <td className="px-4 py-2 text-[#A8A2C9]">—</td>
                <td className="px-4 py-2" />
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddNew}
                      disabled={createMutation.isPending}
                      className="rounded-md bg-[#7C6AE8] px-2.5 py-1 text-[12px] font-medium text-white hover:bg-[#6C5AD8] disabled:opacity-60"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRow(null)}
                      className="rounded-md border border-[#E7E4F3] px-2.5 py-1 text-[12px] text-[#726C8C] hover:bg-[#F5F4FA]"
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!newRow && (
        <button
          type="button"
          onClick={() => setNewRow(emptyNewRow())}
          className="flex w-fit items-center gap-2 rounded-lg border border-dashed border-[#C9C4E8] px-4 py-2 text-[13px] font-medium text-[#7C6AE8] hover:bg-[#F5F4FA]"
        >
          <Plus size={16} /> Add variant
        </button>
      )}

      <p className="flex items-center gap-1.5 text-[12px] text-[#A8A2C9]">
        <Package size={12} />
        Deleting a variant with any sale/purchase history is blocked — set it to Inactive
        instead. A product always needs at least one variant.
      </p>

      <Link
        to={`/admin/pos/products/${productId}/edit`}
        className="text-[12px] font-medium text-[#7C6AE8] hover:underline"
      >
        ← Back to product details
      </Link>

      {colorModalTarget !== null && (
        <ColorFormModal onClose={() => setColorModalTarget(null)} onCreated={handleColorCreated} />
      )}
      {sizeModalTarget !== null && (
        <SizeFormModal onClose={() => setSizeModalTarget(null)} onCreated={handleSizeCreated} />
      )}
    </div>
  );
}

function POSVariationsPage() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("product");

  if (!productId) {
    return <ProductPicker />;
  }
  return <VariantEditor key={productId} productId={Number(productId)} />;
}

export default POSVariationsPage;
