import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";
import { QuickDropLogo } from "../branding/QuickDropLogo";

export const RiderShell = ({ title, subtitle, children, active = "dashboard", back = false }) => {
  const navigate = useNavigate();
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const markOffline = () => {
      if (!token) return;
      fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}/rider/me/profile`, {
        method: "PUT",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rider_status: "offline" }),
      }).catch(() => {});
    };

    window.addEventListener("pagehide", markOffline);
    window.addEventListener("beforeunload", markOffline);
    return () => {
      window.removeEventListener("pagehide", markOffline);
      window.removeEventListener("beforeunload", markOffline);
    };
  }, [token]);

  return (
    <div className={`min-h-screen pb-28 ${theme === "dark" ? "bg-slate-950 text-slate-50" : "bg-[#f7f6f1] text-slate-900"}`}>
      <header className={`sticky top-0 z-40 px-5 py-4 backdrop-blur-xl ${theme === "dark" ? "border-b border-slate-800 bg-slate-950/90" : "border-b border-white/60 bg-[#f7f6f1]/90"}`}>
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            {back ? (
              <button
                onClick={() => navigate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">arrow_back_ios_new</span>
              </button>
            ) : null}
            <div className="flex items-center gap-3">
              <QuickDropLogo size={44} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">Rider Hub</p>
                <h1 className="font-headline text-2xl font-extrabold tracking-tight">{title}</h1>
                {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="rounded-2xl bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 shadow-sm">
              {theme === "dark" ? "Light" : "Dark"}
            </button>
            <Link to="/rider/wallet" className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-black uppercase tracking-widest text-white">
              Wallet
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pt-6">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/70 bg-white/95 px-3 pb-7 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          <RiderNavLink to="/rider/dashboard" label="Home" icon="home" active={active === "dashboard"} />
          <RiderNavLink to="/rider/order-requests" label="Requests" icon="notifications_active" active={active === "requests"} />
          <RiderNavLink to="/rider/analytics" label="Insights" icon="insights" active={active === "analytics"} />
          <RiderNavLink to="/rider/orders" label="Orders" icon="local_shipping" active={active === "orders"} />
          <RiderNavLink to="/rider/wallet" label="Wallet" icon="account_balance_wallet" active={active === "wallet"} />
          <RiderNavLink to="/rider/profile" label="Profile" icon="person" active={active === "profile"} />
        </div>
      </nav>
    </div>
  );
};

const RiderNavLink = ({ to, label, icon, active }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 ${active ? "text-[#ff9300]" : "text-slate-400"}`}>
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </Link>
);
