import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchOrderTracking } from "../api/orders";
import { LiveRiderMap } from "../components/tracking/LiveRiderMap";

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const trackingQuery = useQuery({
    queryKey: ["tracking", id],
    queryFn: () => fetchOrderTracking(id),
    enabled: Boolean(id),
    refetchInterval: 12000,
  });

  const orderData = trackingQuery.data;
  const isLoading = trackingQuery.isLoading;
  const isError = trackingQuery.isError;

  // Design Constants
  const signatureGradient = "linear-gradient(135deg, #b61321 0%, #ff7670 100%)";
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  // Get status display text
  const getStatusText = (status) => {
    // Order status mapping
    const orderStatusMap = {
      pending: "Processing",
      confirmed: "Confirmed",
      preparing: "Preparing",
      rider_assigned: "Assigned",
      on_the_way: "On the way",
      delivered: "Delivered",
      cancelled: "Cancelled"
    };
    
    // Ride status mapping
    const rideStatusMap = {
      searching: "Finding Rider",
      accepted: "Rider Accepted",
      en_route: "On the way",
      arrived: "Arrived",
      completed: "Completed",
      cancelled: "Cancelled"
    };
    
    // Check if it's a ride or order
    const isRide = orderData?.vehicle_type !== undefined;
    const statusMap = isRide ? rideStatusMap : orderStatusMap;
    
    return statusMap[status] || status;
  };

  // Get timeline index based on status
  const getTimelineIndex = (status) => {
    const isRide = orderData?.vehicle_type !== undefined;
    
    if (isRide) {
      // Ride timeline
      const rideStatusOrder = {
        searching: 0,
        accepted: 1,
        en_route: 2,
        arrived: 3,
        completed: 4,
        cancelled: 0
      };
      return rideStatusOrder[status] || 0;
    } else {
      // Order timeline
      const orderStatusOrder = {
        pending: 0,
        confirmed: 1,
        preparing: 2,
        rider_assigned: 3,
        on_the_way: 3,
        delivered: 4,
        cancelled: 0
      };
      return orderStatusOrder[status] || 0;
    }
  };

  // Get timeline steps based on type
  const getTimelineSteps = () => {
    const isRide = orderData?.vehicle_type !== undefined;
    if (isRide) {
      return ['Searching', 'Accepted', 'En Route', 'Arrived', 'Completed'];
    } else {
      return ['Order Received', 'Confirmed', 'Preparing', 'On the way', 'Delivered'];
    }
  };

  // Get timeline icon based on step
  const getTimelineIcon = (idx, isRide) => {
    if (isRide) {
      const rideIcons = ['schedule', 'check_circle', 'two_wheeler', 'location_on', 'home'];
      return rideIcons[idx] || 'check';
    } else {
      return idx < getTimelineIndex(orderData?.status) ? 'check' : 
             idx === 2 ? 'restaurant' : 
             idx === 3 ? 'local_shipping' : 
             idx === 4 ? 'home_pin' : 'receipt_long';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 font-body text-slate-900 min-h-screen flex items-center justify-center pb-32">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-200 border-t-rose-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-slate-50 font-body text-slate-900 min-h-screen flex items-center justify-center pb-32">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto text-red-300">
            <span className="material-symbols-outlined text-4xl">error_outline</span>
          </div>
          <p className="text-slate-400 font-bold mb-4">Unable to load order details</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-lg bg-slate-900 text-white font-bold text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <span className="material-symbols-outlined text-rose-700">arrow_back</span>
          </button>
          <h1 className="text-xl font-black font-headline tracking-tight text-rose-700 uppercase">
            {orderData?.vehicle_type ? 'Track Ride' : 'Track Order'}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-rose-700">help_outline</span>
        </div>
      </header>

      <main className="relative pt-16">
        <LiveRiderMap
          latitude={orderData?.tracking_latitude}
          longitude={orderData?.tracking_longitude}
          riderName={orderData?.rider?.full_name || orderData?.driver_name}
          status={orderData?.status}
          title={orderData?.vehicle_type ? "Ride Map" : (orderData?.order_reference || "Order map")}
          subtitle={orderData?.vehicle_type ? "Ride tracking" : "Customer live map"}
          heightClassName="h-[40vh]"
        />

        {/* Status Sheet (Glassmorphism) */}
        <section className="relative -mt-10 px-5 z-10">
          <div className="bg-white/90 backdrop-blur-2xl rounded-t-[2.5rem] shadow-[0_-12px_40px_rgba(0,0,0,0.06)] p-6 pb-32 min-h-[60vh] space-y-8">
            <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto"></div>

            {/* Status Poll Info */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                  {orderData?.vehicle_type ? 'Ride Status' : 'Order Status'}
                </p>
                <h2 className="text-4xl font-black font-headline tracking-tighter text-slate-900">
                  {getStatusText(orderData?.status)}
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-2">
                  {orderData?.vehicle_type ? `Ride #${orderData?.ride_id}` : `Order #${orderData?.order_reference}`}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-rose-50 px-3 py-1 rounded-lg inline-block border border-rose-100">
                  <span className="text-rose-600 font-black text-[10px] uppercase tracking-widest">
                    {getStatusText(orderData?.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-400 italic">Auto-refreshing live</p>
              </div>
            </div>

            {/* Kinetic Status Stepper */}
            <div className="relative py-4 overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                {getTimelineSteps().map((step, idx) => {
                  const timelineIndex = getTimelineIndex(orderData?.status);
                  const isActive = idx <= timelineIndex;
                  const isCurrent = idx === timelineIndex;
                  const isRide = orderData?.vehicle_type !== undefined;
                  
                  return (
                    <div key={step} className="flex flex-col items-center gap-2 w-1/5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg text-sm ${
                        isActive ? 'text-white' : 'bg-slate-100 text-slate-300'
                      }`} style={isActive ? { background: signatureGradient } : {}}>
                        <span className="material-symbols-outlined text-base">
                          {getTimelineIcon(idx, isRide)}
                        </span>
                      </div>
                      <span className={`text-[8px] font-black text-center uppercase tracking-tighter ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress Line */}
              <div className="absolute top-7 left-[10%] right-[10%] h-[2px] bg-slate-100 -z-0 rounded-full">
                <div 
                  className="h-full bg-rose-600 transition-all duration-1000 rounded-full" 
                  style={{ width: `${(getTimelineIndex(orderData?.status) / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Courier / Driver Info Card */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center">
                    {orderData?.vehicle_type ? (
                      <span className="material-symbols-outlined text-2xl text-slate-400">person</span>
                    ) : (
                      <span className="material-symbols-outlined text-2xl text-slate-400">person</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 rounded-full border-2 border-white">
                    <span className="material-symbols-outlined text-[10px] text-white" style={materialIconFill}>verified</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    {orderData?.vehicle_type ? (
                      orderData?.driver_name ? orderData.driver_name : 'Finding Rider...'
                    ) : (
                      orderData?.rider?.full_name
                        ? orderData.rider.full_name
                        : orderData?.status === 'delivered'
                          ? 'Delivery Completed'
                          : orderData?.status === 'on_the_way'
                            ? 'Courier on the way'
                            : 'Processing your order'
                    )}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-amber-500" style={materialIconFill}>schedule</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(orderData?.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {orderData?.vehicle_type && orderData?.driver_phone ? (
                  <>
                    <button className="bg-white p-3 rounded-xl text-slate-600 shadow-sm active:scale-90 transition-transform">
                      <span className="material-symbols-outlined" style={materialIconFill}>call</span>
                    </button>
                    <button 
                      className="p-3 rounded-xl text-white shadow-lg active:scale-90 transition-transform"
                      style={{ background: signatureGradient }}
                    >
                      <span className="material-symbols-outlined" style={materialIconFill}>chat_bubble</span>
                    </button>
                  </>
                ) : (
                  <button className="bg-white p-3 rounded-xl text-slate-600 shadow-sm active:scale-90 transition-transform">
                    <span className="material-symbols-outlined" style={materialIconFill}>call</span>
                  </button>
                )}
              </div>
            </div>

            {/* Order Note Polled from Backend */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Live Status Update</span>
              </div>
              <p className="text-sm font-bold leading-relaxed opacity-90">
                {orderData?.tracking_note || "Your order is being processed. We'll keep you updated on every step."}
              </p>
            </div>

            {/* Help Button */}
            <div className="space-y-3">
              {!orderData?.vehicle_type && orderData?.status === "on_the_way" && orderData?.rider?.id ? (
                <Link
                  to={`/tracking/${orderData.id}`}
                  className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:text-rose-600 transition-colors"
                >
                  Live rider tracking is active
                  <span className="material-symbols-outlined text-sm">place_item</span>
                </Link>
              ) : null}
              <button className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:text-rose-600 transition-colors">
                Need help with this order?
                <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Global Bottom Navigation Shell */}
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
