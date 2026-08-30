import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

function EmptyCart() {
  return (
    <div className="flex flex-col items-center py-[96px] text-center">
      <ShoppingBag
        size={64}
        strokeWidth={1.2}
        className="text-[#B9A98F]"
      />

      <h2 className="mt-8 text-[28px] font-semibold">
        Your Cart Is Empty
      </h2>

      <p className="mt-4 max-w-[400px] text-[16px] leading-7 text-[#666666]">
        Looks like you haven't added anything yet. Explore
        the collection and find something you love.
      </p>

      <Link
        to="/shop"
        className="mt-10 inline-flex h-[52px] w-[240px] items-center justify-center bg-[#5B3A0E] text-white transition hover:opacity-90"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default EmptyCart;
