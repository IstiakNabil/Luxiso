import CartHeader from "@/features/cart/components/CartHeader";
import CartTableHeader from "@/features/cart/components/CartTableHeader";
import CartList from "@/features/cart/components/CartList";
import OrderSummary from "@/features/cart/components/OrderSummary";

function CartPage() {
  return (
    <div className="bg-[#F1E9DC]">
      <div className="mx-auto max-w-[1920px] px-6 py-[64px] md:px-[108px]">
        <CartHeader />
        <CartTableHeader />
        <CartList />
        <OrderSummary />
      </div>
    </div>
  );
}

export default CartPage;
