import React from "react";
import { Link, useLocation } from "react-router-dom";

import { useUiStore } from "../../store/uiStore";
import { QuickDropLogo } from "../branding/QuickDropLogo";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/admin/vendors", label: "Vendors", icon: "storefront" },
  { to: "/admin/categories", label: "Categories", icon: "category" },
  { to: "/admin/delivery-pricing", label: "Delivery Pricing", icon: "local_shipping" },
  { to: "/admin/orders", label: "Orders", icon: "receipt_long" },
  { to: "/admin/users", label: "Users", icon: "groups" },
  { to: "/admin/riders", label: "Riders", icon: "two_wheeler" },
  { to: "/admin/profile", label: "Settings", icon: "settings" },
];

export const AdminShell = ({ title, subtitle, children }) => {
  const location = useLocation();
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-slate-950 text-slate-50" : "bg-[#f4f1ea] text-slate-900"}`}>
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[250px_1fr]">
        <aside className={`rounded-[2rem] p-5 shadow-xl ${theme === "dark" ? "bg-slate-900 text-white" : "bg-slate-900 text-white"}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">Admin Console</p>
          <div className="mt-3">
            <QuickDropLogo size={52} showWordmark label="QuickDrop Control" labelClassName="font-headline text-2xl text-white" />
          </div>
          <button onClick={toggleTheme} className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-white">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <nav className="mt-8 space-y-2">
            {items.map((item) => {
              const active = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold ${
                    active ? "bg-white text-slate-900" : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className={`rounded-[2rem] border px-6 py-5 shadow-sm ${theme === "dark" ? "border-slate-800 bg-slate-900" : "border-slate-200/70 bg-white"}`}>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">Operations</p>
            <h2 className="mt-2 font-headline text-3xl font-extrabold">{title}</h2>
            {subtitle ? <p className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>{subtitle}</p> : null}
          </header>
          <main className="mt-6">{children}</main>
        </section>
      </div>
    </div>
  );
};
