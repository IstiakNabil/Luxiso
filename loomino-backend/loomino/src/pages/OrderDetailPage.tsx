import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { formatDate, formatPrice } from "@/lib/utils";
import Breadcrumb from "@/components/common/Breadcrumb";
import StatusBadge from "@/components/common/StatusBadge";
import { useOrder } from "@/features/orders/hooks/useOrder";
import { useCancelOrder } from "@/features/orders/hooks/useCancelOrder";
import OrderTracker from "@/features/orders/components/OrderTracker";
import OrderItemsTable from "@/features/orders/components/OrderItemsTable";

function OrderDetailPage() {
  const { orderNumber } = useParams<{
    orderNumber: string;
  }>();

  const { data: order, isLoading, isError } =
    useOrder(orderNumber);

  const cancelMutation = useCancelOrder();
  const [confirmingCancel, setConfirmingCancel] =
    useState(false);

  if (isLoading) {
    return (
      <div className="font-loomino flex min-h-[60vh] items-center justify-center bg-[#F0E6D8]">
        <p className="text-[17px] text-[#606060]">
          Loading order...
        </p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="font-loomino flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-[#F0E6D8] px-6 text-center">
        <p className="text-[18px] text-[#606060]">
          We couldn't find this order.
        </p>
        <Link
          to="/orders"
          className="text-[#4C300D] hover:underline"
        >
          Back to my orders
        </Link>
      </div>
    );
  }

  const canCancel =
    order.status === "pending" ||
    order.status === "confirmed";

  const discount = parseFloat(order.discount);
  const address = order.shipping_address;

  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[960px] px-6 py-[56px] md:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "My Orders", to: "/orders" },
            { label: `#${order.order_number}` },
          ]}
        />

        {/* Header */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-semibold leading-[1.4] text-[#0C0C0C]">
              Order #{order.order_number}
            </h1>
            <p className="mt-2 text-[15px] text-[#606060]">
              Placed on {formatDate(order.created_at)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Tracker */}
        <div className="mt-10 border border-[#CBCBCB] bg-white p-8">
          <OrderTracker status={order.status} />

          {order.tracking_number && (
            <p className="mt-8 text-center text-[15px] text-[#606060]">
              Tracking number:{" "}
              <span className="font-bold text-[#0C0C0C]">
                {order.tracking_number}
              </span>
            </p>
          )}
        </div>

        {/* Items */}
        <h2 className="mt-12 text-[20px] font-bold text-[#0C0C0C]">
          Items
        </h2>
        <div className="mt-4">
          <OrderItemsTable items={order.items} />
        </div>

        {/* Summary + address */}
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-[20px] font-bold text-[#0C0C0C]">
              Shipping Address
            </h2>
            <div className="mt-4 space-y-1 border border-[#CBCBCB] bg-[#F0F2EF] p-6 text-[15px] leading-[1.8]">
              <p className="font-bold">
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

          <div>
            <h2 className="text-[20px] font-bold text-[#0C0C0C]">
              Payment Summary
            </h2>
            <div className="mt-4 space-y-3 border border-[#CBCBCB] bg-[#F0F2EF] p-6 text-[16px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#3B5537]">
                  <span>Discount</span>
                  <span>
                    -{formatPrice(order.discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {parseFloat(order.shipping_cost) === 0
                    ? "Free"
                    : formatPrice(order.shipping_cost)}
                </span>
              </div>

              <div className="flex justify-between border-t border-[#CBCBCB] pt-3 text-[18px] font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel */}
        {canCancel && (
          <div className="mt-12 border-t border-[#CBCBCB] pt-8">
            {confirmingCancel ? (
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-[16px]">
                  Are you sure you want to cancel this
                  order?
                </p>
                <button
                  type="button"
                  onClick={() =>
                    cancelMutation.mutate(
                      order.order_number,
                      {
                        onSettled: () =>
                          setConfirmingCancel(false),
                      },
                    )
                  }
                  disabled={cancelMutation.isPending}
                  className="h-[44px] w-[160px] bg-[#8A3B3B] text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {cancelMutation.isPending
                    ? "Cancelling..."
                    : "Yes, Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmingCancel(false)
                  }
                  className="h-[44px] w-[120px] border border-[#4C300D] text-[#4C300D] transition hover:bg-[#F0F2EF]"
                >
                  Keep Order
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingCancel(true)}
                className="text-[16px] text-[#8A3B3B] hover:underline"
              >
                Cancel This Order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderDetailPage;
