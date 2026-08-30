import CartHeader from "@/features/cart/components/CartHeader";
import CartTableHeader from "@/features/cart/components/CartTableHeader";
import CartList from "@/features/cart/components/CartList";
import OrderSummary from "@/features/cart/components/OrderSummary";

function CartPage() {
  return (
    <div className="bg-[#F1E9DC]">
      <div className="mx-auto max-w-[1920px] px-5 py-10 md:px-10 lg:px-[108px] lg:py-[64px]">
        <CartHeader />
        <CartTableHeader />
        <CartList />
        <OrderSummary />
      </div>
    </div>
  );
}

export default CartPage;
