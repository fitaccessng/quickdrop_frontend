import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchRiderDashboard } from "../api/rider";
import { QuickDropLogo } from "../components/branding/QuickDropLogo";
import { formatMoney } from "../lib/utils";

export const RiderDashboardPage = () => {
  const { data: dashboard, isLoading } = useQuery({ 
    queryKey: ["rider-dashboard"], 
    queryFn: fetchRiderDashboard 
  });

  const [isOnline, setIsOnline] = useState(true);

  if (isLoading) return <div className="p-10 text-center font-black uppercase tracking-widest text-slate-400">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-['Plus_Jakarta_Sans'] selection:bg-orange-100">
      {/* Top Bar */}
      <header className="fixed top-0 w-full z-50 bg-[#f6f7f1]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <QuickDropLogo size={40} showWordmark labelClassName="font-headline text-2xl font-bold text-[#4e6300]" />
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm hover:opacity-80 transition-all active:scale-95">
            <span className="material-symbols-outlined text-[#5a5c58]">notifications</span>
          </button>
        </div>
      </header>

      <main className="pt-24 pb-48 px-6 max-w-2xl mx-auto space-y-8">
        
        {/* Status & Online Toggle */}
        <section className="flex items-center justify-between bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">Rider Status</h2>
            <p className="text-2xl font-black text-[#0A192F]">
              {isOnline ? "Available" : "Resting"}
            </p>
          </div>
          <div className="relative flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isOnline} 
                onChange={() => setIsOnline(!isOnline)} 
                className="sr-only peer" 
              />
              <div className="w-14 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-[#ff8c00]"></div>
              <span className="ms-3 text-xs font-black text-[#ff8c00] uppercase tracking-widest">
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </label>
          </div>
        </section>

        {/* Quick Access Menu - Bento Style */}
       

        {/* Earnings Bento Grid */}
        <section className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-8 bg-gradient-to-br from-[#0A192F] to-[#1e293b] p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60 mb-2">Today's Earnings</p>
              <h3 className="text-5xl font-black tracking-tighter mb-6">{formatMoney(dashboard?.today_earnings ?? 0)}</h3>
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                  <p className="text-[10px] uppercase font-black opacity-60">Deliveries</p>
                  <p className="text-xl font-black">{dashboard?.completed_deliveries ?? 0}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                  <p className="text-[10px] uppercase font-black opacity-60">Wallet</p>
                  <p className="text-xl font-black">{formatMoney(dashboard?.wallet_balance ?? 0)}</p>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[180px] opacity-10 rotate-12">payments</span>
          </div>
          
          <div className="col-span-12 md:col-span-4 bg-[#ff8c00] p-6 rounded-[2rem] flex flex-col justify-between shadow-lg shadow-orange-500/20">
            <div className="w-12 h-12 bg-[#0A192F] rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[#ff8c00]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <div>
              <h4 className="text-3xl font-black text-[#0A192F]">4.92</h4>
              <p className="text-xs font-bold text-[#0A192F]/70 uppercase tracking-widest">Rider Rating</p>
            </div>
          </div>
        </section>

 <section>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">Quick Actions</h3>
          <div className="grid grid-cols-4 gap-3">
            <QuickAction to="/rider/order-requests" icon="electric_moped" label="Ride Request" color="bg-orange-50 text-[#ff8c00]" />
            <QuickAction to="/rider/orders" icon="package_2" label="Orders" color="bg-blue-50 text-blue-600" />
            <QuickAction to="/rider/analytics" icon="bar_chart_4_bars" label="Analytics" color="bg-purple-50 text-purple-600" />
            <QuickAction to="/rider/profile" icon="person" label="Profile" color="bg-slate-100 text-slate-700" />
          </div>
        </section>
        {/* Current Delivery / Active Order */}
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-black tracking-tight text-[#0A192F]">Live Ride</h3>
            <Link to="/rider/order-requests" className="text-xs font-black text-[#ff8c00] uppercase tracking-widest hover:underline">
              View Requests ({dashboard?.pending_requests ?? 0})
            </Link>
          </div>

          {dashboard?.active_order ? (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-l-[12px] border-[#ff8c00] relative transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="inline-block bg-orange-100 text-[#ff8c00] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                    Active Delivery
                  </span>
                  <h4 className="text-2xl font-black text-[#0A192F] leading-tight">
                    {dashboard.active_order.vendor?.name}
                  </h4>
                  <p className="text-slate-500 font-medium mt-1">
                    To: {dashboard.active_order.customer?.full_name}
                  </p>
                </div>
                <p className="text-2xl font-black text-[#ff8c00]">
                  {formatMoney(dashboard.active_order.total_amount ?? 0)}
                </p>
              </div>
              
              <div className="flex items-center gap-6 text-slate-400 text-sm mb-8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">schedule</span>
                  <span className="font-bold">{dashboard.active_order.status.replace("_", " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">tag</span>
                  <span className="font-bold">{dashboard.active_order.order_reference}</span>
                </div>
              </div>

              <Link 
                to={`/rider/navigate/${dashboard.active_order.id}`}
                className="w-full flex items-center justify-center bg-[#0A192F] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
              >
                Start Navigation
              </Link>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">shopping_basket</span>
              <p className="text-slate-500 font-medium">No active deliveries. Ready for your next run?</p>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-white/90 backdrop-blur-2xl z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] border-t border-slate-100">
        <NavItem to="/rider/dashboard" icon="home" active />
        <NavItem to="/rider/wallet" icon="payments" />
        <NavItem to="/rider/orders" icon="receipt_long" />
        <NavItem to="/rider/profile" icon="person" />
      </nav>
    </div>
  );
};

const QuickAction = ({ to, icon, label, color }) => (
  <Link to={to} className="flex flex-col items-center group">
    <div className={`w-full aspect-square rounded-2xl flex items-center justify-center mb-2 transition-all group-active:scale-95 shadow-sm ${color}`}>
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <span className="text-[9px] font-black uppercase tracking-tighter text-slate-500 text-center leading-tight">
      {label}
    </span>
  </Link>
);

const NavItem = ({ to, icon, active = false }) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center rounded-full p-3 w-14 h-14 transition-all duration-300 ${
      active ? "bg-[#ff8c00] text-white scale-110 shadow-lg shadow-orange-500/40" : "text-slate-400 hover:text-[#0A192F]"
    }`}
  >
    <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
      {icon}
    </span>
  </Link>
);
