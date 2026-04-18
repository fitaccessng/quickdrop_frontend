import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";

/** * Mock API fetch - Replace with your actual: 
 * import { fetchUserProfile } from "../api/user"; 
 */
const fetchUserProfile = async () => ({
  name: "Julian Curator",
  email: "julian@kinetic.io",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
  tier: "Elite Member",
  stats: { orders: 24, rating: 4.9, points: "12k" }
});

export const ProfilePage = () => {
  const navigate = useNavigate();
  
  // Kinetic Branding Constants
  const signatureGradient = "linear-gradient(135deg, #ff9300 0%, #ffb857 100%)";
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });

  const settingsOptions = [
    {
      group: "Account",
      items: [
        { label: "Personal Information", icon: "person", color: "text-blue-500", bg: "bg-blue-50", path: "/profile/personal" },
        { label: "Change Password", icon: "lock", color: "text-emerald-500", bg: "bg-emerald-50", path: "/profile/security" },
        { label: "Order History", icon: "history", color: "text-orange-500", bg: "bg-orange-50", path: "/profile/orders" },
      ]
    },
    {
      group: "Preferences",
      items: [
        { label: "Notifications", icon: "notifications", color: "text-purple-500", bg: "bg-purple-50", path: "/profile/notifications" },
        { label: "Privacy & Security", icon: "shield", color: "text-rose-500", bg: "bg-rose-50", path: "/profile/security" },
      ]
    },
    {
      group: "Support",
      items: [
        { label: "Help Center", icon: "help", color: "text-cyan-500", bg: "bg-cyan-50", path: "/profile/help" },
        { label: "Terms of Service", icon: "description", color: "text-slate-400", bg: "bg-slate-50", path: "/profile/terms" },
      ]
    }
  ];

  if (isLoading) return <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center font-black text-[#ff9300] animate-pulse">LOADING PROFILE...</div>;

  return (
    <div className="bg-[#f5f6f7] font-body text-slate-900 min-h-screen pb-24 antialiased">
      
      {/* --- Profile Header Section --- */}
      <div className="relative h-72 w-full overflow-hidden bg-white">
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: signatureGradient }}
        />
        
        <header className="relative z-10 p-6 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200">
            <span className="material-symbols-outlined text-slate-600" style={materialIconFill}>settings</span>
          </button>
        </header>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src={user?.avatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[14px]" style={materialIconFill}>check</span>
            </div>
          </div>
          <h1 className="mt-3 text-xl font-black tracking-tight text-slate-800">{user?.name}</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user?.tier}</p>
        </div>
      </div>

      {/* --- Quick Stats Card --- */}
      <div className="px-6 -mt-10 relative z-20">
        <div className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/40 border border-white flex justify-around">
          <div className="text-center">
            <p className="text-lg font-black text-slate-800 tracking-tighter">{user?.stats.orders}</p>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Orders</p>
          </div>
          <div className="w-px h-8 bg-slate-100 self-center" />
          <div className="text-center">
            <p className="text-lg font-black text-[#ff9300] tracking-tighter">{user?.stats.rating}</p>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Rating</p>
          </div>
          <div className="w-px h-8 bg-slate-100 self-center" />
          <div className="text-center">
            <p className="text-lg font-black text-slate-800 tracking-tighter">{user?.stats.points}</p>
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Points</p>
          </div>
        </div>
      </div>

      {/* --- Settings Menu --- */}
      <main className="px-6 mt-8 space-y-8">
        {settingsOptions.map((group, idx) => (
          <section key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <h2 className="px-4 mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {group.group}
            </h2>
            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-200/60 shadow-sm">
              {group.items.map((item, itemIdx) => (
                <button 
                  key={itemIdx}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group ${itemIdx !== group.items.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-active:scale-90 transition-transform`}>
                      <span className="material-symbols-outlined text-xl" style={materialIconFill}>{item.icon}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{item.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-lg group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
              ))}
            </div>
          </section>
        ))}

        {/* --- Logout Action --- */}
        <div className="pt-0">
          <button className="w-full py-5 rounded-[2rem] bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-widest border border-rose-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout Account
          </button>
        </div>
        
       
      </main>
    </div>
  );
};