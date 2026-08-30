import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Upload } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  useCategories,
  useBrands,
  useTaxRates,
  useAllUnits,
  useProductDetail,
  useUpdateProduct,
} from "../hooks/useProducts";
import type { ProductDetail } from "../types/pos";

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  options: { id: number; name: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
      >
        <option value="">None</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function POSEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const productId = id ? Number(id) : null;
  const productQuery = useProductDetail(productId);

  if (productQuery.isLoading || !productQuery.data) {
    return <p className="text-[13px] text-[#A8A2C9]">Loading…</p>;
  }

  // Keyed by id so navigating from one product's edit page directly to
  // another's remounts the form with fresh initial state.
  return <EditProductForm key={productQuery.data.id} product={productQuery.data} />;
}

/**
 * Split out so all initial state can come straight from `product` via
 * useState's initializer -- no effect needed to "sync" query data into
 * state after the fact, since this component only ever mounts once
 * the product has already loaded (see POSEditProductPage above).
 */
function EditProductForm({ product }: { product: ProductDetail }) {
  const navigate = useNavigate();

  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();
  const taxRatesQuery = useTaxRates();
  const unitsQuery = useAllUnits();
  const updateMutation = useUpdateProduct();

  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState<number | "">(product.category ?? "");
  const [brandId, setBrandId] = useState<number | "">(product.brand ?? "");
  const [taxId, setTaxId] = useState<number | "">(product.tax_rate ?? "");
  const [unitId, setUnitId] = useState<number | "">(product.unit ?? "");
  const [alertQuantity, setAlertQuantity] = useState(product.alert_quantity);
  const [customField1, setCustomField1] = useState(product.custom_field_1);
  const [customField2, setCustomField2] = useState(product.custom_field_2);
  const [customField3, setCustomField3] = useState(product.custom_field_3);
  const [customField4, setCustomField4] = useState(product.custom_field_4);
  const [notForSelling, setNotForSelling] = useState(product.not_for_selling);
  const [isActive, setIsActive] = useState(product.is_active);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    if (unitId) formData.append("unit", String(unitId));
    formData.append("category", categoryId ? String(categoryId) : "");
    formData.append("brand", brandId ? String(brandId) : "");
    formData.append("tax_rate", taxId ? String(taxId) : "");
    formData.append("alert_quantity", alertQuantity || "0");
    formData.append("custom_field_1", customField1);
    formData.append("custom_field_2", customField2);
    formData.append("custom_field_3", customField3);
    formData.append("custom_field_4", customField4);
    formData.append("not_for_selling", String(notForSelling));
    formData.append("is_active", String(isActive));
    if (imageFile) formData.append("image", imageFile);

    try {
      await updateMutation.mutateAsync({ id: product.id, formData });
      toast.success("Product updated.");
      navigate("/admin/pos/products/list");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Edit Product</h1>
        <p className="text-[13px] text-[#726C8C]">
          SKU {product.sku} · {product.product_type}
        </p>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Basic Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Product Name" value={name} onChange={setName} />
          <Select label="Unit" value={unitId} onChange={setUnitId} options={unitsQuery.data ?? []} />
          <Select label="Category" value={categoryId} onChange={setCategoryId} options={categoriesQuery.data ?? []} />
          <Select label="Brand" value={brandId} onChange={setBrandId} options={brandsQuery.data ?? []} />
          <Select
            label="Tax"
            value={taxId}
            onChange={setTaxId}
            options={(taxRatesQuery.data ?? []).map((t) => ({ id: t.id, name: `${t.name} (${t.rate}%)` }))}
          />
          <Field label="Alert Quantity" value={alertQuantity} onChange={setAlertQuantity} type="number" />
        </div>

        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
            <input
              type="checkbox"
              checked={notForSelling}
              onChange={(e) => setNotForSelling(e.target.checked)}
              className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
            />
            Not for selling
          </label>
          <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
            />
            Active
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Product Image</h3>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-lg border border-[#E7E4F3] bg-[#F5F4FA]">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <Upload size={20} className="text-[#C9C4E8]" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
            className="text-[13px] text-[#3A3560]"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Custom Fields</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Field label="Custom Field 1" value={customField1} onChange={setCustomField1} />
          <Field label="Custom Field 2" value={customField2} onChange={setCustomField2} />
          <Field label="Custom Field 3" value={customField3} onChange={setCustomField3} />
          <Field label="Custom Field 4" value={customField4} onChange={setCustomField4} />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[14px] font-semibold text-[#221F35]">Variants</h3>
        <p className="mb-3 text-[12px] text-[#A8A2C9]">
          Variant names/pricing and stock adjustments will move to their own Variations and
          Stock Adjustment pages — read-only here for now.
        </p>
        <div className="flex flex-col divide-y divide-[#F5F4FA]">
          {product.variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-2 text-[13px]">
              <span className="text-[#221F35]">{v.variant_name || "Default"}</span>
              <span className="text-[#726C8C]">{v.sku}</span>
              <span className="text-[#726C8C]">
                {v.purchase_price} → {v.selling_price}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => navigate("/admin/pos/products/list")}
          className="rounded-lg border border-[#E7E4F3] px-5 py-2.5 text-[13px] font-medium text-[#726C8C] hover:bg-[#F5F4FA]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="rounded-lg bg-[#7C6AE8] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#6C5AD8] disabled:opacity-60"
        >
          {updateMutation.isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default POSEditProductPage;
