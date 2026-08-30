import { FaApple, FaFacebookF, FaGoogle } from "react-icons/fa";

function SocialLogin() {
  return (
    <div className="flex justify-center gap-6">
      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D9D9D9] transition hover:bg-gray-50"
      >
        <FaApple size={22} />
      </button>

      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D9D9D9] transition hover:bg-gray-50"
      >
        <FaGoogle size={20} />
      </button>

      <button
        type="button"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D9D9D9] transition hover:bg-gray-50"
      >
        <FaFacebookF size={20} />
      </button>
    </div>
  );
}

export default SocialLogin;