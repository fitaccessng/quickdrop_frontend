import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchUserOrders } from '../api/orders';
import { formatMoney } from '../lib/utils';

export const OrdersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Active');

  // Fetch orders from backend with real-time poll fallback
  const ordersQuery = useQuery({
    queryKey: ['user-orders'],
    queryFn: fetchUserOrders,
    refetchInterval: 12000,
    refetchOnWindowFocus: true,
  });

  const orders = ordersQuery.data || [];

  const filteredOrders = activeTab === 'Active' 
    ? orders.filter(o => ['pending', 'confirmed', 'preparing', 'rider_assigned', 'on_the_way'].includes(o.status)) 
    : orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const getStatusBadgeStyle = (status) => {
    if (['delivered'].includes(status)) {
      return 'bg-[#6ffbbe]/20 text-[#006847] border-[#6ffbbe]/30';
    }
    if (['cancelled'].includes(status)) {
      return 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]';
    }
    return 'bg-[#dae2fd] text-[#1d3354] border-[#dae2fd]';
  };

  const formatStatusText = (status) => {
    const map = {
      pending: "Processing",
      confirmed: "Confirmed",
      preparing: "Preparing",
      rider_assigned: "Rider Assigned",
      on_the_way: "On the way",
      delivered: "Delivered",
      cancelled: "Cancelled"
    };
    return map[status] || status;
  };

  return (
    <div className="bg-[#f7f9fb] font-sans text-[#191c1e] min-h-screen antialiased flex flex-col items-center">
      <div className="w-full max-w-xl min-h-screen flex flex-col bg-[#f7f9fb] relative">

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
            
            <h1 className="font-bold text-sm text-[#191c1e] uppercase tracking-wider">My Orders & History</h1>
            
            <button 
              onClick={() => navigate('/support')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] transition-colors"
              type="button"
              title="Support"
            >
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </button>
          </div>

          {/* Segmented Control / Tabs */}
          <div className="px-4 pb-4">
            <div className="bg-[#f2f4f6] p-1.5 rounded-2xl flex relative border border-[#e0e3e5]/50">
              <button 
                onClick={() => setActiveTab('Active')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 z-10 ${activeTab === 'Active' ? 'text-[#191c1e]' : 'text-[#565e74]'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveTab('History')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 z-10 ${activeTab === 'History' ? 'text-[#191c1e]' : 'text-[#565e74]'}`}
              >
                History
              </button>
              {/* Sliding Indicator */}
              <div className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out border border-[#e0e3e5]/40 ${activeTab === 'History' ? 'translate-x-full' : 'translate-x-0'}`}></div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full pt-36 pb-32 px-4 flex-1 space-y-4">
          {ordersQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <div className="w-10 h-10 border-4 border-[#e0e3e5] border-t-[#b80035] rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-[#565e74] uppercase tracking-wider">Syncing orders...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const isActiveOrder = ['pending', 'confirmed', 'preparing', 'rider_assigned', 'on_the_way'].includes(order.status);
              
              return (
                <div 
                  key={order.id} 
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#e0e3e5]/60 hover:shadow-md transition-shadow flex flex-col gap-4"
                >
                  {/* Order Top Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f2f4f6] border border-[#e0e3e5] flex-shrink-0 flex items-center justify-center">
                        {order.vendor?.logo_url ? (
                          <img src={order.vendor.logo_url} alt={order.vendor.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[#565e74]">storefront</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-bold text-sm text-[#191c1e] truncate">{order.vendor?.name || 'Store Merchant'}</h3>
                        <p className="text-[10px] text-[#565e74] font-medium mt-0.5">
                          {new Date(order.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(order.status)}`}>
                      {formatStatusText(order.status)}
                    </span>
                  </div>

                  {/* Items Summary Container */}
                  <div className="bg-[#f7f9fb] rounded-xl p-3.5 border border-[#e0e3e5]/40 flex flex-col gap-1">
                    <div className="flex justify-between items-baseline gap-2">
                      <p className="text-xs font-bold text-[#191c1e] line-clamp-1">
                        {order.items?.map(item => item.product_name).join(' • ') || 'Order items summary'}
                      </p>
                      <span className="font-extrabold text-sm text-[#191c1e] flex-shrink-0">{formatMoney(order.total_amount || 0)}</span>
                    </div>
                    <p className="text-[10px] font-mono text-[#565e74]">Ref: #{order.order_reference || order.id}</p>
                  </div>

                  {/* Action Buttons Bar */}
                  <div className="flex items-center gap-2 pt-1">
                    {isActiveOrder ? (
                      <button 
                        onClick={() => navigate(`/tracking/${order.id}`)}
                        className="flex-1 h-11 rounded-xl bg-[#e11d48] hover:bg-[#b80035] text-white flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest shadow-sm transition-all active:scale-[0.98]"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">local_shipping</span>
                        Track Order
                      </button>
                    ) : (
                      <button 
                        onClick={() => navigate(`/market`)}
                        className="flex-1 h-11 rounded-xl border border-[#e0e3e5] hover:bg-[#f2f4f6] text-[#191c1e] flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        Re-order
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/support?order=${order.id}`)}
                      className="w-11 h-11 rounded-xl bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] flex items-center justify-center transition-colors shadow-sm flex-shrink-0"
                      type="button"
                      title="Order Chat / Support"
                    >
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center pt-24 text-center px-6">
              <div className="w-16 h-16 bg-[#f2f4f6] rounded-full flex items-center justify-center mb-4 text-[#565e74] border border-[#e0e3e5]">
                <span className="material-symbols-outlined text-3xl">receipt_long</span>
              </div>
              <h3 className="font-bold text-base text-[#191c1e] mb-1">No Orders Found</h3>
              <p className="text-xs text-[#565e74] max-w-xs mb-6 leading-relaxed">
                You do not have any orders in this view yet. Explore the marketplace to place a new order.
              </p>
              <Link 
                to="/market" 
                className="px-6 py-3 rounded-2xl bg-[#e11d48] hover:bg-[#b80035] text-white text-xs font-bold uppercase tracking-widest shadow-sm transition-all active:scale-95"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </main>

        {/* Global Floating Bottom Navigation Bar */}
     

      </div>
    </div>
  );
};