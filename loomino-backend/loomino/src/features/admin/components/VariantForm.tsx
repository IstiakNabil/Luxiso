import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  listColors,
  listSizes,
} from "../services/catalog.service";
import { listProducts } from "../services/commerce.service";
import AdminButton from "./AdminButton";
import type { AdminVariant, VariantPayload } from "../types/commerce";

interface VariantFormProps {
  /** Pass an existing variant to edit it instead of creating a new one. */
  initial?: AdminVariant;
  submitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: Partial<VariantPayload>) => void;
}

const EMPTY: VariantPayload = {
  product: null,
  color: null,
  size: null,
  sku: "",
  price_override: null,
  stock: 0,
  is_active: true,
};

/**
 * Creates or edits a product variant (a colour + size combination
 * with its own stock, SKU and optional price override).
 */
function VariantForm({
  initial,
  submitting,
  onCancel,
  onSubmit,
}: VariantFormProps) {
  const isEdit = Boolean(initial);

  const [form, setForm] = useState<VariantPayload>(() =>
    initial
      ? {
          product: initial.product.id,
          color: initial.color.id,
          size: initial.size.id,
          sku: initial.sku,
          // The read serializer only exposes the computed selling
          // price, not the raw override, so this starts blank —
          // "Save Changes" only sends price_override if the admin
          // actually types a new value (see `priceTouched` below).
          price_override: null,
          stock: initial.stock,
          is_active: initial.is_active,
        }
      : EMPTY,
  );
  const [priceTouched, setPriceTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: listProducts,
  });
  const { data: colors } = useQuery({
    queryKey: ["admin", "colors"],
    queryFn: listColors,
  });
  const { data: sizes } = useQuery({
    queryKey: ["admin", "sizes"],
    queryFn: listSizes,
  });

  const set = <K extends keyof VariantPayload>(
    key: K,
    value: VariantPayload[K],
  ) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.product) {
      setError("Choose a product.");
      return;
    }
    if (!form.color || !form.size) {
      setError("Choose both a colour and a size.");
      return;
    }
    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }
    setError(null);

    const payload: Partial<VariantPayload> = {
      ...form,
      stock: Number(form.stock) || 0,
    };

    if (isEdit && !priceTouched) {
      // Don't overwrite an existing price override with null just
      // because the field started blank in edit mode.
      delete payload.price_override;
    } else {
      payload.price_override = form.price_override || null;
    }

    onSubmit(payload);
  };

  const input =
    "h-[42px] w-full rounded-lg border border-[#DDD3C0] bg-white px-3 text-[14px] text-[#2C2418] outline-none focus:border-[#A88548]";
  const label =
    "mb-1.5 block text-[13px] font-medium text-[#3A2E1B]";

  return (
    <div>
      <label className="mb-4 block">
        <span className={label}>Product *</span>
        <select
          className={input}
          value={form.product ?? ""}
          onChange={(e) =>
            set(
              "product",
              e.target.value ? Number(e.target.value) : null,
            )
          }
        >
          <option value="">Select product</option>
          {(products ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={label}>Colour *</span>
          <select
            className={input}
            value={form.color ?? ""}
            onChange={(e) =>
              set(
                "color",
                e.target.value
                  ? Number(e.target.value)
                  : null,
              )
            }
          >
            <option value="">Select colour</option>
            {(colors ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={label}>Size *</span>
          <select
            className={input}
            value={form.size ?? ""}
            onChange={(e) =>
              set(
                "size",
                e.target.value
                  ? Number(e.target.value)
                  : null,
              )
            }
          >
            <option value="">Select size</option>
            {(sizes ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <label className="block">
          <span className={label}>SKU *</span>
          <input
            className={input}
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            placeholder="e.g. PRD-26628247"
          />
        </label>

        <label className="block">
          <span className={label}>Stock *</span>
          <input
            className={input}
            type="number"
            value={form.stock}
            onChange={(e) =>
              set("stock", Number(e.target.value))
            }
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className={label}>
          Price Override (optional)
        </span>
        <input
          className={input}
          type="number"
          value={form.price_override ?? ""}
          onChange={(e) => {
            setPriceTouched(true);
            set("price_override", e.target.value);
          }}
          placeholder={
            isEdit
              ? "Leave empty to keep the current price"
              : "Leave empty to use the product price"
          }
        />
      </label>

      <label className="mt-4 flex items-center gap-2 text-[13px] text-[#3A2E1B]">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) =>
            set("is_active", e.target.checked)
          }
          className="h-4 w-4 accent-[#A88548]"
        />
        Active (available to purchase)
      </label>

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
          {isEdit ? "Save Changes" : "Add Variant"}
        </AdminButton>
      </div>
    </div>
  );
}

export default VariantForm;
