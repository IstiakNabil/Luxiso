import type { ProductDetail } from "@/types/product";

import ProductAccordionSection from "./ProductAccordionSection";
import ProductDescriptionCard from "./ProductDescriptionCard";

interface ProductBottomSectionProps {
  product: ProductDetail;
}

function ProductBottomSection({
  product,
}: ProductBottomSectionProps) {
  return (
    <div className="mt-4 flex items-start gap-4">
      <div className="h-[729px] w-[600px]">
  <ProductAccordionSection product={product} />
</div>

      <div className="w-[600px]">
  <ProductDescriptionCard
    description={product.description}
  />
</div>
    </div>
  );
}

export default ProductBottomSection;