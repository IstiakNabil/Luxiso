import Breadcrumb from "@/features/shop/components/Breadcrumb";
import ShopHero from "@/features/shop/banner/ShopHero";
import useProducts from "@/features/shop/hooks/useProducts";
import ShopLayout from "@/features/shop/layout/ShopLayout";
import FilterSidebar from "@/features/shop/filters/FilterSidebar";
import ProductList from "@/features/shop/products/ProductList";
import useFilters from "@/features/shop/hooks/useFilters";


function ShopPage() {
    const productState = useProducts();
    const filterState = useFilters();
  return (
    <>
      <Breadcrumb />

      <ShopHero />
         
<ShopLayout
  sidebar={
<FilterSidebar
  ordering={productState.filters.ordering}
  setOrdering={(value) =>
    productState.applyFilter("ordering", value)
  }

  categories={filterState.categories}
  brands={filterState.brands}
  colors={filterState.colors}
  sizes={filterState.sizes}

  selectedCategory={productState.filters.category}
  setCategory={(value) =>
    productState.applyFilter("category", value)
  }

  selectedBrand={productState.filters.brand}
  setBrand={(value) =>
    productState.applyFilter("brand", value)
  }

  selectedColor={productState.filters.color}
  setColor={(value) =>
    productState.applyFilter("color", value)
  }

  selectedSize={productState.filters.size}
  setSize={(value) =>
    productState.applyFilter("size", value)
  }

  setMinPrice={(value) =>
  productState.applyFilter("min_price", value)
}

setMaxPrice={(value) =>
  productState.applyFilter("max_price", value)
}

  onClearFilters={productState.resetFilters}

  filters={productState.filters}
  removeFilter={productState.removeFilter}
/>
  }
>
  <ProductList
    products={productState.products}
    loading={productState.loading}
    error={productState.error}
    totalProducts={productState.totalProducts}
    hasNextPage={productState.hasNextPage}
    search={productState.filters.search}
  setSearch={(value) =>
    productState.applyFilter("search", value)
  }
   loadNextPage={productState.loadNextPage}
  />
</ShopLayout>
    </>
  );
}


export default ShopPage;