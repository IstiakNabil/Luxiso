import { Link } from "react-router-dom";

import Breadcrumb from "@/components/common/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import { usePlusSizeProducts } from "@/features/plus-size/hooks/usePlusSizeProducts";

function PlusSizePage() {
  const { products, loading, error, plusSizes } =
    usePlusSizeProducts();

  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[1920px] px-6 pt-[32px] md:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Plus Size" },
          ]}
        />
      </div>

      <div className="mx-auto max-w-[1920px] px-6 pb-[80px] md:px-[108px]">
        <h1 className="text-[32px] font-semibold capitalize leading-[1.4] text-[#0C0C0C]">
          Plus Size
        </h1>
        <p className="mt-3 text-[16px] leading-[1.8] text-[#606060]">
          Designed to fit and flatter — our pieces available
          in extended sizes
          {plusSizes.length > 0
            ? ` (${plusSizes.join(", ")})`
            : ""}
          .
        </p>

        <div className="mt-10">
          {loading && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <div className="h-[438px] w-full animate-pulse bg-[#E4DACA]" />
                  <div className="mt-4 h-4 w-2/3 animate-pulse bg-[#E4DACA]" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="py-16 text-center text-[17px] text-[#606060]">
              {error}
            </p>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="flex flex-col items-center py-[80px] text-center">
              <h2 className="text-[22px] font-bold text-[#0C0C0C]">
                No Plus Size Items Yet
              </h2>
              <p className="mt-3 max-w-[400px] text-[16px] leading-[1.8] text-[#606060]">
                We don't have products in extended sizes
                right now. Check back soon.
              </p>
              <Link
                to="/shop"
                className="mt-8 inline-flex h-[48px] w-[220px] items-center justify-center bg-[#343E32] text-[14px] text-white transition hover:opacity-90"
              >
                Browse The Collection
              </Link>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <>
              <p className="mb-6 text-[14px] text-[#606060]">
                Showing {products.length}{" "}
                {products.length === 1
                  ? "product"
                  : "products"}
              </p>
              <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlusSizePage;
