import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * VendorDashboard Component
 * Replaces the static product detail page with a dynamic vendor management interface.
 * Features: Responsive grid, tabbed navigation, and mobile-first bottom nav.
 */
export const VendorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Kinetic Branding & Styles
  const signatureGradient = "linear-gradient(135deg, #ff9300 0%, #ffb857 100%)";
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const stats = [
    { label: "Active Orders", value: "12", icon: "shopping_cart", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Sales", value: "R 420k", icon: "payments", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Products", value: "48", icon: "inventory_2", color: "text-[#ff9300]", bg: "bg-orange-50" },
  ];

  return (
    <div className="bg-[#f5f6f7] font-body text-slate-900 min-h-screen flex flex-col antialiased">
      
      {/* --- Dashboard Header --- */}
      <header className="p-6 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-5xl mx-auto w-full">
          <div>
            <h1 className="text-xl font-black tracking-tight font-headline">Vendor Center</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kinetic Marketplace</p>
          </div>
          <div className="flex gap-3">
            <button className="relative w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center transition-transform active:scale-95">
              <span className="material-symbols-outlined text-slate-600">notifications</span>
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
            </button>
            <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden border border-slate-300">
              <img 
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80" 
                alt="Vendor Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6 md:space-y-8 pb-32">
        
        {/* Quick Stats Grid - Responsive Column Handling */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-[1.5rem] border border-slate-200 shadow-sm transition-hover hover:shadow-md">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <span className="material-symbols-outlined text-xl" style={materialIconFill}>{stat.icon}</span>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Dynamic Section Switcher Card */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          {/* Internal Navigation Tabs */}
          <nav className="flex border-b border-slate-100 overflow-x-auto no-scrollbar scroll-smooth">
            {['Overview', 'Orders', 'Inventory', 'Upload'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.toLowerCase() 
                  ? 'text-[#ff9300] border-b-2 border-[#ff9300] bg-orange-50/30' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="p-6">
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Recent Activity</h3>
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#ff9300]">
                        <span className="material-symbols-outlined">package_2</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Order #KN-829{i}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Ready for pickup • 2 items</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-300 group-hover:text-[#ff9300] transition-colors">chevron_right</span>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Tab Content */}
            {activeTab === 'upload' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Product Name</label>
                  <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#ff9300]/20 focus:border-[#ff9300] outline-none transition-all" placeholder="Ex: Kinetic Wireless Charger" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Price (R)</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#ff9300]/20 focus:border-[#ff9300] outline-none" placeholder="0.00" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">Category</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-[#ff9300]/20 focus:border-[#ff9300] outline-none appearance-none cursor-pointer">
                      <option>Electronics</option>
                      <option>Fashion</option>
                      <option>Food</option>
                    </select>
                  </div>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-orange-50/50 hover:border-[#ff9300]/30 transition-all cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-[#ff9300] transition-colors">
                    <span className="material-symbols-outlined text-2xl">add_a_photo</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">Upload Product Images</p>
                </div>

                <button 
                  className="w-full py-5 rounded-2xl text-white font-black text-xs uppercase tracking-[0.25em] shadow-lg active:scale-[0.98] transition-all hover:brightness-105" 
                  style={{ background: signatureGradient }}
                >
                  Publish Product
                </button>
              </div>
            )}

            {/* Inventory Tab Content */}
            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-300">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="p-3 border border-slate-100 rounded-2xl bg-white shadow-sm flex gap-4 hover:border-orange-200 transition-colors">
                    <div className="w-20 h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                      <img src={`https://picsum.photos/seed/${item + 20}/200`} alt="Product" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-xs font-black text-slate-800 leading-tight mb-1 font-headline">Kinetic Item {item}</p>
                      <p className="text-sm font-bold text-[#ff9300]">R 12,500</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        <p className="text-[8px] font-black uppercase text-emerald-500 tracking-tighter">12 in stock</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Orders Tab Content */}
            {activeTab === 'orders' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Order History</h3>
                {[1, 2, 3, 4].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                        <span className="material-symbols-outlined" style={materialIconFill}>check_circle</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Order #KN-928{i}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Completed • 4 items • R 8,500</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Bottom Navigation (Mobile/Tablet Sticky) --- */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-2xl border-t border-slate-200 px-4 pt-4 pb-8 flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'overview' ? 'text-[#ff9300]' : 'text-slate-400'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'overview' ? materialIconFill : {}}>dashboard</span>
          <span className="text-[8px] font-black uppercase tracking-tighter">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'orders' ? 'text-[#ff9300]' : 'text-slate-400'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'orders' ? materialIconFill : {}}>receipt_long</span>
          <span className="text-[8px] font-black uppercase tracking-tighter">Orders</span>
        </button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'inventory' ? 'text-[#ff9300]' : 'text-slate-400'}`}
        >
          <span className="material-symbols-outlined" style={activeTab === 'inventory' ? materialIconFill : {}}>inventory</span>
          <span className="text-[8px] font-black uppercase tracking-tighter">Inventory</span>
        </button>
        <button 
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors" 
          onClick={() => navigate('/profile')}
        >
          <span className="material-symbols-outlined">storefront</span>
          <span className="text-[8px] font-black uppercase tracking-tighter">Store</span>
        </button>
      </nav>
    </div>
  );
};