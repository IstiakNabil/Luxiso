import { Link } from "react-router-dom";
import { useBestSellers } from "@/features/product-details/hooks/useBestSellers";
import ProductCard from "../../../components/product/ProductCard";
import Container from "@/components/layout/Container";

function BestSellers() {
  const { data } = useBestSellers();
  const products = data?.slice(0, 3) ?? [];

  return (
    <section className="py-10 lg:py-16">
      <Container>
    <div className="mb-6 flex items-center justify-between lg:mb-10">
      <h2 className="text-[22px] font-semibold text-[#1E1E1E] lg:text-[32px]">
        Best Sellers
      </h2>

      <Link
        to="/best-sellers"
        className="text-sm text-[#1E1E1E] hover:underline"
      >
        View All
      </Link>
    </div>

    <div className="grid grid-cols-2 gap-4 [&>*:nth-child(3)]:hidden lg:grid-cols-3 lg:gap-6 lg:[&>*:nth-child(3)]:block">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showQuickAdd
        />
      ))}
    </div>
    </Container>
  </section>
  );
}

export default BestSellers;