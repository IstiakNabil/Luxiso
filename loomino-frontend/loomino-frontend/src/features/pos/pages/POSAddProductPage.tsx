import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, Upload, Check } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSLocations } from "../hooks/useDashboard";
import {
  useCategories,
  useBrands,
  useTaxRates,
  useAllUnits,
  useCreateProduct,
  useStorefrontCategories,
  useStorefrontTypes,
  useColors,
  useSizes,
} from "../hooks/useProducts";
import UnitFormModal from "../components/UnitFormModal";
import BrandFormModal from "../components/BrandFormModal";
import ColorFormModal from "../components/ColorFormModal";
import SizeFormModal from "../components/SizeFormModal";
import StorefrontCategoryFormModal from "../components/StorefrontCategoryFormModal";
import StorefrontTypeFormModal from "../components/StorefrontTypeFormModal";
import type {
  BarcodeType,
  VariantInput,
  Unit,
  Brand,
  ColorOption,
  SizeOption,
  StorefrontCategory,
  StorefrontProductType,
} from "../types/pos";

const BARCODE_TYPES: { value: BarcodeType; label: string }[] = [
  { value: "c128", label: "Code 128 (C128)" },
  { value: "c39", label: "Code 39 (C39)" },
  { value: "ean13", label: "EAN-13" },
  { value: "ean8", label: "EAN-8" },
  { value: "upca", label: "UPC-A" },
  { value: "upce", label: "UPC-E" },
];

type VariantRow = VariantInput;

