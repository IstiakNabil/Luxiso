import { Link } from "react-router-dom";

import Breadcrumb from "@/components/common/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import CmsImage from "@/components/common/CmsImage";
import { useOnSale } from "@/features/product-details/hooks/useOnSale";

function OnSalePage() {
  const { data, isLoading, isError } = useOnSale();

  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[1920px] px-5 md:px-10 pt-[32px] lg:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "On Sale" },
          ]}
        />
      </div>

      {/* Editorial hero — "shop the look" treatment */}
      <div className="mx-auto max-w-[1920px] px-5 md:px-10 pb-[48px] pt-[24px] lg:px-[108px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[496px_1fr]">
          <div>
            <h1 className="mb-6 text-[32px] font-semibold capitalize leading-[1.4] text-[#1F1210]">
              On Sale
            </h1>
            <CmsImage
              bannerKey="on_sale_feature"
              label="On Sale feature look"
              className="h-[360px] lg:h-[560px] w-full"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-[20px] font-bold capitalize text-[#1F1210]">
              Shop The Look
            </h2>
            <p className="mt-2 text-[16px] leading-[1.8] text-[#606060]">
              A curated edit of our On Sale pieces —
              refreshed styles to shop now.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex h-[48px] w-[220px] items-center justify-center bg-[#5C1626] text-[14px] capitalize text-white transition hover:opacity-90"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>

      {/* On Sale products */}
      <div className="mx-auto max-w-[1920px] px-5 md:px-10 pb-[80px] lg:px-[108px]">
        <h2 className="mb-8 text-[24px] font-bold capitalize text-[#1F1210]">
          This Week's Picks
        </h2>

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
            We couldn't load the On Sale edit right now.
            Please try again.
          </p>
        )}

        {data && data.length === 0 && (
          <div className="flex flex-col items-center py-[80px] text-center">
            <h3 className="text-[22px] font-bold text-[#1F1210]">
              Nothing In The Edit Yet
            </h3>
            <p className="mt-3 max-w-[400px] text-[16px] leading-[1.8] text-[#606060]">
              Check back soon — new On Sale looks are on
              their way.
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
  );
}

export default OnSalePage;
