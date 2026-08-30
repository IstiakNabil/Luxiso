import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";

function useProducts() {
const [searchParams] = useSearchParams();

// Seed filters from the URL so links like
// /shop?category=pants&is_new_arrival=true apply on arrival.
const initialFilters = {
  ordering: searchParams.get("ordering") || "-created_at",
  search: searchParams.get("search") || "",
  category: searchParams.get("category") || "",
  brand: searchParams.get("brand") || "",
  color: searchParams.get("color") || "",
  size: searchParams.get("size") || "",
  min_price: searchParams.get("min_price") || "",
  max_price: searchParams.get("max_price") || "",
  is_featured: searchParams.get("is_featured") === "true",
  is_new_arrival:
    searchParams.get("is_new_arrival") === "true",
  page: 1,
};

const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(products.length === 0);
const [error, setError] = useState<string | null>(null);
const [totalProducts, setTotalProducts] = useState(0);
const [hasNextPage, setHasNextPage] = useState(false);
const [filters, setFilters] = useState(initialFilters);

// When the URL query string changes (e.g. navigating from
// one mega-menu link to another while already on /shop),
// re-seed the filters so the grid updates.
const searchKey = searchParams.toString();
useEffect(() => {
  setFilters({
    ordering: searchParams.get("ordering") || "-created_at",
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    brand: searchParams.get("brand") || "",
    color: searchParams.get("color") || "",
    size: searchParams.get("size") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    is_featured: searchParams.get("is_featured") === "true",
    is_new_arrival:
      searchParams.get("is_new_arrival") === "true",
    page: 1,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchKey]);
useEffect(() => {
  async function fetchProducts() {
    if (products.length === 0) {
  setLoading(true);
}
    try {
   const response = await getProducts(filters);

      if (filters.page === 1) {
  setProducts(response.results);
} else {
  setProducts((prev) => [
    ...prev,
    ...response.results,
  ]);
}
      setTotalProducts(response.count);
      setHasNextPage(response.next !== null);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  fetchProducts();
}, [filters]);

function updateFilter<K extends keyof typeof filters>(
  key: K,
  value: (typeof filters)[K],
) {
  setFilters((prev) => ({
    ...prev,
    [key]: value,
  }));
}

function applyFilter<K extends keyof typeof filters>(
  key: K,
  value: (typeof filters)[K],
) {
  setFilters((prev) => ({
    ...prev,
    [key]: value,
    page: 1,
  }));
}

function loadNextPage() {
  updateFilter("page", filters.page + 1);
}

function removeFilter(
  key: "category" | "brand" | "color" | "size",
) {
  updateFilter(key, "");
}

function resetFilters() {
  setFilters({
    ordering: "-created_at",

    search: "",

    category: "",

    brand: "",

    color: "",

    size: "",

    min_price: "",

    max_price: "",

    is_featured: false,

    is_new_arrival: false,

    page: 1,
  });
}

return {
  products,
  loading,
  error,
  totalProducts,
  hasNextPage,
  filters,
  updateFilter,
  applyFilter,
  loadNextPage,
  removeFilter,
  resetFilters,
};

}



export default useProducts;

