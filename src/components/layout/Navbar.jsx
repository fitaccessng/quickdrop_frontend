import { ShoppingBag, User2 } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { useSessionBootstrap } from "../../hooks/useSessionBootstrap";
import { formatMoney } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
// Import the image from your styles folder
import quickdropLogo from "../../styles/quickdrop.jpeg";

export const Navbar = () => {
  useSessionBootstrap();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accountType = useAuthStore((state) => state.accountType);
  const clearSession = useAuthStore((state) => state.clearSession);
  const cartItems = useCartStore((state) => state.items);

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
          <img 
  src="/styles/quickdrop.jpeg" 
  alt="QuickDrop Logo" 
  className="h-10 w-auto rounded-lg object-contain" 
/>
          <span className="text-xl font-bold tracking-tight text-slate-950">QuickDrop</span>
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
                onClick={() => navigate(accountType === "vendor" ? "/vendor/onboarding" : "/dashboard")}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-slate-200 transition-colors"
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