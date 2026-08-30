import { Outlet } from "react-router-dom";

import Breadcrumb from "@/components/common/Breadcrumb";
import AccountTabs from "@/features/profile/components/AccountTabs";

function AccountPage() {
  return (
    <div className="font-loomino min-h-[calc(100vh-110px)] bg-[#F0E6D8]">
      <div className="mx-auto max-w-[960px] px-5 md:px-10 py-[56px] lg:px-[108px]">
        <Breadcrumb
          items={[
            { label: "Home", to: "/" },
            { label: "My Account" },
          ]}
        />

        <h1 className="mt-6 text-[22px] font-semibold leading-[1.4] text-[#1F1210] lg:text-[32px]">
          My Account
        </h1>

        <div className="mt-8">
          <AccountTabs />

          <div className="mt-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
