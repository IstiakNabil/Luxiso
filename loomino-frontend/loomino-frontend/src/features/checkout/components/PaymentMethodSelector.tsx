import type { PaymentMethod } from "../types/checkout";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const METHODS: { key: PaymentMethod; label: string }[] = [
  { key: "cod", label: "Cash On Delivery" },
  { key: "sslcommerz", label: "SSL Gateway" },
];

function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {METHODS.map((method) => {
        const isSelected = value === method.key;

        return (
          <button
            key={method.key}
            type="button"
            onClick={() => onChange(method.key)}
            className={`flex w-full items-center gap-3 border px-5 py-4 text-left text-[16px] transition ${
              isSelected
                ? "border-[#5B3A0E] bg-[#F1E9DC]"
                : "border-[#B9AE97] hover:border-[#5B3A0E]"
            }`}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                isSelected
                  ? "border-[#5B3A0E]"
                  : "border-[#9A8F79]"
              }`}
            >
              {isSelected && (
                <span className="h-2.5 w-2.5 rounded-full bg-[#5B3A0E]" />
              )}
            </span>

            {method.label}
          </button>
        );
      })}
    </div>
  );
}

export default PaymentMethodSelector;
