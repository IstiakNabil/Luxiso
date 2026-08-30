import { formatPrice } from "@/lib/utils";
import type { OrderItem } from "../types/order";

interface OrderItemsTableProps {
  items: OrderItem[];
}

/**
 * Order line items. #F0F2EF header row, #CBCBCB borders,
 * Montserrat. Collapses to stacked labels on mobile.
 */
function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <div className="border border-[#CBCBCB]">
      <div className="hidden grid-cols-[1fr_100px_120px_120px] gap-4 border-b border-[#CBCBCB] bg-[#F0F2EF] px-6 py-3 text-[14px] font-bold text-[#0C0C0C] md:grid">
        <span>Product</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Price</span>
        <span className="text-right">Subtotal</span>
      </div>

      {items.map((item, index) => (
        <div
          key={`${item.sku}-${index}`}
          className="grid grid-cols-1 gap-2 border-b border-[#DFDFDF] bg-white px-6 py-4 last:border-b-0 md:grid-cols-[1fr_100px_120px_120px] md:items-center md:gap-4"
        >
          <div>
            <p className="text-[16px] font-bold capitalize text-[#0C0C0C]">
              {item.product_name}
            </p>
            <p className="mt-1 text-[14px] text-[#868686]">
              {item.size} · {item.color} · {item.sku}
            </p>
          </div>

          <p className="text-[15px] md:text-center">
            <span className="text-[#868686] md:hidden">
              Qty:{" "}
            </span>
            {item.quantity}
          </p>

          <p className="text-[15px] md:text-right">
            <span className="text-[#868686] md:hidden">
              Price:{" "}
            </span>
            {formatPrice(item.price)}
          </p>

          <p className="text-[15px] font-bold md:text-right">
            <span className="font-normal text-[#868686] md:hidden">
              Subtotal:{" "}
            </span>
            {formatPrice(item.subtotal)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default OrderItemsTable;
