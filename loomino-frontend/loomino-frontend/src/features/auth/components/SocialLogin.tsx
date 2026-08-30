import { FaApple, FaFacebookF, FaGoogle } from "react-icons/fa";

function SocialLogin() {
  return (
    <div className="flex justify-center gap-4 lg:gap-6">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9D9D9] transition hover:bg-gray-50 lg:h-12 lg:w-12"
      >
        <FaApple size={22} />
      </button>

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9D9D9] transition hover:bg-gray-50 lg:h-12 lg:w-12"
      >
        <FaGoogle size={20} />
      </button>

      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#D9D9D9] transition hover:bg-gray-50 lg:h-12 lg:w-12"
      >
        <FaFacebookF size={20} />
      </button>
    </div>
  );
}

export default SocialLogin;