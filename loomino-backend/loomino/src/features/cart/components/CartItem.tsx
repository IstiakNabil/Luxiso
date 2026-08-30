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
      className={`border-b border-[#DCD3C3] py-8 transition-opacity ${
        removeMutation.isPending ? "opacity-50" : ""
      }`}
    >
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_140px_180px_140px]">
        {/* Product */}
        <div className="flex items-start gap-6">
          <Link to={`/products/${item.slug}`}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={item.product}
                className="h-[160px] w-[140px] object-cover"
              />
            ) : (
              <div className="h-[160px] w-[140px] bg-[#E4DACA]" />
            )}
          </Link>

          <div className="flex flex-1 items-start justify-between">
            <div>
              <Link
                to={`/products/${item.slug}`}
                className="text-[20px] font-medium hover:underline"
              >
                {item.product}
              </Link>

              <p className="mt-4 text-[16px] text-[#555555]">
                Size: {item.size}
              </p>

              <p className="mt-2 text-[16px] text-[#555555]">
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
        <p className="text-[18px] md:text-center">
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
        <p className="text-[18px] font-medium md:text-right">
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
