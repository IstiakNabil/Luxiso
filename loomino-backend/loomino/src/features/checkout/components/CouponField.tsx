import { useState } from "react";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { useApplyCoupon } from "../hooks/useApplyCoupon";
import type { ApplyCouponResponse } from "../types/checkout";

interface CouponFieldProps {
  subtotal: string;
  applied: ApplyCouponResponse | null;
  onApplied: (coupon: ApplyCouponResponse | null) => void;
}

function CouponField({
  subtotal,
  applied,
  onApplied,
}: CouponFieldProps) {
  const [code, setCode] = useState("");
  const applyCoupon = useApplyCoupon();

  const handleApply = async () => {
    if (!code.trim()) return;

    try {
      const result = await applyCoupon.mutateAsync({
        code: code.trim(),
        subtotal,
      });

      onApplied(result);
      toast.success(`Coupon "${result.coupon}" applied.`);
    } catch (error) {
      onApplied(null);
      toast.error(
        getApiErrorMessage(
          error,
          "This coupon could not be applied.",
        ),
      );
    }
  };

  const handleRemove = () => {
    onApplied(null);
    setCode("");
  };

  return (
    <div>
      <p className="mb-3 text-[16px] font-medium">
        Discount Code
      </p>

      <div className="flex gap-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          disabled={!!applied}
          className="h-[48px] flex-1 border border-[#B9AE97] bg-transparent px-4 text-[15px] outline-none focus:border-[#5B3A0E] disabled:opacity-60"
        />

        {applied ? (
          <button
            type="button"
            onClick={handleRemove}
            className="h-[48px] w-[110px] border border-[#5B3A0E] text-[15px] text-[#5B3A0E] transition hover:bg-[#F1E9DC]"
          >
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={handleApply}
            disabled={applyCoupon.isPending}
            className="h-[48px] w-[110px] bg-[#5B3A0E] text-[15px] text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {applyCoupon.isPending ? "..." : "Apply"}
          </button>
        )}
      </div>
    </div>
  );
}

export default CouponField;
