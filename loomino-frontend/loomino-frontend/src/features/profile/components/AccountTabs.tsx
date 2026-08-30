import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/account/profile", label: "Profile" },
  { to: "/account/password", label: "Password" },
  { to: "/account/addresses", label: "Addresses" },
];

function AccountTabs() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-[#CBCBCB] scrollbar-hide">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `-mb-px border-b-2 px-6 py-4 text-[16px] transition ${
              isActive
                ? "border-[#8A6A2E] font-semibold text-[#1F1210]"
                : "border-transparent text-[#606060] hover:text-[#1F1210]"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AccountTabs;
