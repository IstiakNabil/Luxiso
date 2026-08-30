import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="flex flex-col items-center px-6 py-[120px] text-center">
      <p className="text-[72px] font-semibold leading-none text-[#5B3A0E]">
        404
      </p>

      <h1 className="mt-6 text-[28px] font-semibold">
        Page Not Found
      </h1>

      <p className="mt-4 max-w-[400px] text-[16px] leading-7 text-[#666666]">
        The page you're looking for doesn't exist or has
        been moved.
      </p>

      <Link
        to="/"
        className="mt-10 inline-flex h-[52px] w-[240px] items-center justify-center bg-[#5B3A0E] text-white transition hover:opacity-90"
      >
        Back To Home
      </Link>
    </div>
  );
}

export default NotFoundPage;
