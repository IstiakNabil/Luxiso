interface ProductBreadcrumbProps {
  category: string;
  productName: string;
}

function ProductBreadcrumb({
  category,
  productName,
}: ProductBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto flex h-10 max-w-[1920px] items-center px-[108px] pt-[32px] text-[18px]"
    >
      <span className="text-[#6B5B4B]">Home</span>

      <span className="mx-4 text-[#6B5B4B]">/</span>

      <span className="text-[#6B5B4B]">{category}</span>

      <span className="mx-4 text-[#6B5B4B]">/</span>

      <span className="font-medium text-black">
        {productName}
      </span>
    </nav>
  );
}

export default ProductBreadcrumb;