import { Home, MapPinned, ShoppingCart, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

const tabs = [
  { to: "/marketplace", label: "Home", icon: Home },
  { to: "/cart", label: "Cart", icon: ShoppingCart },
  { to: "/dashboard", label: "Orders", icon: MapPinned },
  { to: "/auth", label: "Account", icon: UserRound },
];

export const MobileTabBar = () => {
  const token = useAuthStore((state) => state.token);
  const accountType = useAuthStore((state) => state.accountType);

  const resolvedTabs = tabs.map((tab) =>
    tab.label === "Account"
      ? { ...tab, to: token ? (accountType === "vendor" ? "/vendor/onboarding" : "/dashboard") : "/auth" }
      : tab,
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-6 sm:pb-5">
      <div className="mx-auto grid max-w-md grid-cols-4 rounded-[1.6rem] border border-white/10 bg-base-900/90 p-2 shadow-glass backdrop-blur-xl">
        {resolvedTabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <NavLink
              key={tab.label}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-[1.1rem] px-2 py-2.5 text-[11px] font-medium transition ${
                  isActive ? "bg-white/10 text-white" : "text-base-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
