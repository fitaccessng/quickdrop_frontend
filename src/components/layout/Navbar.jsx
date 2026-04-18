import { ShoppingBag, User2 } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useSessionBootstrap } from "../../hooks/useSessionBootstrap";
import { formatMoney } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";

export const Navbar = () => {
  useSessionBootstrap();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accountType = useAuthStore((state) => state.accountType);
  const clearSession = useAuthStore((state) => state.clearSession);
  const cartItems = useCartStore((state) => state.items);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-extrabold tracking-tight text-black hover:text-white">
          QuickDrop
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className="text-sm text-black hover:text-blue">Home</NavLink>
          <NavLink to="/categories" className="text-sm text-black hover:text-blue">Categories</NavLink>
          <NavLink to="/about" className="text-sm text-black hover:text-blue">About</NavLink>
        </nav>
        <div className="flex items-center gap-3">
         
          {user ? (
            <>
              <button
                type="button"
                onClick={() => navigate(accountType === "vendor" ? "/vendor/onboarding" : "/dashboard")}
                className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white"
              >
                <User2 size={16} />
                {user.full_name ?? user.name}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearSession();
                  navigate("/login");
                }}
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => navigate("/login")} className="rounded-full bg-black px-4 py-2 text-sm text-white">
                Sign in
              </button>
              <button type="button" onClick={() => navigate("/signup")} className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                Get started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
