import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ScanLine, Trash2, Plus, Minus, AlertTriangle } from "lucide-react";

import { getApiErrorMessage } from "@/lib/apiError";
import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useContacts } from "../hooks/useContacts";
import { useBusinessSettings } from "../hooks/useSettings";
import { useCreateSale } from "../hooks/useSales";
import { scanVariant } from "../services/pos.service";
import { printReceipts } from "../utils/receipt";
import { formatMoney } from "../utils/format";
import type { CartLine, PaymentMethodValue } from "../types/pos";

function toNum(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const PAYMENT_BUTTONS: { method: PaymentMethodValue; label: string; color: string }[] = [
  { method: "cash", label: "Cash", color: "bg-[#2E9E5B] hover:bg-[#268A4E]" },
  { method: "card", label: "Card", color: "bg-[#C24F4F] hover:bg-[#B03F3F]" },
  { method: "bkash", label: "bKash", color: "bg-[#D9407F] hover:bg-[#C43571]" },
  { method: "nagad", label: "Nagad", color: "bg-[#E8843D] hover:bg-[#D67630]" },
];

function POSRegisterPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";
  // The /me/ payload carries role, not the person's name, so the
  // seller copy identifies the till operator by role rather than
  // inventing a name field the API doesn't return.
  const cashierName = me?.has_pos_access ? me.role_display : "";

  const locationsQuery = usePOSLocations();
  const customersQuery = useContacts("customer", 1, "", undefined);
  const businessQuery = useBusinessSettings();
  const createMutation = useCreateSale();

  const scanInputRef = useRef<HTMLInputElement>(null);
  const [scanCode, setScanCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [locationId, setLocationId] = useState<number | "">("");
  const [customerId, setCustomerId] = useState<number | "">("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderDiscount, setOrderDiscount] = useState("0");
  const [tendered, setTendered] = useState("");

  // Default to the only location so a single-branch shop never has to pick.
  const effectiveLocationId =
    locationId || (locationsQuery.data?.length === 1 ? locationsQuery.data[0].id : "");

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, line) => sum + toNum(line.quantity) * toNum(line.unitPrice) - toNum(line.discountAmount),
      0,
    );
    const discount = toNum(orderDiscount);
    const total = Math.max(0, subtotal - discount);
    const change = tendered ? toNum(tendered) - total : 0;
    const itemCount = cart.reduce((sum, line) => sum + toNum(line.quantity), 0);
    return { subtotal, discount, total, change, itemCount };
  }, [cart, orderDiscount, tendered]);

  const focusScan = () => scanInputRef.current?.focus();

  const addToCart = async (code: string) => {
    if (!code.trim()) return;
    if (!effectiveLocationId) {
      toast.error("Choose a business location first.");
      return;
    }

    setScanning(true);
    try {
      const result = await scanVariant(code.trim(), Number(effectiveLocationId));

      if (result.not_for_selling) {
        toast.error(`${result.product_name} is marked "not for selling".`);
        return;
      }

      const existing = cart.find((line) => line.variantId === result.id);
      const alreadyInCart = existing ? toNum(existing.quantity) : 0;

      // Block the scan that would exceed stock rather than letting it
      // fail later at save -- the cashier finds out now, not after
      // the customer has queued.
      if (result.manage_stock && result.current_stock !== null) {
        if (alreadyInCart + 1 > result.current_stock) {
          toast.error(
            `Only ${result.current_stock} of ${result.display_name} left in stock.`,
          );
          return;
        }
      }

      if (existing) {
        setCart((prev) =>
          prev.map((line) =>
            line.variantId === result.id
              ? { ...line, quantity: String(alreadyInCart + 1) }
              : line,
          ),
        );
      } else {
        setCart((prev) => [
          ...prev,
          {
            variantId: result.id,
            displayName: result.display_name,
            sku: result.sku,
            barcode: result.barcode,
            unitName: result.unit_short_name,
            unitPrice: String(result.selling_price),
            quantity: "1",
            discountAmount: "0",
            availableStock: result.current_stock,
            manageStock: result.manage_stock,
          },
        ]);
      }
      setScanCode("");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setScanning(false);
      focusScan();
    }
  };

  const updateLine = (variantId: number, patch: Partial<CartLine>) => {
    setCart((prev) =>
      prev.map((line) => (line.variantId === variantId ? { ...line, ...patch } : line)),
    );
  };

  const changeQty = (line: CartLine, delta: number) => {
    const next = toNum(line.quantity) + delta;
    if (next <= 0) {
      setCart((prev) => prev.filter((l) => l.variantId !== line.variantId));
      return;
    }
    if (line.manageStock && line.availableStock !== null && next > line.availableStock) {
      toast.error(`Only ${line.availableStock} in stock.`);
      return;
    }
    updateLine(line.variantId, { quantity: String(next) });
  };

  const removeLine = (variantId: number) =>
    setCart((prev) => prev.filter((line) => line.variantId !== variantId));

  const clearCart = () => {
    setCart([]);
    setOrderDiscount("0");
    setTendered("");
    focusScan();
  };

  const handleCheckout = async (paymentMethod: PaymentMethodValue) => {
    if (cart.length === 0) {
      toast.error("Cart is empty.");
      return;
    }
    if (!effectiveLocationId) {
      toast.error("Choose a business location first.");
      return;
    }

    const formData = new FormData();
    if (customerId) formData.append("customer", String(customerId));
    formData.append("location", String(effectiveLocationId));
    formData.append("sale_date", new Date().toISOString());
    formData.append("status", "final");
    formData.append("discount_type", toNum(orderDiscount) > 0 ? "fixed" : "none");
    formData.append("discount_amount", orderDiscount || "0");
    formData.append("payment_method", paymentMethod);
    formData.append("paid_on", new Date().toISOString());
    // A till sale is paid in full at the counter; tendered cash above
    // the total is change given, not extra revenue.
    formData.append("paid_amount", String(totals.total));
    formData.append(
      "items",
      JSON.stringify(
        cart.map((line) => ({
          variant: line.variantId,
          quantity: line.quantity,
          unit_price: line.unitPrice,
          discount_amount: line.discountAmount || "0",
        })),
      ),
    );

    try {
      const sale = await createMutation.mutateAsync(formData);
      toast.success(`${sale.invoice_no} completed.`);

      if (businessQuery.data) {
        printReceipts({ sale, business: businessQuery.data, cashierName });
      } else {
        toast.error("Sale saved, but business settings didn't load — receipts not printed.");
      }
      clearCart();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold text-[#221F35]">POS Register</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={effectiveLocationId}
            onChange={(e) => setLocationId(e.target.value === "" ? "" : Number(e.target.value))}
            className="rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          >
            <option value="">Select location</option>
            {locationsQuery.data?.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value === "" ? "" : Number(e.target.value))}
            className="rounded-lg border border-[#E7E4F3] px-3 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
          >
            <option value="">Walk-In Customer</option>
            {customersQuery.data?.results.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Scan box — autofocused, since a barcode scanner just types + Enter */}
      <div className="rounded-2xl border-2 border-[#7C6AE8] bg-white p-4">
        <label className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-[#7C6AE8]">
          <ScanLine size={18} /> Scan barcode or enter SKU
        </label>
        <input
          ref={scanInputRef}
          autoFocus
          value={scanCode}
          onChange={(e) => setScanCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addToCart(scanCode);
            }
          }}
          disabled={scanning}
          placeholder="Scan a product…"
          className="w-full rounded-lg border border-[#E7E4F3] px-4 py-3 text-[16px] outline-none focus:border-[#7C6AE8] disabled:bg-[#F5F4FA]"
        />
        <p className="mt-1.5 text-[12px] text-[#A8A2C9]">
          A scanner types the code and presses Enter automatically — no setup needed. You can
          also type a SKU by hand.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        {/* Cart */}
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#221F35]">
              Cart ({totals.itemCount} item{totals.itemCount === 1 ? "" : "s"})
            </h3>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-[12px] font-medium text-[#C24F4F] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ScanLine size={40} className="mb-3 text-[#C9C4E8]" />
              <p className="text-[13px] text-[#A8A2C9]">
                Scan a product to start a sale.
              </p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-[#F5F4FA]">
              {cart.map((line) => {
                const lineTotal =
                  toNum(line.quantity) * toNum(line.unitPrice) - toNum(line.discountAmount);
                const lowStock =
                  line.manageStock &&
                  line.availableStock !== null &&
                  toNum(line.quantity) >= line.availableStock;
                return (
                  <div key={line.variantId} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-[#221F35]">
                        {line.displayName}
                      </p>
                      <p className="text-[11px] text-[#A8A2C9]">
                        {line.sku}
                        {line.manageStock && line.availableStock !== null && (
                          <span className={lowStock ? "ml-2 text-[#C24F4F]" : "ml-2"}>
                            · {line.availableStock} in stock
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => changeQty(line, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E7E4F3] text-[#726C8C] hover:bg-[#F5F4FA]"
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        value={line.quantity}
                        onChange={(e) => updateLine(line.variantId, { quantity: e.target.value })}
                        className="w-12 rounded-md border border-[#E7E4F3] px-1 py-1 text-center text-[13px] outline-none focus:border-[#7C6AE8]"
                      />
                      <button
                        type="button"
                        onClick={() => changeQty(line, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-[#E7E4F3] text-[#726C8C] hover:bg-[#F5F4FA]"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <input
                      value={line.unitPrice}
                      onChange={(e) => updateLine(line.variantId, { unitPrice: e.target.value })}
                      className="w-20 rounded-md border border-[#E7E4F3] px-2 py-1 text-right text-[13px] outline-none focus:border-[#7C6AE8]"
                    />

                    <span className="w-24 text-right text-[13px] font-semibold text-[#221F35]">
                      {formatMoney(lineTotal, sym)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeLine(line.variantId)}
                      className="text-[#C24F4F] hover:opacity-70"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Totals + payment */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-[#E7E4F3] bg-white p-4">
            <div className="flex items-center justify-between py-1 text-[13px]">
              <span className="text-[#726C8C]">Subtotal</span>
              <span className="font-medium text-[#221F35]">{formatMoney(totals.subtotal, sym)}</span>
            </div>
            <div className="flex items-center justify-between py-1 text-[13px]">
              <span className="text-[#726C8C]">Discount</span>
              <input
                type="number"
                value={orderDiscount}
                onChange={(e) => setOrderDiscount(e.target.value)}
                className="w-24 rounded-md border border-[#E7E4F3] px-2 py-1 text-right text-[13px] outline-none focus:border-[#7C6AE8]"
              />
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#E7E4F3] pt-3">
              <span className="text-[15px] font-semibold text-[#221F35]">Total</span>
              <span className="text-[20px] font-bold text-[#7C6AE8]">
                {formatMoney(totals.total, sym)}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E7E4F3] bg-white p-4">
            <label className="mb-1.5 block text-[13px] font-medium text-[#4A4470]">
              Cash tendered (optional)
            </label>
            <input
              type="number"
              value={tendered}
              onChange={(e) => setTendered(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-lg border border-[#E7E4F3] px-3 py-2 text-[15px] outline-none focus:border-[#7C6AE8]"
            />
            {tendered && (
              <div className="mt-2 flex items-center justify-between text-[14px]">
                <span className="text-[#726C8C]">Change due</span>
                <span
                  className={`font-bold ${
                    totals.change < 0 ? "text-[#C24F4F]" : "text-[#2E9E5B]"
                  }`}
                >
                  {formatMoney(totals.change, sym)}
                </span>
              </div>
            )}
            {tendered && totals.change < 0 && (
              <p className="mt-1 flex items-center gap-1 text-[12px] text-[#C24F4F]">
                <AlertTriangle size={12} /> Not enough tendered.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_BUTTONS.map((btn) => (
              <button
                key={btn.method}
                type="button"
                onClick={() => handleCheckout(btn.method)}
                disabled={createMutation.isPending || cart.length === 0}
                className={`rounded-xl px-4 py-4 text-[14px] font-bold text-white transition disabled:opacity-40 ${btn.color}`}
              >
                {createMutation.isPending ? "…" : btn.label}
              </button>
            ))}
          </div>
          <p className="text-center text-[12px] text-[#A8A2C9]">
            Completing a sale prints the customer and seller receipts, and deducts stock.
          </p>
        </div>
      </div>
    </div>
  );
}

export default POSRegisterPage;
