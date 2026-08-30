import { Link } from "react-router-dom";

import { getMediaUrl } from "@/lib/utils";
import { CURRENCY_SYMBOL } from "@/lib/constants";
import WishlistButton from "@/features/wishlist/components/WishlistButton";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import type { Product } from "@/types/product";

interface MidweekCardProps {
  product: Product;
}

function MidweekCard({ product }: MidweekCardProps) {
  return (
    <article className="group w-[152px] shrink-0 transition-opacity duration-200 hover:opacity-95 lg:w-[288px]">
      <Link
        to={`/products/${product.slug}`}
        className="relative block w-full overflow-hidden"
        style={{ aspectRatio: "288 / 426" }}
      >
        <img
          src={getMediaUrl(product.thumbnail) ?? ""}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute right-4 top-4 flex flex-col gap-2">
          <WishlistButton
            variantId={product.default_variant_id}
            productName={product.name}
            size={18}
          />
        </div>

        {/* Hidden until hover, then slides up over the bottom
            edge of the image — same pattern as every other
            product card on the site. */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
          <AddToCartButton
            variantId={product.default_variant_id}
            productName={product.name}
            variant="bar"
          />
        </div>
      </Link>

      <Link to={`/products/${product.slug}`} className="block">
        {product.product_type && (
          <p className="mt-4 truncate text-[13px] font-bold capitalize text-[#1F1210]">
            {product.product_type}
          </p>
        )}
        <p className="mt-1 truncate text-[13px] font-medium text-[#1E1E1E] group-hover:underline">
          {product.name}
        </p>
        <p className="mt-1 text-[13px] font-bold text-[#1F1210]">
          {CURRENCY_SYMBOL}
          {Number(product.price).toFixed(0)}
        </p>
      </Link>
    </article>
  );
}

export default MidweekCard;
