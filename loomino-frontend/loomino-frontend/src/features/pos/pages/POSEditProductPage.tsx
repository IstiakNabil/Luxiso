import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Upload, Plus, Trash2 } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  useCategories,
  useBrands,
  useTaxRates,
  useAllUnits,
  useProductDetail,
  useUpdateProduct,
  useStorefrontCategories,
  useStorefrontTypes,
} from "../hooks/useProducts";
import StorefrontCategoryFormModal from "../components/StorefrontCategoryFormModal";
import StorefrontTypeFormModal from "../components/StorefrontTypeFormModal";
import CategoryFormModal from "../components/CategoryFormModal";
import TaxRateFormModal from "../components/TaxRateFormModal";
import type { ProductDetail, StorefrontCategory, StorefrontProductType, Category, TaxRate } from "../types/pos";

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
  const storefrontCategoriesQuery = useStorefrontCategories();

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

  // --- Online storefront ---------------------------------------
  const [publishOnline, setPublishOnline] = useState(product.publish_online);
  const [storefrontCategoryId, setStorefrontCategoryId] = useState<number | "">(
    product.storefront_category ?? "",
  );
  const [storefrontTypeId, setStorefrontTypeId] = useState<number | "">(
    product.storefront_type ?? "",
  );
  const [shortDescription, setShortDescription] = useState(product.short_description);
  const [fitting, setFitting] = useState(product.fitting);
  const [fabricAndCare, setFabricAndCare] = useState(product.fabric_and_care);
  const [shippingAndReturn, setShippingAndReturn] = useState(product.shipping_and_return);
  const [isFeatured, setIsFeatured] = useState(product.is_featured);
  const [isNewArrival, setIsNewArrival] = useState(product.is_new_arrival);
  const [isOnSale, setIsOnSale] = useState(product.is_on_sale);
  const [onlineDiscountPrice, setOnlineDiscountPrice] = useState(
    product.online_discount_price ?? "",
  );
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [hoverImageFile, setHoverImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [features, setFeatures] = useState<string[]>(
    product.features.length ? product.features.map((f) => f.feature) : [""],
  );
  const [quickAddStorefrontCategory, setQuickAddStorefrontCategory] = useState(false);
  const [quickAddStorefrontType, setQuickAddStorefrontType] = useState(false);
  const [quickAddCategory, setQuickAddCategory] = useState(false);
  const [quickAddTaxRate, setQuickAddTaxRate] = useState(false);

  const storefrontTypesQuery = useStorefrontTypes(
    storefrontCategoryId ? storefrontCategoryId : undefined,
  );

  const updateFeature = (index: number, value: string) =>
    setFeatures((prev) => prev.map((f, i) => (i === index ? value : f)));
  const addFeatureRow = () => setFeatures((prev) => [...prev, ""]);
  const removeFeatureRow = (index: number) =>
    setFeatures((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const handleGalleryFilesChange = (fileList: FileList | null) => {
    if (!fileList) return;
    setGalleryFiles((prev) => [...prev, ...Array.from(fileList)]);
  };
  const removeGalleryFile = (index: number) =>
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));

  const handleStorefrontCategoryCreated = (category: StorefrontCategory) => {
    setStorefrontCategoryId(category.id);
    setStorefrontTypeId("");
  };
  const handleStorefrontTypeCreated = (type: StorefrontProductType) => {
    setStorefrontTypeId(type.id);
  };
  const handleCategoryCreated = (category: Category) => {
    setCategoryId(category.id);
  };
  const handleTaxRateCreated = (taxRate: TaxRate) => {
    setTaxId(taxRate.id);
  };

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (publishOnline && !storefrontCategoryId) {
      toast.error("Choose a storefront category to publish this product online.");
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

    // Online storefront fields
    formData.append("publish_online", String(publishOnline));
    if (storefrontCategoryId) formData.append("storefront_category", String(storefrontCategoryId));
    if (storefrontTypeId) formData.append("storefront_type", String(storefrontTypeId));
    formData.append("short_description", shortDescription);
    formData.append("fitting", fitting);
    formData.append("fabric_and_care", fabricAndCare);
    formData.append("shipping_and_return", shippingAndReturn);
    formData.append("is_featured", String(isFeatured));
    formData.append("is_new_arrival", String(isNewArrival));
    formData.append("is_on_sale", String(isOnSale));
    if (onlineDiscountPrice) formData.append("online_discount_price", onlineDiscountPrice);
    formData.append(
      "features",
      JSON.stringify(features.map((f) => f.trim()).filter(Boolean)),
    );
    if (coverImageFile) formData.append("cover_image", coverImageFile);
    if (hoverImageFile) formData.append("hover_image", hoverImageFile);
    galleryFiles.forEach((f) => formData.append("gallery_images", f));

    try {
      const updated = await updateMutation.mutateAsync({ id: product.id, formData });
      if (updated.publish_warning) {
        toast.warning(`Saved, but not published online yet: ${updated.publish_warning}`);
      } else {
        toast.success("Product updated.");
      }
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
          {product.is_published_online && (
            <span className="ml-2 rounded-full bg-[#E6F7EC] px-2.5 py-0.5 text-[11px] font-medium text-[#2E9E5B]">
              Live Online
            </span>
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Basic Information</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Product Name" value={name} onChange={setName} />
          <Select label="Unit" value={unitId} onChange={setUnitId} options={unitsQuery.data ?? []} />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select label="Category" value={categoryId} onChange={setCategoryId} options={categoriesQuery.data ?? []} />
            </div>
            <button
              type="button"
              onClick={() => setQuickAddCategory(true)}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#7C6AE8] text-white hover:bg-[#6C5AD8]"
              title="Add new category"
            >
              <Plus size={16} />
            </button>
          </div>
          <Select label="Brand" value={brandId} onChange={setBrandId} options={brandsQuery.data ?? []} />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Tax"
                value={taxId}
                onChange={setTaxId}
                options={(taxRatesQuery.data ?? []).map((t) => ({ id: t.id, name: `${t.name} (${t.rate}%)` }))}
              />
            </div>
            <button
              type="button"
              onClick={() => setQuickAddTaxRate(true)}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#7C6AE8] text-white hover:bg-[#6C5AD8]"
              title="Add new tax rate"
            >
              <Plus size={16} />
            </button>
          </div>
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
            className="cursor-pointer text-[13px] text-[#3A3560] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#7C6AE8] file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-white hover:file:bg-[#6C5AD8]"
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
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-[#221F35]">Online Storefront</h3>
          <label className="flex items-center gap-2 text-[13px] font-medium text-[#221F35]">
            <input
              type="checkbox"
              checked={publishOnline}
              onChange={(e) => setPublishOnline(e.target.checked)}
              className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
            />
            Publish Online
          </label>
        </div>

        {publishOnline && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label="Storefront Category"
                    value={storefrontCategoryId}
                    onChange={(v) => { setStorefrontCategoryId(v); setStorefrontTypeId(""); }}
                    options={storefrontCategoriesQuery.data ?? []}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setQuickAddStorefrontCategory(true)}
                  className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#7C6AE8] text-white hover:bg-[#6C5AD8]"
                  title="Add new storefront category"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label="Storefront Type"
                    value={storefrontTypeId}
                    onChange={setStorefrontTypeId}
                    options={storefrontTypesQuery.data ?? []}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setQuickAddStorefrontType(true)}
                  className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#7C6AE8] text-white hover:bg-[#6C5AD8]"
                  title="Add new storefront type"
                >
                  <Plus size={16} />
                </button>
              </div>
              <Field
                label="Online Discount Price"
                value={onlineDiscountPrice}
                onChange={setOnlineDiscountPrice}
                type="number"
              />
            </div>

            <div className="mt-4">
              <Field label="Short Description" value={shortDescription} onChange={setShortDescription} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Fitting</span>
                <textarea
                  value={fitting}
                  onChange={(e) => setFitting(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
                />
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Fabric &amp; Care</span>
                <textarea
                  value={fabricAndCare}
                  onChange={(e) => setFabricAndCare(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
                />
              </div>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">Shipping &amp; Return</span>
                <textarea
                  value={shippingAndReturn}
                  onChange={(e) => setShippingAndReturn(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
                />
                New Arrival
              </label>
              <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
                <input
                  type="checkbox"
                  checked={isOnSale}
                  onChange={(e) => setIsOnSale(e.target.checked)}
                  className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
                />
                On Sale
              </label>
            </div>

            {product.gallery_images.length > 0 && (
              <div className="mt-5 border-t border-[#E7E4F3] pt-4">
                <span className="mb-2 block text-[13px] font-semibold text-[#221F35]">
                  Current Storefront Images
                </span>
                <div className="flex flex-wrap gap-3">
                  {product.gallery_images.map((img) => (
                    <div key={img.id} className="flex flex-col items-center gap-1">
                      <div className="h-16 w-16 overflow-hidden rounded-lg border border-[#E7E4F3] bg-[#F5F4FA]">
                        {img.image_url && (
                          <img src={img.image_url} alt={img.image_type} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <span className="text-[11px] text-[#A8A2C9]">{img.image_type}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[12px] text-[#A8A2C9]">
                  Adding new images below appends to this gallery — it doesn't replace it, except
                  Cover/Hover which are replaced if a new one is uploaded.
                </p>
              </div>
            )}

            <div className="mt-5 border-t border-[#E7E4F3] pt-4">
              <span className="mb-2 block text-[13px] font-semibold text-[#221F35]">
                Add Storefront Images
              </span>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                    Cover Image (replaces current)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImageFile(e.target.files?.[0] ?? null)}
                    className="cursor-pointer text-[13px] text-[#3A3560] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#7C6AE8] file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-white hover:file:bg-[#6C5AD8]"
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                    Hover Image (replaces current)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHoverImageFile(e.target.files?.[0] ?? null)}
                    className="cursor-pointer text-[13px] text-[#3A3560] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#7C6AE8] file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-white hover:file:bg-[#6C5AD8]"
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                    Gallery Images (adds more)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleGalleryFilesChange(e.target.files)}
                    className="cursor-pointer text-[13px] text-[#3A3560] file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#7C6AE8] file:px-3 file:py-2 file:text-[13px] file:font-medium file:text-white hover:file:bg-[#6C5AD8]"
                  />
                  {galleryFiles.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1">
                      {galleryFiles.map((f, i) => (
                        <li key={i} className="flex items-center justify-between text-[12px] text-[#726C8C]">
                          {f.name}
                          <button
                            type="button"
                            onClick={() => removeGalleryFile(i)}
                            className="text-[#C24F4F] hover:underline"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-[#E7E4F3] pt-4">
              <span className="mb-2 block text-[13px] font-semibold text-[#221F35]">Features</span>
              <div className="flex flex-col gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="e.g. 100% cotton"
                      className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
                    />
                    {features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeatureRow(index)}
                        className="shrink-0 text-[#C24F4F] hover:underline"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFeatureRow}
                className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-[#C9C4E8] px-4 py-2 text-[13px] font-medium text-[#7C6AE8] hover:bg-[#F5F4FA]"
              >
                <Plus size={16} /> Add feature
              </button>
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-[#221F35]">Variants</h3>
          <Link
            to={`/admin/pos/products/variations?product=${product.id}`}
            className="rounded-lg bg-[#7C6AE8] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#6C5AD8]"
          >
            Manage Variants (Color, Size, Pricing)
          </Link>
        </div>
        <p className="mb-3 text-[12px] text-[#A8A2C9]">
          Read-only here — add, edit, or remove a variant's color, size, and pricing on the
          Variations page.
        </p>
        <div className="flex flex-col divide-y divide-[#F5F4FA]">
          {product.variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between py-2 text-[13px]">
              <span className="text-[#221F35]">
                {v.variant_name ||
                  [v.color_name, v.size_name].filter(Boolean).join(" / ") ||
                  "Default"}
              </span>
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

      {quickAddStorefrontCategory && (
        <StorefrontCategoryFormModal
          onClose={() => setQuickAddStorefrontCategory(false)}
          onCreated={handleStorefrontCategoryCreated}
        />
      )}
      {quickAddStorefrontType && (
        <StorefrontTypeFormModal
          defaultCategoryId={storefrontCategoryId}
          onClose={() => setQuickAddStorefrontType(false)}
          onCreated={handleStorefrontTypeCreated}
        />
      )}
      {quickAddCategory && (
        <CategoryFormModal
          mode="add"
          onClose={() => setQuickAddCategory(false)}
          onCreated={handleCategoryCreated}
        />
      )}
      {quickAddTaxRate && (
        <TaxRateFormModal
          onClose={() => setQuickAddTaxRate(false)}
          onCreated={handleTaxRateCreated}
        />
      )}
    </div>
  );
}

export default POSEditProductPage;
