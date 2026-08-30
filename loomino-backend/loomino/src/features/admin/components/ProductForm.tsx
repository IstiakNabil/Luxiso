import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { listCategories } from "../services/catalog.service";
import { listBrands } from "../services/commerce.service";
import AdminButton from "./AdminButton";
import SectionToggle from "./SectionToggle";
import ProductImageManager from "./ProductImageManager";
import ProductVariantManager from "./ProductVariantManager";
import type {
  AdminProductDetail,
  ProductPayload,
} from "../types/commerce";

interface ProductFormProps {
  /** Existing product when editing; null when creating. */
  initial?: AdminProductDetail | null;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: ProductPayload) => void;
}

const EMPTY: ProductPayload = {
  name: "",
  category: null,
  brand: null,
  short_description: "",
  description: "",
  fitting: "",
  fabric_and_care: "",
  shipping_and_return: "",
  regular_price: "",
  discount_price: null,
  is_featured: false,
  is_new_arrival: false,
  is_modiweek: false,
  is_active: true,
};

function ProductForm({
  initial,
  submitting,
  onCancel,
  onSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductPayload>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: listCategories,
  });
  const { data: brands } = useQuery({
    queryKey: ["admin", "brands"],
    queryFn: listBrands,
  });

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        category: initial.category,
        brand: initial.brand,
        short_description: initial.short_description ?? "",
        description: initial.description ?? "",
        fitting: initial.fitting ?? "",
        fabric_and_care: initial.fabric_and_care ?? "",
        shipping_and_return:
          initial.shipping_and_return ?? "",
        regular_price: initial.regular_price,
        discount_price: initial.discount_price,
        is_featured: initial.is_featured,
        is_new_arrival: initial.is_new_arrival,
        is_modiweek: initial.is_modiweek,
        is_active: initial.is_active,
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [initial]);

  const set = <K extends keyof ProductPayload>(
    key: K,
    value: ProductPayload[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (!form.category) {
      setError("Please choose a category.");
      return;
    }
    if (!form.regular_price) {
      setError("Regular price is required.");
      return;
    }
    setError(null);
    onSubmit({
      ...form,
      discount_price: form.discount_price || null,
    });
  };

  const input =
    "h-[42px] w-full rounded-lg border border-[#DDD3C0] bg-white px-3 text-[14px] text-[#2C2418] outline-none focus:border-[#A88548]";
  const textarea =
    "w-full rounded-lg border border-[#DDD3C0] bg-white p-3 text-[14px] text-[#2C2418] outline-none focus:border-[#A88548]";
  const label =
    "mb-1.5 block text-[13px] font-medium text-[#3A2E1B]";

  return (
    <div>
      {/* Basics */}
      <div className="grid grid-cols-2 gap-4">
        <label className="col-span-2 block">
          <span className={label}>Product Name *</span>
          <input
            className={input}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Classic Linen Blend Shirt"
          />
        </label>

        <label className="block">
          <span className={label}>Category *</span>
          <select
            className={input}
            value={form.category ?? ""}
            onChange={(e) =>
              set(
                "category",
                e.target.value
                  ? Number(e.target.value)
                  : null,
              )
            }
          >
            <option value="">Select category</option>
            {(categories ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>Brand</span>
          <select
            className={input}
            value={form.brand ?? ""}
            onChange={(e) =>
              set(
                "brand",
                e.target.value
                  ? Number(e.target.value)
                  : null,
              )
            }
          >
            <option value="">No brand</option>
            {(brands ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>Regular Price *</span>
          <input
            className={input}
            type="number"
            value={form.regular_price}
            onChange={(e) =>
              set("regular_price", e.target.value)
            }
            placeholder="0.00"
          />
        </label>

        <label className="block">
          <span className={label}>
            Discount Price (optional)
          </span>
          <input
            className={input}
            type="number"
            value={form.discount_price ?? ""}
            onChange={(e) =>
              set("discount_price", e.target.value)
            }
            placeholder="Leave empty for none"
          />
        </label>
      </div>

      {/* Descriptions */}
      <div className="mt-5 space-y-4">
        <label className="block">
          <span className={label}>Short Description</span>
          <input
            className={input}
            value={form.short_description}
            onChange={(e) =>
              set("short_description", e.target.value)
            }
            placeholder="One-line summary shown on the product page"
          />
        </label>

        <label className="block">
          <span className={label}>Description</span>
          <textarea
            className={textarea}
            rows={3}
            value={form.description}
            onChange={(e) =>
              set("description", e.target.value)
            }
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className={label}>Fitting</span>
            <textarea
              className={textarea}
              rows={2}
              value={form.fitting}
              onChange={(e) =>
                set("fitting", e.target.value)
              }
            />
          </label>

          <label className="block">
            <span className={label}>Fabric &amp; Care</span>
            <textarea
              className={textarea}
              rows={2}
              value={form.fabric_and_care}
              onChange={(e) =>
                set("fabric_and_care", e.target.value)
              }
            />
          </label>
        </div>

        <label className="block">
          <span className={label}>
            Shipping &amp; Return
          </span>
          <textarea
            className={textarea}
            rows={2}
            value={form.shipping_and_return}
            onChange={(e) =>
              set("shipping_and_return", e.target.value)
            }
          />
        </label>
      </div>

      {/* Sizes & colours (variants) */}
      <div className="mt-6">
        <p className="mb-1 text-[14px] font-bold text-[#2C2418]">
          Sizes &amp; Colours
        </p>
        {initial ? (
          <>
            <p className="mb-3 text-[12px] text-[#8A7C64]">
              Each row is a colour + size with its own stock.
              A product needs at least one to be purchasable.
            </p>
            <ProductVariantManager
              productId={initial.id}
              productName={initial.name}
            />
          </>
        ) : (
          <p className="rounded-lg bg-[#FBF3D9] px-3 py-2 text-[12px] leading-[1.6] text-[#8A6D1E]">
            Save the product first — you'll then be able to
            add its sizes and colours here.
          </p>
        )}
      </div>

      {/* Images */}
      <div className="mt-6">
        <p className="mb-1 text-[14px] font-bold text-[#2C2418]">
          Product Images
        </p>
        {initial ? (
          <>
            <p className="mb-3 text-[12px] text-[#8A7C64]">
              Upload the cover, hover and gallery images.
            </p>
            <ProductImageManager productId={initial.id} />
          </>
        ) : (
          <p className="rounded-lg bg-[#FBF3D9] px-3 py-2 text-[12px] leading-[1.6] text-[#8A6D1E]">
            Save the product first — you'll be able to
            upload images straight after.
          </p>
        )}
      </div>

      {/* Storefront sections */}
      <div className="mt-6">
        <p className="mb-1 text-[14px] font-bold text-[#2C2418]">
          Storefront Sections
        </p>
        <p className="mb-3 text-[12px] text-[#8A7C64]">
          Choose where this product appears on the store.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <SectionToggle
            label="New In"
            hint="Shows in the New In section and /shop?is_new_arrival=true"
            checked={form.is_new_arrival}
            onChange={(v) => set("is_new_arrival", v)}
          />
          <SectionToggle
            label="Featured"
            hint="Shows in Featured listings on the storefront"
            checked={form.is_featured}
            onChange={(v) => set("is_featured", v)}
          />
          <SectionToggle
            label="Modiweek"
            hint="Shows on the Modiweek page (/modiweek)"
            checked={form.is_modiweek}
            onChange={(v) => set("is_modiweek", v)}
          />
          <SectionToggle
            label="Active"
            hint="Visible in the shop. Uncheck to hide the product."
            checked={form.is_active}
            onChange={(v) => set("is_active", v)}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-[13px] text-[#9A3B3B]">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3 border-t border-[#EFE9DE] pt-4">
        <AdminButton variant="outline" onClick={onCancel}>
          Cancel
        </AdminButton>
        <AdminButton onClick={submit} disabled={submitting}>
          {initial ? "Save Changes" : "Add Product"}
        </AdminButton>
      </div>

      {!initial && (
        <p className="mt-3 text-[12px] leading-[1.6] text-[#A89A80]">
          After saving, you can add sizes/colours and upload
          images right here.
        </p>
      )}
    </div>
  );
}

export default ProductForm;
