import { useState } from "react";
import { Navigate } from "react-router-dom";

import { useCart } from "@/features/cart/hooks/useCart";
import CheckoutSteps from "@/features/checkout/components/CheckoutSteps";
import CheckoutSummary from "@/features/checkout/components/CheckoutSummary";
import CheckoutInfoStep from "@/features/checkout/components/CheckoutInfoStep";
import CheckoutPaymentStep from "@/features/checkout/components/CheckoutPaymentStep";
import CheckoutSuccess from "@/features/checkout/components/CheckoutSuccess";
import CheckoutFailure from "@/features/checkout/components/CheckoutFailure";
import { useCheckoutState } from "@/features/checkout/hooks/useCheckoutState";
import type { CheckoutResponse } from "@/features/checkout/types/checkout";

type Result =
  | { kind: "none" }
  | { kind: "success"; data: CheckoutResponse }
  | { kind: "failure"; message: string };

function CheckoutPage() {
  const { data: cart, isLoading } = useCart();
  const checkout = useCheckoutState();
  const [result, setResult] = useState<Result>({
    kind: "none",
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F1E9DC]">
        <p className="text-[18px] text-[#666]">
          Loading checkout...
        </p>
      </div>
    );
  }

  // Success / failure screens take over the whole page.
  if (result.kind === "success") {
    return (
      <div className="bg-[#F1E9DC]">
        <CheckoutSuccess result={result.data} />
      </div>
    );
  }

  if (result.kind === "failure") {
    return (
      <div className="bg-[#F1E9DC]">
        <CheckoutFailure
          message={result.message}
          onRetry={() => setResult({ kind: "none" })}
        />
      </div>
    );
  }

  // Guard: no cart or empty cart -> back to cart page.
  if (!cart || cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="grid min-h-[calc(100vh-110px)] grid-cols-1 lg:grid-cols-[1fr_540px]">
      {/* Left: steps */}
      <div className="bg-[#F1E9DC] px-6 py-12 md:px-[80px] lg:px-[96px]">
        <CheckoutSteps
          current={checkout.step}
          onNavigate={checkout.setStep}
        />

        <div className="mt-10 max-w-[640px]">
          {checkout.step === "info" && (
            <CheckoutInfoStep
              onComplete={(address) => {
                checkout.setAddress(address);
                checkout.setStep("payment");
              }}
            />
          )}

          {checkout.step === "payment" &&
            checkout.address && (
              <CheckoutPaymentStep
                address={checkout.address}
                cart={cart}
                coupon={checkout.coupon}
                paymentMethod={checkout.paymentMethod}
                onCouponChange={checkout.setCoupon}
                onPaymentMethodChange={
                  checkout.setPaymentMethod
                }
                onBack={() => checkout.setStep("info")}
                onSuccess={(data) =>
                  setResult({ kind: "success", data })
                }
                onFailure={(message) =>
                  setResult({ kind: "failure", message })
                }
              />
            )}
        </div>
      </div>

      {/* Right: summary */}
      <CheckoutSummary
        cart={cart}
        coupon={checkout.coupon}
      />
    </div>
  );
}

export default CheckoutPage;
