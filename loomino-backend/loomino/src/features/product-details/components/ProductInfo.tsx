import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import type { ProductDetail } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import { useAddToCart } from "@/features/cart/hooks/useAddToCart";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import ProductActions from "./ProductActions";

interface ProductInfoProps {
  product: ProductDetail;
}

function ProductInfo({ product }: ProductInfoProps) {
  const displayPrice =
    product.discount_price ?? product.regular_price;

  const uniqueColors = useMemo(() => {
    const unique = new Map();
    product.variants.forEach((variant) => {
      unique.set(variant.color.id, variant.color);
    });
    return [...unique.values()];
  }, [product.variants]);

  const [selectedColor, setSelectedColor] = useState<
    number | null
  >(null);
  const [selectedSize, setSelectedSize] = useState<
    number | null
  >(null);
  const [quantity, setQuantity] = useState(1);
  const addToCartMutation = useAddToCart();

  const selectedVariant = useMemo(() => {
    if (selectedColor === null || selectedSize === null) {
      return null;
    }
    return (
      product.variants.find(
        (variant) =>
          variant.color.id === selectedColor &&
          variant.size.id === selectedSize,
      ) ?? null
    );
  }, [product.variants, selectedColor, selectedSize]);

  useEffect(() => {
    if (uniqueColors.length > 0 && selectedColor === null) {
      setSelectedColor(uniqueColors[0].id);
    }
  }, [uniqueColors, selectedColor]);

  useEffect(() => {
    setSelectedSize(null);
  }, [selectedColor]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const priceToShow = selectedVariant
    ? selectedVariant.price.toFixed(2)
    : displayPrice;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error("Please select a color and size.");
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        product_variant_id: selectedVariant.id,
        quantity,
      });
      // useAddToCart already shows a success toast.
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not add this item to your cart.",
        ),
      );
    }
  };

  return (
    <div className="font-loomino flex w-full flex-col">
      <h1 className="text-[32px] font-semibold capitalize leading-[1.4] text-[#0C0C0C]">
        {product.name}
      </h1>

      <p className="mt-6 text-[16px] leading-[1.8] text-[#0C0C0C]">
        {product.short_description}
      </p>

      <ColorSelector
        variants={product.variants}
        selectedColor={selectedColor}
        onSelect={setSelectedColor}
      />

      <SizeSelector
        variants={product.variants}
        selectedColor={selectedColor}
        selectedSize={selectedSize}
        onSelect={setSelectedSize}
      />

      <QuantitySelector
        quantity={quantity}
        maxQuantity={selectedVariant?.stock ?? 1}
        disabled={
          !selectedVariant || !selectedVariant.available
        }
        onDecrease={() =>
          setQuantity((prev) => Math.max(1, prev - 1))
        }
        onIncrease={() =>
          setQuantity((prev) =>
            Math.min(selectedVariant?.stock ?? 1, prev + 1),
          )
        }
      />

      {/* Price */}
      <div className="mt-8">
        <span className="text-[28px] font-semibold text-[#0C0C0C]">
          {formatPrice(priceToShow)}
        </span>

        {product.discount_price && (
          <span className="ml-3 text-[18px] text-[#868686] line-through">
            {formatPrice(product.regular_price)}
          </span>
        )}
      </div>

      <ProductActions
        price={priceToShow}
        disabled={
          !selectedVariant || !selectedVariant.available
        }
        isAdding={addToCartMutation.isPending}
        variantId={selectedVariant?.id ?? null}
        productName={product.name}
        onAddToCart={handleAddToCart}
      />

      {selectedVariant && (
        <div className="mt-4 space-y-1 text-[14px] text-[#606060]">
          <p>
            <span className="font-medium text-[#0C0C0C]">
              SKU:
            </span>{" "}
            {selectedVariant.sku}
          </p>
          <p>
            <span className="font-medium text-[#0C0C0C]">
              Availability:
            </span>{" "}
            {selectedVariant.available
              ? `${selectedVariant.stock} in stock`
              : "Out of stock"}
          </p>
        </div>
      )}

      {/* Rating */}
      <div className="mt-5 flex items-center gap-2 text-[15px]">
        <Star
          size={18}
          className="fill-[#4C300D] stroke-[#4C300D]"
        />
        <span className="font-medium text-[#0C0C0C]">
          {product.average_rating.toFixed(1)}
        </span>
        <span className="text-[#606060]">
          ({product.review_count}{" "}
          {product.review_count === 1
            ? "review"
            : "reviews"}
          )
        </span>
      </div>
    </div>
  );
}

export default ProductInfo;
