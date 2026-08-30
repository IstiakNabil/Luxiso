import { useParams } from "react-router-dom";

import Breadcrumb from "@/components/common/Breadcrumb";
import { useProduct } from "@/features/product-details/hooks/useProduct";
import ProductGallery from "@/features/product-details/components/ProductGallery";
import ProductInfo from "@/features/product-details/components/ProductInfo";
import ProductAccordionSection from "@/features/product-details/components/ProductAccordionSection";
import ProductDescriptionCard from "@/features/product-details/components/ProductDescriptionCard";
import RelatedProducts from "@/features/product-details/components/RelatedProducts";
import ReviewsSection from "@/features/reviews/components/ReviewsSection";

function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, isError } =
    useProduct(slug ?? "");

  if (isLoading) {
    return (
      <div className="font-loomino flex min-h-[60vh] items-center justify-center bg-[#F0E6D8]">
        <p className="text-[17px] text-[#606060]">
          Loading product...
        </p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="font-loomino flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-[#F0E6D8] px-5 md:px-10 text-center">
        <p className="text-[18px] text-[#606060]">
          We couldn't load this product.
        </p>
      </div>
    );
  }

  return (
    <div className="font-loomino bg-[#F0E6D8]">
      <div className="mx-auto max-w-[1920px] px-5 md:px-10 pt-[32px] lg:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: product.category, to: "/shop" },
            { label: product.name },
          ]}
        />
      </div>

      <div className="mx-auto max-w-[1920px] px-5 md:px-10 pb-[96px] pt-[40px] lg:px-[108px]">
        <div className="grid grid-cols-1 items-start gap-x-6 gap-y-10 lg:grid-cols-2">
          {/* Top Left: gallery */}
          <ProductGallery images={product.images} />

          {/* Top Right: info + variant selection */}
          <ProductInfo product={product} />

          {/* Bottom Left: accordions */}
          <ProductAccordionSection product={product} />

          {/* Bottom Right: description card */}
          <ProductDescriptionCard
            description={product.description}
          />
        </div>

        <ReviewsSection
          productId={product.id}
          slug={product.slug}
          averageRating={product.average_rating}
          reviewCount={product.review_count}
        />

        <RelatedProducts slug={product.slug} />
      </div>
    </div>
  );
}

export default ProductDetailsPage;
