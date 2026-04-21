import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/vendor/dashboard", icon: "space_dashboard", label: "Dashboard" },
  { to: "/vendor/upload-product", icon: "box_add", label: "Upload" },
  { to: "/vendor/orders", icon: "shopping_bag", label: "Orders" },
  { to: "/vendor/analytics", icon: "monitoring", label: "Analytics" },
  { to: "/vendor/profile", icon: "person", label: "Profile" },
];

export const VendorPortalLayout = ({ title, eyebrow, subtitle, avatarUrl, children, actions }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fff4e8_35%,#ffffff_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(circle_at_top,#fdba74_0%,rgba(253,186,116,0.18)_38%,transparent_76%)]" />

      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition active:scale-95"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-[0.28em] text-[#ff9300]">{eyebrow}</p>
              <h1 className="truncate font-headline text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <div className="h-11 w-11 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm">
              {avatarUrl ? <img src={avatarUrl} alt="Vendor" className="h-full w-full object-cover" /> : null}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6">
        <section className="mb-8 rounded-[2rem] border border-white/80 bg-white/80 px-5 py-6 shadow-[0_30px_70px_-55px_rgba(15,23,42,0.8)] sm:px-7">
          <p className="max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{subtitle}</p>
        </section>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/70 bg-white/92 px-2 pb-5 pt-2 backdrop-blur-2xl">
        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center rounded-[1.2rem] px-2 py-3 transition ${
                  active ? "bg-[#fff4e6] text-[#ff9300]" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="mt-1 text-[9px] font-black uppercase tracking-[0.2em]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
