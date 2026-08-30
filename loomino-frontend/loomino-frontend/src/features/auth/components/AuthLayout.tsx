import type { ReactNode } from "react";

interface AuthLayoutProps {
  image: ReactNode;
  children: ReactNode;
}

function AuthLayout({
  image,
  children,
}: AuthLayoutProps) {
  return (
    <div className="mx-auto max-w-[1920px] px-5 py-8 md:px-10 lg:px-[108px] lg:py-[40px]">
      <div className="flex items-center justify-between gap-8 lg:gap-[108px]">
        {/* Left Side */}
        <div className="hidden h-[726px] w-[600px] lg:block">
          {image}
        </div>

        {/* Right Side */}
        <div className="flex w-full items-center justify-center lg:h-[726px] lg:w-[392px]">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;