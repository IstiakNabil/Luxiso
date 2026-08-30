import { Check } from "lucide-react";

import type { OrderStatus } from "../types/order";

const FLOW: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

interface OrderTrackerProps {
  status: OrderStatus;
}

/**
 * Horizontal progress tracker. Uses brown (#4C300D) for
 * completed stages to match the Loomino accent. Cancelled
 * orders show a dedicated banner instead of the flow.
 */
function OrderTracker({ status }: OrderTrackerProps) {
  if (status === "cancelled") {
    return (
      <div className="border border-[#E4C7C7] bg-[#F3E3E3] px-6 py-5 text-[15px] text-[#8A3B3B]">
        This order was cancelled.
      </div>
    );
  }

  const currentIndex = FLOW.findIndex(
    (s) => s.key === status,
  );

  return (
    <div className="flex items-center">
      {FLOW.map((stage, index) => {
        const isDone = index <= currentIndex;
        const isLast = index === FLOW.length - 1;

        return (
          <div
            key={stage.key}
            className="flex flex-1 items-center last:flex-none"
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                  isDone
                    ? "border-[#4C300D] bg-[#4C300D] text-white"
                    : "border-[#CBCBCB] text-[#CBCBCB]"
                }`}
              >
                {isDone ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <span className="text-[13px]">
                    {index + 1}
                  </span>
                )}
              </div>
              <span
                className={`mt-2 whitespace-nowrap text-[13px] ${
                  isDone
                    ? "text-[#0C0C0C]"
                    : "text-[#868686]"
                }`}
              >
                {stage.label}
              </span>
            </div>

            {!isLast && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  index < currentIndex
                    ? "bg-[#4C300D]"
                    : "bg-[#CBCBCB]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default OrderTracker;
