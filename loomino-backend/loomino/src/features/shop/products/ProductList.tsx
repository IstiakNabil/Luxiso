import { Link } from "react-router-dom";

import ProductCard from "@/components/product/ProductCard";
import ProductHeader from "./ProductHeader";
import LoadMoreButton from "./LoadMoreButton";
import type { Product } from "@/types/product";


interface ProductListProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  totalProducts: number;
  hasNextPage: boolean;

  search: string;
  setSearch: (value: string) => void;

  loadNextPage: () => void;
}

function ProductList({
  products,
  loading,
  error,
  totalProducts,
  hasNextPage,
  search,
  setSearch,
  loadNextPage,
}: ProductListProps) {
  if (loading && products.length === 0) {
    return (
      <p className="py-16 text-center text-[16px] text-[#606060]">
        Loading products...
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-16 text-center text-[16px] text-[#606060]">
        {error}
      </p>
    );
  }

  return (
    <>
      <ProductHeader
        totalProducts={totalProducts}
        search={search}
        setSearch={setSearch}
      />

      {products.length === 0 ? (
        <div className="flex flex-col items-center py-[80px] text-center">
          <h2 className="text-[22px] font-bold text-[#0C0C0C]">
            No Products Found
          </h2>
          <p className="mt-3 max-w-[420px] text-[16px] leading-[1.8] text-[#606060]">
            We couldn't find any products matching this
            selection. Try adjusting your filters or browse
            the full collection.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex h-[48px] w-[240px] items-center justify-center bg-[#343E32] text-[14px] text-white transition hover:opacity-90"
          >
            Browse All Products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {hasNextPage && (
            <LoadMoreButton onClick={loadNextPage} />
          )}
        </>
      )}
    </>
  );
}

export default ProductList;