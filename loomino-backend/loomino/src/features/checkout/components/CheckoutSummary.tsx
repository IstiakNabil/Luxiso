import { X } from "lucide-react";

import { formatPrice, getMediaUrl } from "@/lib/utils";
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
  const discount = coupon
    ? parseFloat(coupon.discount)
    : 0;

  const subtotal = parseFloat(cart.total_price);
  const total = subtotal - discount;

  return (
    <div className="bg-[#EDEBE6] px-8 py-12 lg:px-16 lg:py-16">
      <h2 className="text-center text-[22px] font-semibold">
        Your Cart
      </h2>

      <div className="mt-10 space-y-8">
        {cart.items.map((item) => {
          const imageUrl = getMediaUrl(item.image);

          return (
            <div
              key={item.id}
              className="flex items-start gap-5"
            >
              <div className="relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={item.product}
                    className="h-[110px] w-[92px] object-cover"
                  />
                ) : (
                  <div className="h-[110px] w-[92px] bg-[#E4DACA]" />
                )}

                <span className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center bg-white text-[14px] font-medium">
                  {item.quantity}
                </span>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-[17px] font-semibold">
                    {item.product}
                  </h3>

                  <X
                    size={18}
                    className="text-[#333]"
                  />
                </div>

                <p className="mt-2 text-[15px] text-[#555]">
                  Size: {item.size}
                </p>
                <p className="mt-1 text-[15px] text-[#555]">
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

      <div className="mt-12 space-y-4 border-t border-[#D8D3C8] pt-8">
        <div className="flex justify-between text-[18px]">
          <span>Subtotal ({cart.total_items})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-[18px] text-[#2E7D53]">
            <span>Discount ({coupon?.coupon})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-[18px]">
          <span>Shipping</span>
          <span>Free</span>
        </div>

        <div className="flex justify-between text-[18px] font-medium">
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
