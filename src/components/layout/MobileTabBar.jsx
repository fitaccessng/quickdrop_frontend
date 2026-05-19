import { Home, MapPinned, ShoppingCart, UserRound } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";

import { fetchNotificationUnreadCount } from "../../api/notifications";
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
  const userId = useAuthStore((state) => state.user?.id);
  const unreadCountQuery = useQuery({
    queryKey: ["notifications-unread-count", accountType, userId],
    queryFn: fetchNotificationUnreadCount,
    enabled: Boolean(token && accountType),
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  const unreadCount = unreadCountQuery.data?.unread_count ?? 0;

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
              <div className="relative">
                <Icon size={18} />
                {tab.label === "Account" && unreadCount > 0 ? (
                  <span className="absolute -right-2 -top-2 min-w-[1rem] rounded-full bg-[#ff9300] px-1 py-[1px] text-[8px] font-black text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </div>
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
