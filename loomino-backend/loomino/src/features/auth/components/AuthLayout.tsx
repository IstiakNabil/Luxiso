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
    <div className="mx-auto max-w-[1920px] px-[108px] py-[40px]">
      <div className="flex items-center justify-between gap-[108px]">
        {/* Left Side */}
        <div className="h-[726px] w-[600px]">
          {image}
        </div>

        {/* Right Side */}
        <div className="flex h-[726px] w-[392px] items-center justify-center">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;