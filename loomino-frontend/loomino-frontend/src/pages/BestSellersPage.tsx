import { Link } from "react-router-dom";

import Breadcrumb from "@/components/common/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import { useBestSellers } from "@/features/product-details/hooks/useBestSellers";

function BestSellersPage() {
  const { data, isLoading, isError } = useBestSellers();

  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[1920px] px-5 md:px-10 pt-[32px] lg:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Best Sellers" },
          ]}
        />
      </div>

      <div className="mx-auto max-w-[1920px] px-5 md:px-10 pb-[80px] lg:px-[108px]">
        <h1 className="text-[32px] font-semibold capitalize leading-[1.4] text-[#1F1210]">
          Best Sellers
        </h1>
        <p className="mt-3 text-[16px] leading-[1.8] text-[#606060]">
          Our most-loved pieces, ranked by what's flying off
          the shelves.
        </p>

        <div className="mt-10">
          {isLoading && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <div className="h-[438px] w-full animate-pulse bg-[#E4DACA]" />
                  <div className="mt-4 h-4 w-2/3 animate-pulse bg-[#E4DACA]" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <p className="py-16 text-center text-[17px] text-[#606060]">
              We couldn't load best sellers right now. Please
              try again.
            </p>
          )}

          {data && data.length === 0 && (
            <div className="flex flex-col items-center py-[80px] text-center">
              <h2 className="text-[22px] font-bold text-[#1F1210]">
                Nothing here yet
              </h2>
              <p className="mt-3 max-w-[380px] text-[16px] leading-[1.8] text-[#606060]">
                Once orders start rolling in, our best
                sellers will appear here.
              </p>
              <Link
                to="/shop"
                className="mt-8 inline-flex h-10 w-full max-w-[280px] items-center justify-center bg-[#5C1626] lg:h-[48px] lg:w-[220px] text-[14px] text-white transition hover:opacity-90"
              >
                Browse The Collection
              </Link>
            </div>
          )}

          {data && data.length > 0 && (
            <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {data.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showQuickAdd
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BestSellersPage;
