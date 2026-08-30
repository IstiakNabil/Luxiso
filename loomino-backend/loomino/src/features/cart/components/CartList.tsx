import CartItem from "./CartItem";
import CartSkeleton from "./CartSkeleton";
import EmptyCart from "./EmptyCart";
import { useCart } from "../hooks/useCart";

function CartList() {
  const { data, isLoading, isError } = useCart();

  if (isLoading) {
    return <CartSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="py-[64px] text-center">
        <p className="text-[18px] text-[#666666]">
          Failed to load your cart. Please try again.
        </p>
      </div>
    );
  }

  if (data.items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div>
      {data.items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export default CartList;
