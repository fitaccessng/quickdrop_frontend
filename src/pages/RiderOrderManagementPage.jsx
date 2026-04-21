import React, { useState } from "react"; // 1. Import useState
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRiderOrders, updateRiderOrder } from "../api/rider";
import { formatMoney } from "../lib/utils";

export const RiderOrderManagementPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 2. Add Tab State
  const [activeTab, setActiveTab] = useState("active"); 

  const ordersQuery = useQuery({ queryKey: ["rider-orders"], queryFn: fetchRiderOrders });

  const updateMutation = useMutation({
    mutationFn: updateRiderOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rider-wallet"] });
    },
  });

  const allOrders = ordersQuery.data ?? [];
  
  // 3. Logic to filter orders based on tab
  // "active" includes anything not delivered or cancelled
  // "history" includes delivered orders
  const filteredOrders = allOrders.filter((order) => {
    if (activeTab === "active") {
      return order.status !== "delivered" && order.status !== "cancelled";
    }
    return order.status === "delivered" || order.status === "cancelled";
  });

  const pendingCount = allOrders.filter(o => o.status === "rider_assigned").length;

  if (ordersQuery.isLoading) {
    return <div className="p-10 text-center font-black uppercase tracking-widest text-slate-400">Loading Orders...</div>;
  }

  return (
    <div className="min-h-screen bg-white pt-20 font-body antialiased text-slate-900">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-[#5a5c58] hover:bg-slate-50 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4e6300] hidden sm:block">location_on</span>
            <h1 className="text-lg font-black text-[#4e6300] tracking-tight uppercase">Quickdrop Rider</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-[#5a5c58] hover:text-[#ff8c00] transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="text-[#5a5c58] hover:opacity-80 transition-all">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-32 space-y-8">
        <section className="mb-10">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#3a5f94] uppercase mb-2">Logistics Portal</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0A192F]">Manage Orders</h2>
        </section>

        {/* 4. Functional Tabs */}
        <nav className="flex p-1 bg-slate-100 rounded-2xl mb-8">
          <button 
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === "active" 
              ? "bg-[#ff8c00] text-white shadow-sm" 
              : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Active ({pendingCount})
          </button>
          <button 
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              activeTab === "history" 
              ? "bg-[#ff8c00] text-white shadow-sm" 
              : "text-slate-400 hover:text-slate-600"
            }`}
          >
            History
          </button>
        </nav>

        <div className="space-y-6">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div key={order.id} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff8c00] mb-1 block">
                      {order.status.replaceAll("_", " ")}
                    </span>
                    <h3 className="text-xl font-black text-[#0A192F]">{order.order_reference}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-[#0A192F]">{formatMoney(order.total_amount)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Payout</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-[#ff8c00]">
                    <span className="material-symbols-outlined">person</span>
                  </div>
                  <div>
                    <p className="font-black text-[#0A192F]">{order.customer.full_name}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                      {order.vendor.name} • Standard Delivery
                    </p>
                  </div>
                </div>

                {/* Only show actions for active orders */}
                {activeTab === "active" && (
                  <div className="space-y-3 relative z-10">
                    <div className="flex gap-2">
                      {[
                        { status: "rider_assigned", label: "Assigned" },
                        { status: "on_the_way", label: "On Way" },
                        { status: "delivered", label: "Delivered" },
                      ].map((action) => (
                        <button
                          key={action.status}
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({
                              orderId: order.id,
                              status: action.status,
                              tracking_note: action.status === "delivered" ? "Delivered" : "Update",
                            })
                          }
                          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 ${
                            order.status === action.status 
                            ? "bg-[#0A192F] text-white" 
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                    
                    <Link 
                      to={`/rider/navigate/${order.id}`}
                      className="flex items-center justify-center gap-2 w-full py-4 bg-[#ff8c00] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">directions</span>
                      Start Navigation
                    </Link>
                  </div>
                )}
                
                {activeTab === "history" && (
                  <div className="relative z-10 p-4 bg-slate-50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed on {new Date().toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-400 font-bold">
              <span className="material-symbols-outlined text-4xl mb-2">reorder</span>
              <p>No {activeTab} orders found.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A192F] p-6 rounded-[2.5rem] text-white shadow-xl">
              <span className="material-symbols-outlined text-orange-500 mb-2">trending_up</span>
              <p className="text-2xl font-black">{allOrders.length}</p>
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-black">Total Loads</p>
            </div>
            <div className="bg-[#d5e3ff] p-6 rounded-[2.5rem] text-[#001b3c]">
              <span className="material-symbols-outlined mb-2">payments</span>
              <p className="text-2xl font-black">Live</p>
              <p className="text-[10px] uppercase tracking-widest opacity-60 font-black">Payout Ready</p>
            </div>
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-white/90 backdrop-blur-2xl z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-100">
        <NavItem to="/rider/dashboard" icon="home" />
        <NavItem to="/rider/wallet" icon="receipt_long" />
        <NavItem to="/rider/orders" icon="shopping_cart" active />
        <NavItem to="/rider/profile" icon="person" />
      </nav>
    </div>
  );
};

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