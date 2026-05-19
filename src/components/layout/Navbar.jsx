import { Bell, ShoppingBag, User2 } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchNotificationUnreadCount } from "../../api/notifications";
import { useLogout } from "../../hooks/useLogout";
import { useSessionBootstrap } from "../../hooks/useSessionBootstrap";
import { formatMoney } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { QuickDropLogo } from "../branding/QuickDropLogo";

export const Navbar = () => {
  useSessionBootstrap();
  const navigate = useNavigate();
  const logout = useLogout();
  const user = useAuthStore((state) => state.user);
  const accountType = useAuthStore((state) => state.accountType);
  const cartItems = useCartStore((state) => state.items);
  const unreadQuery = useQuery({
    queryKey: ["notifications-unread-count", accountType, user?.id],
    queryFn: fetchNotificationUnreadCount,
    enabled: Boolean(user),
    refetchInterval: 10000,
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const unreadCount = unreadQuery.data?.unread_count ?? 0;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
          <QuickDropLogo size={40} showWordmark labelClassName="font-headline text-2xl font-bold text-slate-950" />
        </Link>
        
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className="text-sm font-medium text-slate-600 hover:text-black">Home</NavLink>
          <NavLink to="/categories" className="text-sm font-medium text-slate-600 hover:text-black">Categories</NavLink>
          <NavLink to="/about" className="text-sm font-medium text-slate-600 hover:text-black">About</NavLink>
        </nav>

        <div className="flex items-center gap-4">
          {/* Cart Preview (Optional visibility) */}
          {cartItems.length > 0 && (
            <div className="mr-2 hidden items-center gap-2 font-semibold text-slate-950 lg:flex">
              <ShoppingBag size={18} />
              <span className="text-sm">{formatMoney(cartTotal)}</span>
            </div>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/profile/notifications")}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200"
              >
                <Bell size={18} />
                {unreadCount ? (
                  <span className="absolute -right-1 -top-1 min-w-[1.1rem] rounded-full bg-[#ff9300] px-1.5 py-0.5 text-[10px] font-black text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>
              <button
                type="button"
                onClick={() => navigate(accountType === "vendor" ? "/vendor/dashboard" : accountType === "rider" ? "/rider/dashboard" : "/dashboard")}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors"
              >
                <User2 size={16} />
                {user.full_name ?? user.name}
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                type="button" 
                onClick={() => navigate("/login")} 
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-black"
              >
                Sign in
              </button>
              <button 
                type="button" 
                onClick={() => navigate("/signup")} 
                className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/5 transition-transform active:scale-95"
              >
                Get started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
