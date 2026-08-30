import { Link } from "react-router-dom";

import Breadcrumb from "@/components/common/Breadcrumb";
import ProductCard from "@/components/product/ProductCard";
import CmsImage from "@/components/common/CmsImage";
import { useModiweek } from "@/features/product-details/hooks/useModiweek";

function ModiweekPage() {
  const { data, isLoading, isError } = useModiweek();

  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[1920px] px-6 pt-[32px] md:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "Modiweek" },
          ]}
        />
      </div>

      {/* Editorial hero — "shop the look" treatment */}
      <div className="mx-auto max-w-[1920px] px-6 pb-[48px] pt-[24px] md:px-[108px]">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[496px_1fr]">
          <div>
            <h1 className="mb-6 text-[32px] font-semibold capitalize leading-[1.4] text-[#0C0C0C]">
              The Modiweek Edit
            </h1>
            <CmsImage
              bannerKey="modiweek_feature"
              label="Modiweek feature look"
              className="h-[560px] w-full"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="text-[20px] font-bold capitalize text-[#0C0C0C]">
              Shop The Look
            </h2>
            <p className="mt-2 text-[16px] leading-[1.8] text-[#606060]">
              A curated edit of our Modiweek pieces —
              refreshed styles to shop now.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex h-[48px] w-[220px] items-center justify-center bg-[#4C300D] text-[14px] capitalize text-white transition hover:opacity-90"
            >
              Explore Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Modiweek products */}
      <div className="mx-auto max-w-[1920px] px-6 pb-[80px] md:px-[108px]">
        <h2 className="mb-8 text-[24px] font-bold capitalize text-[#0C0C0C]">
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
            We couldn't load the Modiweek edit right now.
            Please try again.
          </p>
        )}

        {data && data.length === 0 && (
          <div className="flex flex-col items-center py-[80px] text-center">
            <h3 className="text-[22px] font-bold text-[#0C0C0C]">
              Nothing In The Edit Yet
            </h3>
            <p className="mt-3 max-w-[400px] text-[16px] leading-[1.8] text-[#606060]">
              Check back soon — new Modiweek looks are on
              their way.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex h-[48px] w-[220px] items-center justify-center bg-[#343E32] text-[14px] text-white transition hover:opacity-90"
            >
              Browse The Collection
            </Link>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ModiweekPage;
