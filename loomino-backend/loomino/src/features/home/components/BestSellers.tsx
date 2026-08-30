import { Link } from "react-router-dom";
import { useBestSellers } from "@/features/product-details/hooks/useBestSellers";
import ProductCard from "../../../components/product/ProductCard";
import Container from "@/components/layout/Container";

function BestSellers() {
  const { data } = useBestSellers();
  const products = data?.slice(0, 3) ?? [];

  return (
    <section className="py-16">
      <Container>
    <div className="mb-10 flex items-center justify-between">
      <h2 className="text-[32px] font-semibold text-[#1E1E1E]">
        Best Sellers
      </h2>

      <Link
        to="/best-sellers"
        className="text-sm text-[#1E1E1E] hover:underline"
      >
        View All
      </Link>
    </div>

    <div className="grid grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
    </Container>
  </section>
  );
}

export default BestSellers;