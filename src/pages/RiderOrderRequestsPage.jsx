import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Map, Marker } from "pigeon-maps";
import { acceptRiderOrder, fetchRiderOrderRequests } from "../api/rider";
import { formatMoney } from "../lib/utils";

export const RiderOrderRequestsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Mock center for the map - in a real app, use navigator.geolocation
  const riderLocation = [6.4474, 3.4723];

  const requestsQuery = useQuery({ 
    queryKey: ["rider-order-requests"], 
    queryFn: fetchRiderOrderRequests 
  });

  const acceptMutation = useMutation({
    mutationFn: acceptRiderOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-order-requests"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
      navigate("/rider/orders");
    },
  });

  const requests = requestsQuery.data ?? [];

  return (
    <div className="min-h-screen bg-white pt-20 font-body antialiased text-slate-900">
      {/* Header - Maintaining your original style */}
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
          <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-[#5a5c58] hover:text-[#ff8c00] transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-32 space-y-6">
        {/* Map Container - Bento Box Style */}
        <section className="relative h-[400px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
          <Map 
            height={400} 
            defaultCenter={riderLocation} 
            defaultZoom={14}
            metaWheelZoom={true}
          >
            {/* Rider Pulse Marker - Maintaining your bike icon */}
            <Marker anchor={riderLocation}>
              <div className="relative flex items-center justify-center">
                <div className="absolute w-12 h-12 bg-orange-500/30 rounded-full animate-ping"></div>
                <div className="relative w-10 h-10 bg-[#0A192F] rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    electric_moped
                  </span>
                </div>
              </div>
            </Marker>

            {/* Dynamic Pickup Markers based on requests */}
            {requests.map((req, idx) => (
              <Marker key={req.id} anchor={[6.4520 + (idx * 0.002), 3.4800 + (idx * 0.002)]}>
                <div className="bg-white px-3 py-1.5 rounded-xl shadow-xl border border-slate-100 flex items-center gap-2 animate-bounce">
                  <span className="material-symbols-outlined text-[#ff8c00] text-sm">shopping_bag</span>
                  <span className="text-[9px] font-black uppercase">Order</span>
                </div>
              </Marker>
            ))}
          </Map>

          {/* Floating Radar Stats */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-5 py-3 rounded-3xl shadow-xl border border-white/20">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Active Radar</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-black text-[#0A192F]">
                  {requests.length} Requests Nearby
                </span>
              </div>
            </div>
            
            <button className="pointer-events-auto w-12 h-12 bg-white text-[#0A192F] rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all">
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>
        </section>

        {/* Requests List */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-[#0A192F] tracking-tight">Available Jobs</h3>
            <span className="text-[10px] font-black text-[#ff8c00] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
              Live updates
            </span>
          </div>
          
          {requests.length > 0 ? (
            requests.map((order) => (
              <div key={order.id} className="bg-[#f9f9f9] p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#ff8c00]">
                    <span className="material-symbols-outlined text-3xl">restaurant</span>
                  </div>
                  <div>
                    <h4 className="font-black text-[#0A192F] leading-tight">{order.vendor?.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                      {order.order_reference} • 2.4km away
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-[#0A192F] mb-2">{formatMoney(order.total_amount)}</p>
                  <button 
                    disabled={acceptMutation.isPending}
                    onClick={() => acceptMutation.mutate({ orderId: order.id })}
                    className="text-[10px] font-black uppercase bg-[#0A192F] text-white px-5 py-2.5 rounded-2xl hover:bg-[#ff8c00] transition-colors disabled:opacity-50"
                  >
                    {acceptMutation.isPending ? "..." : "Accept"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">radar</span>
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Scanning for orders...</p>
            </div>
          )}
        </section>
      </main>

      {/* Navigation - Consistent with other pages */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-white/90 backdrop-blur-2xl z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] border-t border-slate-100">
        <NavItem to="/rider/dashboard" icon="home" />
        <NavItem to="/rider/wallet" icon="payments" />
        <NavItem to="/rider/orders" icon="receipt_long" active />
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