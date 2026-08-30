import { X } from "lucide-react";
import { Link } from "react-router-dom";

import { formatPrice, getMediaUrl } from "@/lib/utils";
import CartQuantitySelector from "./CartQuantitySelector";
import { useUpdateCartItem } from "../hooks/useUpdateCartItem";
import { useRemoveCartItem } from "../hooks/useRemoveCartItem";
import type { CartItem as CartItemType } from "../types/cart";

interface CartItemProps {
  item: CartItemType;
}

function CartItem({ item }: CartItemProps) {
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();

  const isBusy =
    updateMutation.isPending || removeMutation.isPending;

  const changeQuantity = (quantity: number) => {
    if (quantity < 1) return;

    updateMutation.mutate({ id: item.id, quantity });
  };

  const imageUrl = getMediaUrl(item.image);

  return (
    <div
      className={`border-b border-[#DCD3C3] py-5 transition-opacity lg:py-8 ${
        removeMutation.isPending ? "opacity-50" : ""
      }`}
    >
      <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[minmax(0,1fr)_140px_180px_140px] md:gap-6">
        {/* Product */}
        <div className="flex items-start gap-4 lg:gap-6">
          <Link to={`/products/${item.slug}`}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.product}
                className="h-[115px] w-[90px] object-cover lg:h-[160px] lg:w-[140px]"
              />
            ) : (
              <div className="h-[115px] w-[90px] bg-[#E4DACA] lg:h-[160px] lg:w-[140px]" />
            )}
          </Link>

          <div className="flex flex-1 items-start justify-between">
            <div>
              <Link
                to={`/products/${item.slug}`}
                className="text-[14px] font-semibold hover:underline lg:text-[20px] lg:font-medium"
              >
                {item.product}
              </Link>

              <p className="mt-2 text-[13px] text-[#555555] lg:mt-4 lg:text-[16px]">
                Size: {item.size}
              </p>

              <p className="mt-1 text-[13px] text-[#555555] lg:mt-2 lg:text-[16px]">
                Color: {item.color}
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeMutation.mutate(item.id)}
              disabled={isBusy}
              aria-label={`Remove ${item.product} from cart`}
              className="text-[#333333] transition hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Price */}
        <p className="text-[14px] md:text-center md:text-[18px]">
          <span className="mr-2 text-[14px] text-[#888888] md:hidden">
            Price:
          </span>
          {formatPrice(item.price)}
        </p>

        {/* Quantity */}
        <div className="flex md:justify-center">
          <CartQuantitySelector
            quantity={item.quantity}
            disabled={isBusy}
            onDecrease={() =>
              changeQuantity(item.quantity - 1)
            }
            onIncrease={() =>
              changeQuantity(item.quantity + 1)
            }
          />
        </div>

        {/* Total */}
        <p className="text-[14px] font-medium md:text-right md:text-[18px]">
          <span className="mr-2 text-[14px] font-normal text-[#888888] md:hidden">
            Total:
          </span>
          {formatPrice(item.subtotal)}
        </p>
      </div>
    </div>
  );
}

export default CartItem;
