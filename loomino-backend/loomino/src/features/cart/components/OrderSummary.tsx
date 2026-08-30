import { useNavigate } from "react-router-dom";

import { formatPrice } from "@/lib/utils";
import { useCart } from "../hooks/useCart";

function OrderSummary() {
  const { data } = useCart();
  const navigate = useNavigate();

  if (!data || data.items.length === 0) {
    return null;
  }

  return (
    <div className="mt-[48px] flex justify-end">
      <div className="w-full max-w-[496px]">
        <div className="space-y-5 border-t border-[#DCD3C3] pt-8">
          <div className="flex items-center justify-between">
            <span className="text-[20px]">
              Subtotal ({data.total_items})
            </span>
            <span className="text-[20px]">
              {formatPrice(data.total_price)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[20px]">Shipping</span>
            <span className="text-[20px]">Free</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[20px] font-medium">
              Total Orders:
            </span>
            <span className="text-[20px] font-medium">
              {formatPrice(data.total_price)}
            </span>
          </div>
        </div>

        <p className="mt-6 text-[13px] font-semibold leading-6 text-[#3F3F3F]">
          The total amount you pay includes all applicable
          customs duties & taxes. We guarantee no
          additional charges on delivery
        </p>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="h-[48px] w-[184px] bg-[#5B3A0E] text-[16px] text-white transition hover:opacity-90"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
