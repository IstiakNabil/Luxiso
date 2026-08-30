import type { CheckoutStep } from "../hooks/useCheckoutState";

interface CheckoutStepsProps {
  current: CheckoutStep;
  onNavigate: (step: CheckoutStep) => void;
}

const STEPS: { key: CheckoutStep | "cart"; label: string }[] =
  [
    { key: "cart", label: "Cart" },
    { key: "info", label: "Info" },
    { key: "payment", label: "Payment" },
  ];

function CheckoutSteps({
  current,
  onNavigate,
}: CheckoutStepsProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-[14px] lg:gap-3 lg:text-[20px]">
      {STEPS.map((s, index) => {
        const isActive = s.key === current;

        const isClickable =
          s.key === "cart" || s.key === "info";

        return (
          <div key={s.key} className="flex items-center gap-2 lg:gap-3">
            {s.key === "cart" ? (
              <a
                href="/cart"
                className="text-[#8A6D3B] hover:underline"
              >
                Cart
              </a>
            ) : (
              <button
                type="button"
                disabled={!isClickable}
                onClick={() =>
                  onNavigate(s.key as CheckoutStep)
                }
                className={
                  isActive
                    ? "font-medium text-[#2B2B2B]"
                    : "text-[#8A6D3B] enabled:hover:underline disabled:cursor-default disabled:text-[#B7A98C]"
                }
              >
                {s.label}
              </button>
            )}

            {index < STEPS.length - 1 && (
              <span className="text-[#B7A98C]">/</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export default CheckoutSteps;
