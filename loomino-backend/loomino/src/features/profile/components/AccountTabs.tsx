import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/account/profile", label: "Profile" },
  { to: "/account/password", label: "Password" },
  { to: "/account/addresses", label: "Addresses" },
];

function AccountTabs() {
  return (
    <nav className="flex gap-1 border-b border-[#CBCBCB]">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) =>
            `-mb-px border-b-2 px-6 py-4 text-[16px] transition ${
              isActive
                ? "border-[#4C300D] font-semibold text-[#0C0C0C]"
                : "border-transparent text-[#606060] hover:text-[#0C0C0C]"
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
