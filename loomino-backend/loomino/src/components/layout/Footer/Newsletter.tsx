function Newsletter() {
  return (
    <div className="w-[390px]">
      <h3 className="text-[28px] font-medium text-white">
        Join Our Club, Get 15% Off Your Birthday
      </h3>

      <div className="mt-6 flex h-[52px] items-center border border-[#7A5B2E] px-5">
        <input
          type="email"
          placeholder="Enter Your Email Address"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#7A5B2E]"
        />

        <button className="text-[#7A5B2E]">
          →
        </button>
      </div>

      <label className="mt-5 flex items-start gap-3 text-sm leading-5 text-white">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4"
        />

        <span>
          By Submitting your email, you agree to receive
          advertising emails from Modimal.
        </span>
      </label>
    </div>
  );
}

export default Newsletter;