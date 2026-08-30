import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import type { Address } from "@/features/addresses/types/address";
import type { CartResponse } from "@/features/cart/types/cart";
import PaymentMethodSelector from "./PaymentMethodSelector";
import CouponField from "./CouponField";
import { useCheckout } from "../hooks/useCheckout";
import type {
  ApplyCouponResponse,
  CheckoutResponse,
  PaymentMethod,
} from "../types/checkout";

interface CheckoutPaymentStepProps {
  address: Address;
  cart: CartResponse;
  coupon: ApplyCouponResponse | null;
  paymentMethod: PaymentMethod;
  onCouponChange: (
    coupon: ApplyCouponResponse | null,
  ) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onBack: () => void;
  onSuccess: (result: CheckoutResponse) => void;
  onFailure: (message: string) => void;
}

function CheckoutPaymentStep({
  address,
  cart,
  coupon,
  paymentMethod,
  onCouponChange,
  onPaymentMethodChange,
  onBack,
  onSuccess,
  onFailure,
}: CheckoutPaymentStepProps) {
  const checkoutMutation = useCheckout();

  const placeOrder = async () => {
    try {
      const result = await checkoutMutation.mutateAsync({
        address_id: address.id,
        payment_method: paymentMethod,
        coupon_code: coupon?.coupon || undefined,
      });

      onSuccess(result);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Your order could not be completed.",
      );

      toast.error(message);
      onFailure(message);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Billing / shipping recap */}
        <div>
          <h2 className="text-[22px] font-semibold">
            Billing Address
          </h2>

          <div className="mt-6 space-y-1.5 border border-[#B9AE97] p-5 text-[15px] leading-7">
            <p className="font-medium">
              {address.full_name}
            </p>
            <p>{address.address_line}</p>
            <p>{address.district}</p>
            <p>
              {address.division} {address.postal_code}
            </p>
            <p>{address.country}</p>
            <p>{address.phone_number}</p>
          </div>
        </div>

        {/* Payment */}
        <div>
          <h2 className="text-[22px] font-semibold">
            Payment
          </h2>

          <p className="mt-6 text-[16px]">
            Please Choose Your Payment Method
          </p>

          <div className="mt-5">
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={onPaymentMethodChange}
            />
          </div>

          <div className="mt-8">
            <CouponField
              subtotal={cart.total_price}
              applied={coupon}
              onApplied={onCouponChange}
            />
          </div>
        </div>
      </div>

      {/* Place order */}
      <div className="mt-12">
        <button
          type="button"
          onClick={placeOrder}
          disabled={checkoutMutation.isPending}
          className="h-[56px] w-full bg-[#5B3A0E] text-[17px] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 lg:w-[520px]"
        >
          {checkoutMutation.isPending
            ? "Placing Order..."
            : "Pay And Place Order"}
        </button>

        <p className="mt-5 max-w-[620px] text-[13px] leading-6 text-[#5A5346]">
          By clicking on 'Pay And Place Order', you agree
          to complete your purchase from Loomino. This is a
          demo checkout — no real payment is processed.
        </p>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 flex items-center gap-2 text-[16px] text-[#5B3A0E] hover:underline"
        >
          <span aria-hidden>&lsaquo;</span> Return To
          Information
        </button>
      </div>
    </div>
  );
}

export default CheckoutPaymentStep;
