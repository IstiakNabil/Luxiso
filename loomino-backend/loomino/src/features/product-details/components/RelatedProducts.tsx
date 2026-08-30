import { useRelatedProducts } from "./useRelatedProducts";
import ProductCard from "@/components/product/ProductCard";


interface RelatedProductsProps {
  slug: string;
}

function RelatedProducts({
  slug,
}: RelatedProductsProps) {
  const {
    data,
    isLoading,
    isError,
  } = useRelatedProducts(slug);

  if (isLoading) {
    return null;
  }

  if (isError) {
    return null;
  }

  if (!data || data.results.length === 0) {
    return null;
  }

  return (
    <section className="mt-[64px]">
      <h2 className="mb-8 text-[32px] font-semibold leading-[1.4] text-[#0C0C0C]">
        You May Also Like
      </h2>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
  {data.results.map((product) => (
    <ProductCard
      key={product.id}
      product={product}
    />
  ))}
</div>
    </section>
  );
}

export default RelatedProducts;