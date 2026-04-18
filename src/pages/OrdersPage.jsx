import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUserOrders } from '../api/orders';

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Active');

  // Design constants
  const signatureGradient = {
    background: 'linear-gradient(135deg, #b61321 0%, #ff7670 100%)',
  };

  const materialIconFill = {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
  };

  // Fetch orders from backend
  const ordersQuery = useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchUserOrders,
  });

  const orders = ordersQuery.data || [];

  const filteredOrders = activeTab === 'Active' 
    ? orders.filter(o => ['pending', 'confirmed', 'preparing', 'rider_assigned', 'on_the_way'].includes(o.status)) 
    : orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen pb-32">
      {/* Fixed Header */}
      <header className="bg-white/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-100">
        <div className="px-6 py-6 text-center">
          <h1 className="text-xl font-black font-headline tracking-tight uppercase">My Orders</h1>
        </div>

        {/* Segmented Control / Tabs */}
        <div className="px-6 pb-4">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex relative">
            <button 
              onClick={() => setActiveTab('Active')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 z-10 ${activeTab === 'Active' ? 'text-slate-900' : 'text-slate-400'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveTab('History')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 z-10 ${activeTab === 'History' ? 'text-slate-900' : 'text-slate-400'}`}
            >
              History
            </button>
            {/* Sliding Indicator */}
            <div className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out ${activeTab === 'History' ? 'translate-x-full' : 'translate-x-0'}`}></div>
          </div>
        </div>
      </header>

      <main className="pt-44 px-6">
        <div className="flex flex-col gap-6">
          {ordersQuery.isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-rose-600 rounded-full"></div>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-slate-100 active:scale-[0.98] transition-transform group">
                {/* Order Top Info */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-inner bg-slate-200">
                      {order.vendor?.logo_url && (
                        <img src={order.vendor.logo_url} alt={order.vendor.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-slate-900">{order.vendor?.name || 'Vendor'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tight">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border ${
                    ['pending', 'confirmed', 'preparing', 'rider_assigned', 'on_the_way'].includes(order.status)
                    ? 'bg-amber-50 text-amber-600 border-amber-100' 
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {order.status}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-50">
                   <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-bold text-slate-600">
                        {order.items?.map(item => item.product_name).join(' • ') || 'Order items'}
                      </p>
                      <span className="font-black text-slate-900 text-sm">${order.total_amount?.toFixed(2) || 0}</span>
                   </div>
                   <p className="text-[10px] text-slate-400 font-medium">Order ID: {order.order_reference}</p>
                </div>

                {/* Conditional Actions */}
                <div className="flex gap-3">
                  {['pending', 'confirmed', 'preparing', 'rider_assigned', 'on_the_way'].includes(order.status) ? (
                    <button 
                      onClick={() => navigate(`/tracking/${order.id}`)}
                      style={signatureGradient}
                      className="flex-grow h-12 rounded-xl flex items-center justify-center gap-2 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 active:scale-95 transition-transform"
                    >
                      <span className="material-symbols-outlined text-lg">local_shipping</span>
                      Track Order
                    </button>
                  ) : (
                    <button 
                      className="flex-grow h-12 rounded-xl border-2 border-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-transform"
                    >
                      Re-order
                    </button>
                  )}
                  <button className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center active:scale-95 transition-transform">
                    <span className="material-symbols-outlined">chat_bubble</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center pt-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <span className="material-symbols-outlined text-4xl">receipt_long</span>
              </div>
              <h3 className="font-black text-slate-900">No Orders Yet</h3>
              <p className="text-sm text-slate-400 font-medium text-center px-10">Hungry? Your next favorite meal is just a few taps away.</p>
              <Link to="/market" style={signatureGradient} className="mt-6 px-8 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform">
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-8 pt-4 bg-white/95 backdrop-blur-2xl border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <Link to="/dashboard" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">home</span>
          <span className="text-[10px] font-black uppercase mt-1">Home</span>
        </Link>
        <Link to="/market" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">storefront</span>
          <span className="text-[10px] font-black uppercase mt-1">Market</span>
        </Link>
        <button onClick={() => navigate('/ride')} className="flex flex-col items-center text-slate-400 group flex-1 hover:text-rose-600 transition-colors">
          <span className="material-symbols-outlined text-2xl">two_wheeler</span>
          <span className="text-[10px] font-black uppercase mt-1">Ride</span>
        </button>
        <Link to="/orders" className="flex flex-col items-center text-rose-600 flex-1">
          <span className="material-symbols-outlined text-2xl" style={materialIconFill}>receipt_long</span>
          <span className="text-[10px] font-black uppercase mt-1">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">person</span>
          <span className="text-[10px] font-black uppercase mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};
