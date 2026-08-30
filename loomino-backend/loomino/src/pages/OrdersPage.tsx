import { useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";

import Breadcrumb from "@/components/common/Breadcrumb";
import Pagination from "@/components/common/Pagination";
import { useOrders } from "@/features/orders/hooks/useOrders";
import OrderCard from "@/features/orders/components/OrderCard";
import OrdersSkeleton from "@/features/orders/components/OrdersSkeleton";

function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useOrders(page);

  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[960px] px-6 py-[56px] md:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "My Orders" },
          ]}
        />

        <h1 className="mt-6 text-[32px] font-semibold leading-[1.4] text-[#0C0C0C]">
          My Orders
        </h1>

        <div className="mt-10">
          {isLoading && <OrdersSkeleton />}

          {isError && (
            <p className="py-16 text-center text-[17px] text-[#606060]">
              We couldn't load your orders. Please try
              again.
            </p>
          )}

          {data && data.results.length === 0 && (
            <div className="flex flex-col items-center py-[80px] text-center">
              <Package
                size={64}
                strokeWidth={1.2}
                className="text-[#B39A73]"
              />
              <h2 className="mt-8 text-[24px] font-bold text-[#0C0C0C]">
                No Orders Yet
              </h2>
              <p className="mt-3 max-w-[380px] text-[16px] leading-[1.8] text-[#606060]">
                When you place an order, it'll show up here.
              </p>
              <Link
                to="/shop"
                className="mt-8 inline-flex h-[48px] w-[220px] items-center justify-center bg-[#343E32] text-[14px] text-white transition hover:opacity-90"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {data && data.results.length > 0 && (
            <>
              <div className="space-y-4">
                {data.results.map((order) => (
                  <OrderCard
                    key={order.order_number}
                    order={order}
                  />
                ))}
              </div>

              <div className="mt-12">
                <Pagination
                  page={data.page}
                  totalPages={data.total_pages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
