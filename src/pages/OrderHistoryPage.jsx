import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import { fetchUserOrders } from '../api/orders';

export const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => fetchUserOrders(),
  });

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'bg-emerald-50 text-emerald-600';
      case 'pending': return 'bg-orange-50 text-orange-600';
      case 'cancelled': return 'bg-rose-50 text-rose-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center font-black text-[#ff9300] animate-pulse">LOADING...</div>;

  return (
    <div className="bg-[#f5f6f7] font-body text-slate-900 min-h-screen pb-24 antialiased">
      {/* --- Header --- */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <h1 className="text-lg font-black text-slate-800">Order History</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* --- Content --- */}
      <main className="px-6 py-8 space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200/60 text-center">
            <span className="material-symbols-outlined text-6xl text-slate-300 block mb-3">shopping_bag</span>
            <p className="font-black text-slate-400 text-sm">No orders yet</p>
          </div>
        ) : (
          orders.map((order) => (
            <button
              key={order.id}
              onClick={() => navigate(`/tracking/${order.id}`)}
              className="w-full bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300 transition-all active:scale-[0.98] text-left"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-slate-800">Order #{order.id?.slice(0, 8)}</p>
                  <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-black rounded-full ${getStatusColor(order.status)}`}>
                  {order.status?.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">{order.items?.length || 0} items</p>
                <p className="font-black text-slate-800">R {order.total?.toLocaleString()}</p>
              </div>
            </button>
          ))
        )}
      </main>
    </div>
  );
};
