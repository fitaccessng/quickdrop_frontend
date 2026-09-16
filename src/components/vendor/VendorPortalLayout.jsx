import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { QuickDropLogo } from "../branding/QuickDropLogo";

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
    <div className="h-full bg-[linear-gradient(180deg,#fffaf4_0%,#fff4e8_40%,#f8fafc_100%)] text-slate-900 flex flex-col font-body selection:bg-[#ff9300] selection:text-white">
      
      {/* Decorative Background Glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-80 bg-[radial-gradient(circle_at_top,#ff9300_0%,rgba(255,147,0,0.1)_45%,transparent_80%)] opacity-60" />

      {/* Sticky Header Bar */}
      <header className="sticky top-0 z-40 border-b border-orange-100/60 bg-white/85 backdrop-blur-2xl shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-700 shadow-sm transition active:scale-95 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl border border-orange-100 p-1 bg-orange-50/50 shadow-sm shrink-0">
                <QuickDropLogo size={36} />
              </div>
              <div className="min-w-0">
                {eyebrow && (
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">
                    {eyebrow}
                  </p>
                )}
                <h1 className="truncate font-headline text-lg sm:text-xl font-black tracking-tight text-slate-950">
                  {title}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <div className="h-10 w-10 overflow-hidden rounded-2xl border border-orange-200 bg-orange-50 shadow-sm shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Vendor" className="h-full w-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 mx-auto max-w-6xl w-full px-4 pb-28 pt-6 sm:px-6 flex-1">
        {subtitle && (
          <section className="mb-6 rounded-[2.5rem] border border-orange-100/85 bg-white/90 px-6 py-5 shadow-[0_15px_35px_rgba(255,147,0,0.08)] backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#ff9300] shrink-0 animate-pulse" />
              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                {subtitle}
              </p>
            </div>
          </section>
        )}
        {children}
      </main>

      {/* Modern Floating Bottom Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/60 bg-white/95 px-3 pb-6 pt-3 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.06)]">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1.5 bg-slate-100/70 p-1.5 rounded-[2rem] border border-slate-200/60">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center rounded-[1.5rem] py-2.5 transition-all duration-200 ${
                  active 
                    ? "bg-[#ff9300] text-white shadow-md shadow-orange-500/25 scale-[1.02]" 
                    : "text-slate-400 hover:text-slate-700 hover:bg-white/50"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className={`mt-0.5 text-[9px] font-black uppercase tracking-wider ${active ? "text-white" : "text-slate-500"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};