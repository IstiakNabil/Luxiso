import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

interface CheckoutFailureProps {
  message?: string;
  onRetry: () => void;
}

function CheckoutFailure({
  message,
  onRetry,
}: CheckoutFailureProps) {
  return (
    <div className="flex flex-col items-center px-6 py-[80px] text-center">
      <AlertCircle
        size={72}
        strokeWidth={1.8}
        className="text-[#C62828]"
      />

      <h1 className="mt-8 text-[40px] font-bold text-[#C62828]">
        Sorry, Payment Failed
      </h1>

      <p className="mt-8 max-w-[820px] text-[18px] leading-8 text-[#2B2B2B]">
        {message ??
          "Unfortunately, your order cannot be completed."}{" "}
        Please review your details, or try a different
        payment method.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-12 h-[52px] w-[300px] bg-[#5B3A0E] text-white transition hover:opacity-90"
      >
        Try Again
      </button>

      <Link
        to="/orders"
        className="mt-6 flex items-center gap-2 text-[16px] text-[#5B3A0E] hover:underline"
      >
        <span aria-hidden>&lsaquo;</span> Back To My Orders
      </Link>
    </div>
  );
}

export default CheckoutFailure;
