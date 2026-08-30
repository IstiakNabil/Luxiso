import { useNavigate, Link } from "react-router-dom";

function CartHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-baseline gap-6 lg:gap-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-[14px] text-[#6F4E37] hover:underline lg:text-[18px]"
        >
          Back
        </button>

        <h1 className="text-[24px] font-semibold leading-none lg:text-[40px]">
          Your Cart
        </h1>
      </div>

      <Link
        to="/shop"
        className="text-[14px] text-[#6F4E37] hover:underline lg:mt-2 lg:text-[18px]"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default CartHeader;
