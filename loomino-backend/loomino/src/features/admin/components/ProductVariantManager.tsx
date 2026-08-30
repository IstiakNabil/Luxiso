import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import {
  listColors,
  listSizes,
} from "../services/catalog.service";
import {
  listVariantsForProduct,
  createVariant,
  deleteVariant,
} from "../services/commerce.service";

interface ProductVariantManagerProps {
  productId: number;
  productName: string;
}

/**
 * Manage the sizes/colours a product is sold in. Each row is
 * a ProductVariant (colour + size + stock + SKU), which is
 * where sizes actually live — a Product has no size itself.
 */
function ProductVariantManager({
  productId,
  productName,
}: ProductVariantManagerProps) {
  const queryClient = useQueryClient();
  const queryKey = [
    "admin",
    "product-variants",
    productId,
  ];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => listVariantsForProduct(productId),
  });
  const { data: colors } = useQuery({
    queryKey: ["admin", "colors"],
    queryFn: listColors,
  });
  const { data: sizes } = useQuery({
    queryKey: ["admin", "sizes"],
    queryFn: listSizes,
  });

  const variants = data ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({
      queryKey: ["admin", "variants"],
    });
    queryClient.invalidateQueries({
      queryKey: ["admin", "products"],
    });
  };

  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [stock, setStock] = useState("0");
  const [sku, setSku] = useState("");

  const add = useMutation({
    mutationFn: createVariant,
    onSuccess: () => {
      invalidate();
      toast.success("Size added.");
      setSize("");
      setStock("0");
      setSku("");
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, "Couldn't add this size."),
      ),
  });

  const remove = useMutation({
    mutationFn: deleteVariant,
    onSuccess: () => {
      invalidate();
      toast.success("Size removed.");
    },
    onError: (e) =>
      toast.error(getApiErrorMessage(e, "Couldn't remove.")),
  });

  const submit = () => {
    if (!color || !size) {
      toast.error("Choose a colour and a size.");
      return;
    }
    const auto =
      sku.trim() ||
      `${productName.slice(0, 3).toUpperCase()}-${Date.now()
        .toString()
        .slice(-6)}`;

    add.mutate({
      product: productId,
      color: Number(color),
      size: Number(size),
      sku: auto,
      stock: Number(stock) || 0,
      price_override: null,
      is_active: true,
    });
  };

  const field =
    "h-[38px] w-full rounded-lg border border-[#DDD3C0] bg-white px-2 text-[13px] outline-none focus:border-[#A88548]";

  return (
    <div>
      {/* Add row */}
      <div className="rounded-xl border border-[#E4DACA] bg-[#FBF8F2] p-3">
        <div className="grid grid-cols-4 gap-2">
          <select
            className={field}
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            <option value="">Colour</option>
            {(colors ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className={field}
            value={size}
            onChange={(e) => setSize(e.target.value)}
          >
            <option value="">Size</option>
            {(sizes ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <input
            className={field}
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Stock"
          />

          <input
            className={field}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SKU (auto)"
          />
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={add.isPending}
          className="mt-2 flex h-[36px] w-full items-center justify-center gap-1.5 rounded-lg bg-[#A88548] text-[13px] font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={15} />
          {add.isPending ? "Adding…" : "Add Size"}
        </button>
      </div>

      {/* Existing */}
      <div className="mt-3">
        {isLoading && (
          <p className="py-3 text-center text-[13px] text-[#A89A80]">
            Loading sizes…
          </p>
        )}

        {!isLoading && variants.length === 0 && (
          <p className="py-3 text-center text-[13px] text-[#A89A80]">
            No sizes yet — add at least one so this product
            can be purchased.
          </p>
        )}

        {variants.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-3 border-b border-[#F1ECE2] py-2 text-[13px] last:border-0"
          >
            <span
              className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#E0D8C6]"
              style={{
                backgroundColor:
                  v.color?.hex_code ?? "#ccc",
              }}
            />
            <span className="w-20 text-[#3A2E1B]">
              {v.color?.name}
            </span>
            <span className="w-14 font-semibold text-[#2C2418]">
              {v.size?.name}
            </span>
            <span className="flex-1 text-[#8A7C64]">
              Stock: {v.stock}
            </span>
            <span className="font-mono text-[11px] text-[#A89A80]">
              {v.sku}
            </span>
            <button
              type="button"
              aria-label="Remove size"
              onClick={() => remove.mutate(v.id)}
              className="rounded-md p-1.5 text-[#9A3B3B] hover:bg-[#F7ECEC]"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductVariantManager;
