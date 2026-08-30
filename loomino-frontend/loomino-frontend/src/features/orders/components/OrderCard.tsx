import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { formatDate, formatPrice } from "@/lib/utils";
import StatusBadge from "@/components/common/StatusBadge";
import type { OrderListItem } from "../types/order";

interface OrderCardProps {
  order: OrderListItem;
}

/**
 * Order row styled to the Loomino system: #F6EFE8 panel,
 * #CBCBCB border, brown hover accent, Montserrat type.
 */
function OrderCard({ order }: OrderCardProps) {
  return (
    <Link
      to={`/orders/${order.order_number}`}
      className="group block border border-[#CBCBCB] bg-[#F6EFE8] p-6 transition hover:border-[#8A6A2E]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.8px] text-[#868686]">
            Order
          </p>
          <p className="mt-1 text-[20px] font-bold leading-[1.4] text-[#1F1210]">
            #{order.order_number}
          </p>
          <p className="mt-2 text-[14px] leading-[1.8] text-[#606060]">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <StatusBadge status={order.status} />
            <p className="mt-3 text-[20px] font-bold text-[#1F1210]">
              {formatPrice(order.total)}
            </p>
          </div>

          <ChevronRight
            size={22}
            className="text-[#868686] transition group-hover:text-[#8A6A2E]"
          />
        </div>
      </div>
    </Link>
  );
}

export default OrderCard;