function emptyVariant(): VariantRow {
  return {
    variant_name: "",
    color: "",
    size: "",
    sku: "",
    purchase_price: "0",
    selling_price: "0",
    alert_quantity: "",
  };
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  info,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  info?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
        {label}
        {required && <span className="text-[#C24F4F]"> *</span>}
        {info && <span className="ml-1 text-[11px] font-normal text-[#A8A2C9]">({info})</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
  placeholder = "Please Select",
  required,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  options: { id: number; name: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
        {label}
        {required && <span className="text-[#C24F4F]"> *</span>}
      </span>
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
    </label>
  );
}

function POSAddProductPage() {
  const navigate = useNavigate();

  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();
  const taxRatesQuery = useTaxRates();
  const unitsQuery = useAllUnits();
  const locationsQuery = usePOSLocations();
  const createMutation = useCreateProduct();
  const storefrontCategoriesQuery = useStorefrontCategories();
  const colorsQuery = useColors();
  const sizesQuery = useSizes();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [barcodeType, setBarcodeType] = useState<BarcodeType>("c128");
  const [unitId, setUnitId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [taxId, setTaxId] = useState<number | "">("");
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const [manageStock, setManageStock] = useState(true);
  const [alertQuantity, setAlertQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [enableSerialTracking, setEnableSerialTracking] = useState(false);
  const [notForSelling, setNotForSelling] = useState(false);
  const [weight, setWeight] = useState("");
  const [customField1, setCustomField1] = useState("");
  const [customField2, setCustomField2] = useState("");
  const [customField3, setCustomField3] = useState("");
  const [customField4, setCustomField4] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<VariantRow[]>([emptyVariant()]);

  const [quickAddUnit, setQuickAddUnit] = useState(false);
  const [quickAddBrand, setQuickAddBrand] = useState(false);
  // Which variant row's Color/Size the quick-add modal applies to
  // once saved -- null means no modal is open.
  const [colorModalForRow, setColorModalForRow] = useState<number | null>(null);
  const [sizeModalForRow, setSizeModalForRow] = useState<number | null>(null);
  const [quickAddStorefrontCategory, setQuickAddStorefrontCategory] = useState(false);
  const [quickAddStorefrontType, setQuickAddStorefrontType] = useState(false);

  // --- Online storefront ---------------------------------------
  const [publishOnline, setPublishOnline] = useState(true);
  const [storefrontCategoryId, setStorefrontCategoryId] = useState<number | "">("");
  const [storefrontTypeId, setStorefrontTypeId] = useState<number | "">("");
  const [shortDescription, setShortDescription] = useState("");
  const [fitting, setFitting] = useState("");
  const [fabricAndCare, setFabricAndCare] = useState("");
  const [shippingAndReturn, setShippingAndReturn] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isOnSale, setIsOnSale] = useState(false);
  const [onlineDiscountPrice, setOnlineDiscountPrice] = useState("");
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [hoverImageFile, setHoverImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [features, setFeatures] = useState<string[]>([""]);

  const storefrontTypesQuery = useStorefrontTypes(
    storefrontCategoryId ? storefrontCategoryId : undefined,
  );

  const locations = locationsQuery.data ?? [];

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const toggleLocation = (id: number) => {
    setSelectedLocationIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleProductType = (variable: boolean) => {
    setHasVariants(variable);
    if (!variable) {
      setVariants((prev) => [{ ...prev[0], variant_name: "" }]);
    }
  };

  const updateVariant = (index: number, patch: Partial<VariantRow>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const addVariantRow = () => setVariants((prev) => [...prev, emptyVariant()]);
  const removeVariantRow = (index: number) =>
    setVariants((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));

  const handleUnitCreated = (unit: Unit) => setUnitId(unit.id);
  const handleBrandCreated = (brand: Brand) => setBrandId(brand.id);
  const handleColorCreated = (color: ColorOption) => {
    if (colorModalForRow !== null) updateVariant(colorModalForRow, { color: color.id });
    setColorModalForRow(null);
  };
  const handleSizeCreated = (size: SizeOption) => {
    if (sizeModalForRow !== null) updateVariant(sizeModalForRow, { size: size.id });
    setSizeModalForRow(null);
  };
  const handleStorefrontCategoryCreated = (category: StorefrontCategory) => {
    setStorefrontCategoryId(category.id);
    setStorefrontTypeId("");
  };
  const handleStorefrontTypeCreated = (type: StorefrontProductType) => {
    setStorefrontTypeId(type.id);
  };

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Product name is required.");
      return;
    }
    if (!unitId) {
      toast.error("Unit is required.");
      return;
    }
    if (hasVariants && variants.some((v) => !v.variant_name.trim() && !(v.color && v.size))) {
      toast.error("Every variant needs a name, or a color and size, for a Variable product.");
      return;
    }
    if (publishOnline && variants.some((v) => !v.color || !v.size)) {
      toast.error("Every variant needs a color and size to publish online.");
      return;
    }
    if (publishOnline && !storefrontCategoryId) {
      toast.error("Choose a storefront category to publish this product online.");
      return;
    }

    const variantsPayload: VariantInput[] = variants.map((v) => ({
      variant_name: hasVariants ? v.variant_name.trim() : "",
      color: v.color || undefined,
      size: v.size || undefined,
      sku: v.sku || undefined,
      purchase_price: v.purchase_price || "0",
      selling_price: v.selling_price || "0",
      alert_quantity: v.alert_quantity || undefined,
    }));

    const formData = new FormData();
    formData.append("name", name);
    if (sku) formData.append("sku", sku);
    formData.append("barcode_type", barcodeType);
    formData.append("unit", String(unitId));
    if (categoryId) formData.append("category", String(categoryId));
    if (subcategoryId) formData.append("subcategory", String(subcategoryId));
    if (brandId) formData.append("brand", String(brandId));
    if (taxId) formData.append("tax_rate", String(taxId));
    formData.append("alert_quantity", alertQuantity || "0");
    formData.append("description", description);
    formData.append("weight", weight || "");
    formData.append("custom_field_1", customField1);
    formData.append("custom_field_2", customField2);
    formData.append("custom_field_3", customField3);
    formData.append("custom_field_4", customField4);
    formData.append("not_for_selling", String(notForSelling));
    formData.append("is_active", String(isActive));
    formData.append("manage_stock", String(manageStock));
    formData.append("enable_serial_tracking", String(enableSerialTracking));
    formData.append("has_variants", String(hasVariants));
    formData.append("variants", JSON.stringify(variantsPayload));
    formData.append("locations", JSON.stringify(selectedLocationIds));
    if (imageFile) formData.append("image", imageFile);
    if (brochureFile) formData.append("brochure", brochureFile);

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
      const created = await createMutation.mutateAsync(formData);
      if (created.publish_warning) {
        toast.warning(`${name} saved, but not published online yet: ${created.publish_warning}`);
      } else {
        toast.success(`${name} added.`);
      }
      navigate("/admin/pos/products/list");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Add New Product</h1>
      </div>

      {/* Basic info */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Product Name" value={name} onChange={setName} placeholder="Product Name" required />
          <Field label="SKU" value={sku} onChange={setSku} placeholder="SKU" info="auto-generated if blank" />
          <Select
            label="Barcode Type"
            value={BARCODE_TYPES.findIndex((b) => b.value === barcodeType)}
            onChange={(idx) =>
              setBarcodeType(idx === "" ? "c128" : BARCODE_TYPES[Number(idx)].value)
            }
            options={BARCODE_TYPES.map((b, i) => ({ id: i, name: b.label }))}
            required
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Unit"
                value={unitId}
                onChange={setUnitId}
                options={unitsQuery.data ?? []}
                placeholder="Select unit"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setQuickAddUnit(true)}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#7C6AE8] text-white hover:bg-[#6C5AD8]"
              title="Add new unit"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select label="Brand" value={brandId} onChange={setBrandId} options={brandsQuery.data ?? []} />
            </div>
            <button
              type="button"
              onClick={() => setQuickAddBrand(true)}
              className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#7C6AE8] text-white hover:bg-[#6C5AD8]"
              title="Add new brand"
            >
              <Plus size={16} />
            </button>
          </div>

          <Select
            label="Category"
            value={categoryId}
            onChange={(v) => { setCategoryId(v); setSubcategoryId(""); }}
            options={(categoriesQuery.data ?? []).filter((c) => c.parent === null)}
          />
          <Select
            label="Sub category"
            value={subcategoryId}
            onChange={setSubcategoryId}
            options={(categoriesQuery.data ?? []).filter((c) => c.parent === categoryId)}
            placeholder={categoryId ? "Please Select" : "Select a category first"}
          />
          <Select
            label="Tax"
            value={taxId}
            onChange={setTaxId}
            options={(taxRatesQuery.data ?? []).map((t) => ({ id: t.id, name: `${t.name} (${t.rate}%)` }))}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Business Locations
            </span>
            {locations.length === 0 ? (
              <p className="text-[12px] text-[#A8A2C9]">No locations set up yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => {
                  const checked = selectedLocationIds.includes(loc.id);
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => toggleLocation(loc.id)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                        checked
                          ? "border-[#7C6AE8] bg-[#7C6AE8] text-white"
                          : "border-[#E7E4F3] text-[#726C8C] hover:bg-[#F5F4FA]"
                      }`}
                    >
                      {checked && <Check size={12} />}
                      {loc.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-[#221F35]">
              <input
                type="checkbox"
                checked={manageStock}
                onChange={(e) => setManageStock(e.target.checked)}
                className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
              />
              Manage Stock?
            </label>
            <p className="mb-3 text-[12px] text-[#A8A2C9]">Enable stock management at product level</p>
            {manageStock && (
              <Field
                label="Alert Quantity"
                value={alertQuantity}
                onChange={setAlertQuantity}
                type="number"
                placeholder="Alert quantity"
              />
            )}
          </div>
        </div>
      </div>

      {/* Description / image / brochure */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_260px]">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Product Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] text-[#221F35] outline-none focus:border-[#7C6AE8]"
            />

            <label className="mb-1.5 mt-4 block text-[13px] font-medium text-[#4A4470]">
              Product Brochure
            </label>
            <input
              type="file"
              accept=".pdf,.csv,.zip,.doc,.docx,.jpeg,.jpg,.png"
              onChange={(e) => setBrochureFile(e.target.files?.[0] ?? null)}
              className="text-[13px] text-[#3A3560]"
            />
            <p className="mt-1 text-[12px] text-[#A8A2C9]">
              Max File size: 5MB. Allowed: .pdf, .csv, .zip, .doc, .docx, .jpeg, .jpg, .png
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Product Image
            </label>
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border border-[#E7E4F3] bg-[#F5F4FA]">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <Upload size={24} className="text-[#C9C4E8]" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              className="mt-2 text-[13px] text-[#3A3560]"
            />
            <p className="mt-1 text-[12px] text-[#A8A2C9]">
              Max 5MB, 1:1 aspect ratio recommended. Default placeholder shown if none uploaded.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-[#E7E4F3] pt-4">
          <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
            <input
              type="checkbox"
              checked={enableSerialTracking}
              onChange={(e) => setEnableSerialTracking(e.target.checked)}
              className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
            />
            Enable Product description, IMEI or Serial Number
          </label>
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
          <div className="w-40">
            <Field label="Weight" value={weight} onChange={setWeight} type="number" placeholder="Weight" />
          </div>
        </div>
      </div>

      {/* Custom fields */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Custom Fields</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Field label="Custom Field 1" value={customField1} onChange={setCustomField1} />
          <Field label="Custom Field 2" value={customField2} onChange={setCustomField2} />
          <Field label="Custom Field 3" value={customField3} onChange={setCustomField3} />
          <Field label="Custom Field 4" value={customField4} onChange={setCustomField4} />
        </div>
      </div>

      {/* Product type + variants + pricing */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-[#221F35]">Product Type &amp; Pricing</h3>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => toggleProductType(false)}
            className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition ${
              !hasVariants
                ? "border-[#7C6AE8] bg-[#F1EAFB] text-[#7C4FD6]"
                : "border-[#E7E4F3] text-[#726C8C] hover:bg-[#F5F4FA]"
            }`}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => toggleProductType(true)}
            className={`flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium transition ${
              hasVariants
                ? "border-[#7C6AE8] bg-[#F1EAFB] text-[#7C4FD6]"
                : "border-[#E7E4F3] text-[#726C8C] hover:bg-[#F5F4FA]"
            }`}
          >
            Variable
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {variants.map((variant, index) => (
            <div key={index} className="rounded-xl border border-[#E7E4F3] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#221F35]">
                  {hasVariants ? `Variant ${index + 1}` : "Pricing"}
                </span>
                {hasVariants && variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariantRow(index)}
                    className="flex items-center gap-1 text-[12px] font-medium text-[#C24F4F] hover:underline"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {hasVariants && (
                  <Field
                    label="Variant Label"
                    value={variant.variant_name}
                    onChange={(v) => updateVariant(index, { variant_name: v })}
                    placeholder="Optional, e.g. Small Batch"
                    info="optional if color+size set"
                  />
                )}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      label="Color"
                      value={variant.color ?? ""}
                      onChange={(v) => updateVariant(index, { color: v })}
                      options={colorsQuery.data ?? []}
                      placeholder="Select color"
                      required={publishOnline}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setColorModalForRow(index)}
                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#7C6AE8] text-white hover:bg-[#6C5AD8]"
                    title="Add new color"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      label="Size"
                      value={variant.size ?? ""}
                      onChange={(v) => updateVariant(index, { size: v })}
                      options={sizesQuery.data ?? []}
                      placeholder="Select size"
                      required={publishOnline}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSizeModalForRow(index)}
                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[#7C6AE8] text-white hover:bg-[#6C5AD8]"
                    title="Add new size"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <Field
                  label="SKU"
                  value={variant.sku ?? ""}
                  onChange={(v) => updateVariant(index, { sku: v })}
                  placeholder="Auto-generated"
                />
                <Field
                  label="Default Purchase Price"
                  value={variant.purchase_price}
                  onChange={(v) => updateVariant(index, { purchase_price: v })}
                  type="number"
                />
                <Field
                  label="Default Selling Price"
                  value={variant.selling_price}
                  onChange={(v) => updateVariant(index, { selling_price: v })}
                  type="number"
                />
              </div>
            </div>
          ))}
        </div>

        {hasVariants && (
          <button
            type="button"
            onClick={addVariantRow}
            className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-[#C9C4E8] px-4 py-2 text-[13px] font-medium text-[#7C6AE8] hover:bg-[#F5F4FA]"
          >
            <Plus size={16} /> Add another variant
          </button>
        )}

        <p className="mt-4 text-[12px] text-[#A8A2C9]">
          Opening stock quantities aren't entered here — add them via a Purchase or the
          upcoming Import Opening Stock page once this product is saved.
        </p>
      </div>

      {/* Online storefront */}
      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#221F35]">Online Storefront</h3>
            <p className="text-[12px] text-[#A8A2C9]">
              This is the only place products are created — turn this on to also list it on
              the website, sharing the same stock as POS.
            </p>
          </div>
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
                    required
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
                    placeholder={storefrontCategoryId ? "Please Select" : "Select a category first"}
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
                placeholder="Optional"
                info="shown instead of selling price if set"
              />
            </div>

            <div className="mt-4">
              <Field
                label="Short Description"
                value={shortDescription}
                onChange={setShortDescription}
                placeholder="One line shown on product listing cards"
              />
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

            {/* Gallery images */}
            <div className="mt-5 border-t border-[#E7E4F3] pt-4">
              <span className="mb-2 block text-[13px] font-semibold text-[#221F35]">
                Storefront Images
              </span>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                    Cover Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverImageFile(e.target.files?.[0] ?? null)}
                    className="text-[13px] text-[#3A3560]"
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                    Hover Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setHoverImageFile(e.target.files?.[0] ?? null)}
                    className="text-[13px] text-[#3A3560]"
                  />
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
                    Gallery Images
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleGalleryFilesChange(e.target.files)}
                    className="text-[13px] text-[#3A3560]"
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

            {/* Features */}
            <div className="mt-5 border-t border-[#E7E4F3] pt-4">
              <span className="mb-2 block text-[13px] font-semibold text-[#221F35]">
                Features
              </span>
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
          disabled={createMutation.isPending}
          className="rounded-lg bg-[#7C6AE8] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#6C5AD8] disabled:opacity-60"
        >
          {createMutation.isPending ? "Saving…" : "Save Product"}
        </button>
      </div>

      {quickAddUnit && (
        <UnitFormModal
          mode="add"
          onClose={() => setQuickAddUnit(false)}
          onCreated={handleUnitCreated}
        />
      )}
      {quickAddBrand && (
        <BrandFormModal
          mode="add"
          onClose={() => setQuickAddBrand(false)}
          onCreated={handleBrandCreated}
        />
      )}
      {colorModalForRow !== null && (
        <ColorFormModal onClose={() => setColorModalForRow(null)} onCreated={handleColorCreated} />
      )}
      {sizeModalForRow !== null && (
        <SizeFormModal onClose={() => setSizeModalForRow(null)} onCreated={handleSizeCreated} />
      )}
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
    </div>
  );
}

export default POSAddProductPage;
