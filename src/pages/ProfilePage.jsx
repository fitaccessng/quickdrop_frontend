import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";

import { fetchProfile } from '../api/auth';
import { fetchUserOrders } from '../api/orders';
import { useLogout } from '../hooks/useLogout';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const logout = useLogout();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchUserOrders,
  });

  const totalSpend = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const profileStats = {
    orders: orders.length,
    rating: orders.length ? '4.9' : '5.0',
    points: `${Math.round(totalSpend)}`,
  };

  const settingsOptions = [
    {
      group: "Account Settings",
      items: [
        { label: "Personal Information", icon: "person", color: "text-blue-600", bg: "bg-blue-50", path: "/profile/personal" },
        { label: "Change Password & Security", icon: "lock", color: "text-emerald-600", bg: "bg-emerald-50", path: "/profile/security" },
        { label: "Order History", icon: "history", color: "text-orange-600", bg: "bg-orange-50", path: "/orders" },
      ]
    },
    {
      group: "Preferences",
      items: [
        { label: "Notifications", icon: "notifications", color: "text-purple-600", bg: "bg-purple-50", path: "/profile/notifications" },
        { label: "Privacy & Data", icon: "shield", color: "text-[#e11d48]", bg: "bg-[#ffdad6]/30", path: "/profile/security" },
      ]
    },
    {
      group: "Support & Legal",
      items: [
        { label: "Help Center & Support", icon: "help", color: "text-cyan-600", bg: "bg-cyan-50", path: "/support" },
        { label: "Terms of Service", icon: "description", color: "text-[#565e74]", bg: "bg-[#f2f4f6]", path: "/profile/terms" },
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="bg-[#f7f9fb] font-sans text-[#191c1e] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#e0e3e5] border-t-[#e11d48] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#565e74]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] font-sans text-[#191c1e] min-h-screen antialiased flex flex-col items-center">
      <div className="w-full max-w-xl min-h-screen flex flex-col bg-[#f7f9fb] relative pb-32">

        {/* Fixed Header */}
        <header className="fixed top-0 w-full max-w-xl z-50 bg-white/90 backdrop-blur-xl border-b border-[#e0e3e5]/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-4 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] transition-colors" 
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="font-bold text-sm text-[#191c1e] uppercase tracking-wider">Account Profile</h1>
            <button 
              onClick={() => navigate('/support')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] transition-colors"
              type="button"
              title="Support"
            >
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full pt-20 px-4 space-y-4 flex-1">
          
          {/* User Profile Card Header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e0e3e5]/60 flex flex-col items-center text-center">
            <div className="relative mb-3">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#f2f4f6] border border-[#e0e3e5] shadow-sm">
                <img
                  src={user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#006847] border-2 border-white rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]">check</span>
              </div>
            </div>
            
            <h2 className="font-bold text-base text-[#191c1e]">{user?.full_name || 'Valued User'}</h2>
            <p className="text-xs text-[#565e74] mt-0.5">{user?.email || 'customer@account.com'}</p>
            <span className="mt-2 inline-block px-3 py-0.5 rounded-full bg-[#f2f4f6] text-[#565e74] text-[10px] font-bold uppercase tracking-wider border border-[#e0e3e5]">
              Verified Account
            </span>
          </div>

          {/* Key Stats Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e0e3e5]/60 flex justify-around items-center">
            <div className="text-center flex-1">
              <p className="text-base font-extrabold text-[#191c1e]">{profileStats.orders}</p>
              <p className="text-[10px] font-bold uppercase text-[#565e74] tracking-wider mt-0.5">Orders</p>
            </div>
            <div className="w-px h-8 bg-[#eceef0]"></div>
            <div className="text-center flex-1">
              <p className="text-base font-extrabold text-[#e11d48]">{profileStats.rating}</p>
              <p className="text-[10px] font-bold uppercase text-[#565e74] tracking-wider mt-0.5">Rating</p>
            </div>
            <div className="w-px h-8 bg-[#eceef0]"></div>
            <div className="text-center flex-1">
              <p className="text-base font-extrabold text-[#191c1e]">{profileStats.points}</p>
              <p className="text-[10px] font-bold uppercase text-[#565e74] tracking-wider mt-0.5">Points</p>
            </div>
          </div>

          {/* Navigation & Settings Sections */}
          <div className="space-y-4">
            {settingsOptions.map((group, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-[#e0e3e5]/60 shadow-sm">
                <div className="px-4 py-2.5 bg-[#f7f9fb] border-b border-[#e0e3e5]/40">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#565e74]">
                    {group.group}
                  </h3>
                </div>
                <div className="divide-y divide-[#eceef0]/60">
                  {group.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center justify-between p-4 hover:bg-[#f2f4f6]/60 transition-colors group text-left"
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center ${item.color} flex-shrink-0 transition-transform group-active:scale-95`}>
                          <span className="material-symbols-outlined text-lg">{item.icon}</span>
                        </div>
                        <span className="text-xs font-bold text-[#191c1e]">{item.label}</span>
                      </div>
                      <span className="material-symbols-outlined text-[#565e74] text-lg group-hover:translate-x-0.5 transition-transform">
                        chevron_right
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Logout Action */}
          <div className="pt-2">
            <button
              onClick={() => logout("/login")}
              className="w-full h-12 rounded-xl bg-[#ffdad6] hover:bg-[#ffb4ab] text-[#ba1a1a] font-bold text-xs uppercase tracking-widest border border-[#ffdad6] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout Account
            </button>
          </div>

        </main>

      

      </div>
    </div>
  );
};