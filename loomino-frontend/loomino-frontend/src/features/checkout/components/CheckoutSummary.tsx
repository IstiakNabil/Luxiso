import { X } from "lucide-react";

import { formatPrice, getMediaUrl } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { CartResponse } from "@/features/cart/types/cart";
import type { ApplyCouponResponse } from "../types/checkout";

interface CheckoutSummaryProps {
  cart: CartResponse;
  coupon: ApplyCouponResponse | null;
}

/**
 * Read-only order summary shown alongside every checkout
 * step. Editing happens back on the cart page.
 */
function CheckoutSummary({
  cart,
  coupon,
}: CheckoutSummaryProps) {
  const { data: settings } = useSiteSettings();

  const discount = coupon
    ? parseFloat(coupon.discount)
    : 0;

  const subtotal = parseFloat(cart.total_price);
  const shipping = Number(settings?.delivery_charge ?? 0);
  const total = subtotal + shipping - discount;

  return (
    <div className="bg-[#EDEBE6] px-5 py-8 md:px-8 md:py-12 lg:px-16 lg:py-16">
      <h2 className="text-center text-[22px] font-semibold">
        Your Cart
      </h2>

      <div className="mt-6 space-y-6 lg:mt-10 lg:space-y-8">
        {cart.items.map((item) => {
          const imageUrl = getMediaUrl(item.image);

          return (
            <div
              key={item.id}
              className="flex items-start gap-4 lg:gap-5"
            >
              <div className="relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.product}
                    className="h-[92px] w-[76px] object-cover lg:h-[110px] lg:w-[92px]"
                  />
                ) : (
                  <div className="h-[92px] w-[76px] bg-[#E4DACA] lg:h-[110px] lg:w-[92px]" />
                )}

                <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center bg-white text-[14px] font-medium">
                  {item.quantity}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-[14px] font-semibold lg:text-[17px]">
                    {item.product}
                  </h3>

                  <X
                    size={18}
                    className="text-[#333]"
                  />
                </div>

                <p className="mt-2 text-[13px] text-[#555] lg:text-[15px]">
                  Size: {item.size}
                </p>
                <p className="mt-1 text-[13px] text-[#555] lg:text-[15px]">
                  Color: {item.color}
                </p>
              </div>

              <p className="text-[16px] font-semibold">
                {formatPrice(item.subtotal)}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-3 border-t border-[#D8D3C8] pt-6 lg:mt-12 lg:space-y-4 lg:pt-8">
        <div className="flex justify-between text-[15px] lg:text-[18px]">
          <span>Subtotal ({cart.total_items})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-[15px] text-[#2E7D53] lg:text-[18px]">
            <span>Discount ({coupon?.coupon})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[15px] lg:text-[18px]">
          <span>Shipping</span>
          <span>{shipping > 0 ? formatPrice(shipping) : "Free"}</span>
        </div>

        <div className="flex justify-between text-[15px] font-medium lg:text-[18px]">
          <span>Total Orders:</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <p className="mt-6 text-[13px] font-semibold leading-6 text-[#3F3F3F]">
        The total amount you pay includes all applicable
        customs duties & taxes. We guarantee no additional
        charges on delivery
      </p>
    </div>
  );
}

export default CheckoutSummary;
