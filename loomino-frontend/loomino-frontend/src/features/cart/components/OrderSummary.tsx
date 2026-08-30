import { useNavigate } from "react-router-dom";

import { formatPrice } from "@/lib/utils";
import { useCart } from "../hooks/useCart";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function OrderSummary() {
  const { data } = useCart();
  const { data: settings } = useSiteSettings();
  const navigate = useNavigate();

  if (!data || data.items.length === 0) {
    return null;
  }

  const shipping = Number(settings?.delivery_charge ?? 0);
  const subtotal = Number(data.total_price);
  const total = subtotal + shipping;

  return (
    <div className="mt-8 flex justify-end lg:mt-[48px]">
      <div className="w-full max-w-[496px]">
        <div className="space-y-4 border-t border-[#DCD3C3] pt-6 lg:space-y-5 lg:pt-8">
          <div className="flex items-center justify-between">
            <span className="text-[15px] lg:text-[20px]">
              Subtotal ({data.total_items})
            </span>
            <span className="text-[15px] lg:text-[20px]">
              {formatPrice(data.total_price)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[15px] lg:text-[20px]">Shipping</span>
            <span className="text-[15px] lg:text-[20px]">
              {shipping > 0 ? formatPrice(shipping) : "Free"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium lg:text-[20px]">
              Total Orders:
            </span>
            <span className="text-[15px] font-medium lg:text-[20px]">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <p className="mt-6 text-[13px] font-semibold leading-6 text-[#3F3F3F]">
          The total amount you pay includes all applicable
          customs duties & taxes. We guarantee no
          additional charges on delivery
        </p>

        <div className="mt-6 flex justify-end lg:mt-8">
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="h-10 w-full bg-[#5B3A0E] text-[14px] text-white transition hover:opacity-90 lg:h-[48px] lg:w-[184px] lg:text-[16px]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
