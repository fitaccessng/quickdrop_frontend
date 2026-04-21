import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { fetchRiderAnalytics } from "../api/rider";
import { formatMoney } from "../lib/utils";

export const RiderAnalyticsPage = () => {
  const navigate = useNavigate();
  const { data: analytics, isLoading } = useQuery({ 
    queryKey: ["rider-analytics"], 
    queryFn: fetchRiderAnalytics 
  });
  
  if (isLoading) return <div className="p-10 text-center font-black uppercase tracking-widest text-slate-400">Scanning Records...</div>;

  // Chart calculation logic
  const chartMax = Math.max(
    ...(analytics?.weekly_earnings?.map((item) => Number(item.amount)) || [1]), 
    1
  );

  return (
    <div className="min-h-screen bg-white pt-20 font-body antialiased text-slate-900">
      {/* Fixed Header */}
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-[#5a5c58] hover:bg-slate-50 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-[#4e6300] tracking-tight uppercase">Quickdrop Rider</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-[#5a5c58] transition-all shadow-sm">
            <span className="material-symbols-outlined">analytics</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-32 space-y-8">
        {/* Page Title */}
        <section className="mb-10">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#3a5f94] uppercase mb-2">Performance Tracking</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0A192F]">Insights & Analytics</h2>
        </section>

        {/* Top Highlight Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-gradient-to-br from-[#904d00] to-[#ff8c00] p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[240px]">
            <div className="relative z-10">
              <span className="text-sm font-semibold opacity-80 mb-1 block">Accumulated Earnings</span>
              <h3 className="text-5xl font-black mb-2">{formatMoney(analytics?.total_earnings ?? 0)}</h3>
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Lifetime Revenue</p>
            </div>
            <div className="relative z-10 flex gap-3">
               <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                 Top 1% Rider Status
               </span>
            </div>
            <span className="material-symbols-outlined absolute -right-8 -bottom-8 text-[160px] opacity-10 rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>
              monitoring
            </span>
          </div>

          {/* Side Metric (Completion) */}
          <div className="bg-[#001b3c] p-8 rounded-[2.5rem] text-white flex flex-col justify-center shadow-lg">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Completion Rate</span>
            <p className="text-4xl font-black text-[#ff8c00] mb-4">
              {Math.round(analytics?.delivery_completion_rate ?? 0)}%
            </p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#ff8c00] transition-all duration-1000" 
                style={{ width: `${analytics?.delivery_completion_rate ?? 0}%` }}
              ></div>
            </div>
            <p className="text-[10px] mt-4 font-bold text-white/40 uppercase tracking-widest">Excellent Performance</p>
          </div>
        </div>

        {/* Small Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricSmall icon="local_shipping" label="Total Drops" value={analytics?.total_deliveries ?? 0} />
          <MetricSmall icon="star" label="Avg Rating" value="4.9" />
          <MetricSmall icon="schedule" label="Today" value={formatMoney(analytics?.today_earnings ?? 0)} />
          <MetricSmall icon="distance" label="KM Covered" value="1,240" />
        </div>

        {/* Earnings Chart Section */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-[#0A192F]">Weekly Trend</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivery Volume (Last 7 Days)</p>
            </div>
            <button className="bg-slate-50 px-4 py-2 rounded-full text-[10px] font-black text-[#3a5f94] flex items-center gap-2 uppercase tracking-widest border border-slate-100 hover:bg-slate-100 transition-all">
              Filter <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>

          {/* Bar Chart Container */}
          <div className="flex items-end justify-between h-56 px-2 gap-4">
            {(analytics?.weekly_earnings ?? []).map((item) => {
              const heightPercentage = Math.max((Number(item.amount) / chartMax) * 100, 8);
              return (
                <div key={item.day} className="flex flex-col items-center flex-1 gap-4 group">
                  <div className="w-full bg-slate-50 rounded-2xl h-full relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                    <div 
                      className="absolute inset-x-0 bottom-0 bg-[#ff8c00] rounded-2xl transition-all duration-700 ease-out group-hover:brightness-110 shadow-[0_-4px_12px_rgba(255,140,0,0.2)]"
                      style={{ height: `${heightPercentage}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0A192F] text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatMoney(Number(item.amount))}
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.day}</span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Consistent Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-white/90 backdrop-blur-2xl z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] border-t border-slate-100">
        <NavItem to="/rider/dashboard" icon="home" />
        <NavItem to="/rider/wallet" icon="payments" />
        <NavItem to="/rider/analytics" icon="insights" active />
        <NavItem to="/rider/profile" icon="person" />
      </nav>
    </div>
  );
};

const MetricSmall = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
    <span className="material-symbols-outlined text-[#ff8c00] mb-3 text-xl">{icon}</span>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xl font-black text-[#0A192F]">{value}</p>
  </div>
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