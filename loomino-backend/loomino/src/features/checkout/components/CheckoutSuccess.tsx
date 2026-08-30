import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

import type { CheckoutResponse } from "../types/checkout";

interface CheckoutSuccessProps {
  result: CheckoutResponse;
}

function CheckoutSuccess({ result }: CheckoutSuccessProps) {
  return (
    <div className="flex flex-col items-center px-6 py-[80px] text-center">
      <CheckCircle2
        size={72}
        strokeWidth={1.6}
        className="text-[#0E8A5F]"
      />

      <h1 className="mt-8 text-[40px] font-bold text-[#0E8A5F]">
        Payment Successful
      </h1>

      <p className="mt-8 max-w-[720px] text-[18px] leading-8 text-[#2B2B2B]">
        Thank you for choosing Loomino. Your order{" "}
        <span className="font-semibold">
          #{result.order_number}
        </span>{" "}
        will be generated based on your delivery request.
      </p>

      <p className="mt-4 text-[18px] text-[#2B2B2B]">
        The receipt has been sent to your email.
      </p>

      <p className="mt-10 text-[18px]">
        Please Contact Us For Any Query
      </p>

      <p className="mt-4 text-[16px]">+1 (929) 460-3208</p>
      <p className="mt-2 text-[16px]">OR</p>
      <p className="mt-2 text-[16px]">hello@loomino.com</p>

      <div className="mt-12 flex gap-4">
        <Link
          to="/orders"
          className="flex h-[52px] w-[200px] items-center justify-center bg-[#5B3A0E] text-white transition hover:opacity-90"
        >
          View My Orders
        </Link>

        <Link
          to="/shop"
          className="flex h-[52px] w-[200px] items-center justify-center border border-[#5B3A0E] text-[#5B3A0E] transition hover:bg-[#F1E9DC]"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default CheckoutSuccess;
