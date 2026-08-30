import { useNavigate, Link } from "react-router-dom";

function CartHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-baseline gap-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[18px] text-[#6F4E37] hover:underline"
        >
          Back
        </button>

        <h1 className="text-[40px] font-semibold leading-none">
          Your Cart
        </h1>
      </div>

      <Link
        to="/shop"
        className="mt-2 text-[18px] text-[#6F4E37] hover:underline"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default CartHeader;
