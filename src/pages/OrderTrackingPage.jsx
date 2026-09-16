import React, { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchOrderTracking } from "../api/orders";
import { LiveRiderMap } from "../components/tracking/LiveRiderMap";
import { useRideRealtime } from "../hooks/useRideRealtime";
import { useOrderRealtime } from "../hooks/useOrderRealtime";

export const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(true);
  const isRideTracking = Boolean(id?.startsWith("ride_"));

  const trackingQuery = useQuery({
    queryKey: ["tracking", id],
    queryFn: () => fetchOrderTracking(id),
    enabled: Boolean(id),
    refetchInterval: 12000,
  });

  useEffect(() => {
    if (trackingQuery.data) {
      setLiveData(trackingQuery.data);
    }
  }, [trackingQuery.data]);

  useRideRealtime({
    rideId: isRideTracking ? id : null,
    enabled: isRideTracking,
    onRideEvent: (payload) => {
      if (payload.ride) setLiveData(payload.ride);
    },
  });

  useOrderRealtime({
    orderId: !isRideTracking ? id : null,
    enabled: Boolean(id && !isRideTracking),
    onOrderEvent: (payload) => {
      if (payload.order) setLiveData(payload.order);
    },
  });

  const orderData = liveData;
  const isLoading = trackingQuery.isLoading;
  const isError = trackingQuery.isError;
  const riderPhone = orderData?.rider?.phone ?? "";
  const riderPhoneHref = riderPhone ? `tel:${String(riderPhone).replace(/\s+/g, "")}` : null;

  const getStatusText = (status) => {
    const orderStatusMap = {
      pending: "Processing",
      confirmed: "Confirmed",
      preparing: "Preparing",
      rider_assigned: "Assigned",
      on_the_way: "On the way",
      delivered: "Delivered",
      cancelled: "Cancelled"
    };
    
    const rideStatusMap = {
      searching: "Finding Rider",
      accepted: "Rider Accepted",
      arriving: "Arriving",
      on_trip: "On trip",
      completed: "Completed",
      cancelled: "Cancelled"
    };
    
    const isRide = orderData?.vehicle_type !== undefined;
    return (isRide ? rideStatusMap : orderStatusMap)[status] || status;
  };

  const getTimelineIndex = (status) => {
    const isRide = orderData?.vehicle_type !== undefined;
    if (isRide) {
      const rideStatusOrder = { searching: 0, accepted: 1, arriving: 2, on_trip: 3, completed: 4, cancelled: 0 };
      return rideStatusOrder[status] || 0;
    } else {
      const orderStatusOrder = { pending: 0, confirmed: 1, preparing: 2, rider_assigned: 3, on_the_way: 3, delivered: 4, cancelled: 0 };
      return orderStatusOrder[status] || 0;
    }
  };

  const getTimelineSteps = () => {
    const isRide = orderData?.vehicle_type !== undefined;
    return isRide 
      ? ['Searching', 'Accepted', 'Arriving', 'On Trip', 'Completed']
      : ['Confirmed', 'Preparing', 'Picked Up', 'On the Way', 'Delivered'];
  };

  const getTimelineIcon = (idx) => {
    const icons = ['check', 'restaurant', 'handshake', 'electric_moped', 'home_pin'];
    return icons[idx] || 'check';
  };

  if (isLoading) {
    return (
      <div className="bg-[#f7f9fb] font-sans text-[#191c1e] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#e0e3e5] border-t-[#b80035] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#565e74]">Syncing tracking info...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-[#f7f9fb] font-sans text-[#191c1e] min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm bg-white p-8 rounded-[2rem] shadow-sm border border-[#e0e3e5]">
          <div className="w-14 h-14 bg-[#ffdad6] rounded-full flex items-center justify-center mb-4 mx-auto text-[#ba1a1a]">
            <span className="material-symbols-outlined text-2xl">error_outline</span>
          </div>
          <h3 className="font-bold text-base mb-1">Session Connection Lost</h3>
          <p className="text-xs text-[#565e74] mb-6">Unable to load your live session. Please verify your reference ID or network.</p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3 rounded-2xl bg-[#191c1e] text-white font-bold text-xs uppercase tracking-widest active:scale-95 transition-transform"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const timelineIndex = getTimelineIndex(orderData?.status);
  const progressPercent = Math.min(100, Math.max(0, (timelineIndex / 4) * 100));
  const etaMinutes = orderData?.estimated_arrival_seconds ? Math.max(1, Math.round(orderData.estimated_arrival_seconds / 60)) : 8;
  const distanceKm = orderData?.distance_meters_remaining ? (orderData.distance_meters_remaining / 1000).toFixed(1) : "1.8";

  return (
    <div className="bg-[#f7f9fb] font-sans text-[#191c1e] min-h-screen antialiased flex flex-col items-center">
      <div className="w-full max-w-xl min-h-screen flex flex-col bg-[#f7f9fb] relative">
        
        {/* Fixed Header */}
        <header className="fixed top-0 w-full max-w-xl z-50 bg-white/90 backdrop-blur-xl border-b border-[#e0e3e5]/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] transition-colors" 
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#006847] animate-pulse"></span>
                <span className="font-bold text-sm text-[#191c1e]">
                  {orderData?.vehicle_type ? 'Ride Session' : 'Order Tracking'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate('/support')}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] transition-colors" 
                type="button"
                title="Support"
              >
                <span className="material-symbols-outlined text-[20px]">support_agent</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full pt-16 pb-32 px-4 flex-1 space-y-4">
          
          {/* Live Telemetry Top Status Bar */}
          <div className="w-full bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#e0e3e5]/40">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#006847] relative flex items-center justify-center">
                <span className="absolute -inset-1 rounded-full bg-[#006847]/30 animate-ping"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#191c1e]">
                    Ref: #{orderData?.vehicle_type ? orderData?.ride_id : (orderData?.order_reference || 'LIVE-001')}
                  </span>
                  <span className="bg-[#eceef0] px-2 py-0.5 rounded-full text-[10px] font-bold text-[#565e74] uppercase">
                    {orderData?.vehicle_type ? 'Ride' : 'Express'}
                  </span>
                </div>
                <span className="text-xs text-[#565e74]">Status: {getStatusText(orderData?.status)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#6ffbbe] text-[#002113] text-[11px] font-bold">
                <span className="material-symbols-outlined text-[14px]">satellite_alt</span>
                Telemetry Active
              </span>
            </div>
          </div>

          {/* Map Viewport Component */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-[#e6e8ea] shadow-md border border-[#e0e3e5]">
            <div className="relative w-full h-[360px]">
              <LiveRiderMap
                latitude={orderData?.tracking_latitude ?? orderData?.rider_location?.latitude}
                longitude={orderData?.tracking_longitude ?? orderData?.rider_location?.longitude}
                destinationLatitude={orderData?.destination_latitude}
                destinationLongitude={orderData?.destination_longitude}
                routeGeometry={orderData?.route_geometry}
                riderName={orderData?.rider?.full_name}
                status={orderData?.status}
                title={orderData?.vehicle_type ? "Ride Map" : (orderData?.order_reference || "Live Route")}
                subtitle="High precision GPS live sync"
                heightClassName="h-full"
              />
            </div>

            {/* Quick Driver Dock Overlay */}
            <div className="w-full bg-white p-4 flex items-center justify-between gap-3 border-t border-[#e0e3e5]/60">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-[#f2f4f6] text-[#565e74] flex items-center justify-center font-bold shadow-sm border border-[#e0e3e5]">
                    <span className="material-symbols-outlined text-xl">person</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#006847] rounded-full border-2 border-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[9px]">check</span>
                  </div>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-[#191c1e] truncate">
                      {orderData?.rider?.full_name || (orderData?.vehicle_type ? 'Assigning Rider...' : 'Preparing Order')}
                    </span>
                    <span className="flex items-center text-[#b80035] text-xs font-bold">
                      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      <span className="text-[#191c1e] ml-0.5">4.9</span>
                    </span>
                  </div>
                  <span className="text-xs text-[#565e74] truncate">
                    {orderData?.rider?.vehicle_info || 'Verified Courier Partner'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {riderPhoneHref ? (
                  <a 
                    href={riderPhoneHref}
                    className="w-10 h-10 rounded-full bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] flex items-center justify-center transition-colors shadow-sm" 
                    title="Call Courier"
                  >
                    <span className="material-symbols-outlined text-[20px]">call</span>
                  </a>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#f2f4f6] text-[#906f70] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">phone_disabled</span>
                  </div>
                )}
                <button 
                  onClick={() => alert("Opening secure dispatcher chat...")}
                  className="w-10 h-10 rounded-full bg-[#e11d48] hover:bg-[#b80035] text-white flex items-center justify-center transition-all shadow-sm" 
                  title="Message Courier" 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                </button>
              </div>
            </div>
          </div>

          {/* Primary ETA & Milestone Card */}
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-[#e0e3e5]/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#eceef0]">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-[#b80035] font-bold">Estimated Arrival</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#4edea3]/30 text-[#002113] text-[10px] font-bold">On Schedule</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold tracking-tight text-[#191c1e]">{etaMinutes} mins</span>
                  <span className="text-xs text-[#565e74]">expected live sync</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#f2f4f6] px-3.5 py-2 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#b80035] shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">route</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#565e74] uppercase font-bold">Distance Left</span>
                  <span className="font-bold text-sm text-[#191c1e]">{distanceKm} km</span>
                </div>
              </div>
            </div>

            {/* 5-Step Order Progress Timeline */}
            <div className="space-y-2 pt-1">
              <span className="text-xs text-[#565e74] uppercase font-bold tracking-wider">Live Delivery Progression</span>
              <div className="relative pt-2 pb-2">
                <div className="absolute top-5 left-4 right-4 h-1 bg-[#eceef0] rounded-full -z-0"></div>
                <div className="absolute top-5 left-4 h-1 bg-[#e11d48] rounded-full -z-0 transition-all duration-700" style={{ width: `${progressPercent}%` }}></div>
                
                <div className="relative z-10 flex items-start justify-between">
                  {getTimelineSteps().map((step, idx) => {
                    const isActive = idx <= timelineIndex;
                    const isCurrent = idx === timelineIndex;
                    
                    return (
                      <div key={step} className="flex flex-col items-center text-center max-w-[64px]">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm text-xs font-bold transition-all ${
                          isActive 
                            ? 'bg-[#e11d48] text-white' 
                            : 'bg-[#eceef0] text-[#565e74]'
                        }`}>
                          <span className="material-symbols-outlined text-[15px]">
                            {getTimelineIcon(idx)}
                          </span>
                        </div>
                        <span className={`mt-1.5 text-[10px] font-bold ${isCurrent ? 'text-[#b80035]' : 'text-[#191c1e]'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tracking Note Bulletin */}
            <div className="bg-[#f2f4f6] rounded-xl p-3.5 flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-[#006847]/10 text-[#006847] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">local_shipping</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#191c1e]">Active Telemetry Note</span>
                <span className="text-xs text-[#565e74] leading-relaxed">
                  {orderData?.tracking_note || "Your route is monitored live via high precision server dispatch nodes."}
                </span>
              </div>
            </div>
          </div>

          {/* Route & Waypoints Visualizer Card */}
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-[#e0e3e5]/60">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#191c1e]">Route & Destination</span>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#dae2fd] text-[#3f465c] font-bold uppercase">Priority Direct</span>
            </div>
            
            <div className="relative pl-6 space-y-4">
              <div className="absolute left-2.5 top-2 bottom-3 w-0.5 bg-[#e0e3e5]"></div>
              
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#565e74] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#565e74]"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#565e74] uppercase font-bold">Pickup Origin</span>
                  <span className="font-bold text-xs text-[#191c1e]">Central Merchant Hub</span>
                  <span className="text-xs text-[#565e74]">Verified Dispatch Station</span>
                </div>
              </div>

              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#b80035] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b80035]"></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#b80035] uppercase font-bold">Drop-off Destination</span>
                  <span className="font-bold text-xs text-[#191c1e]">
                    {orderData?.destination_address || orderData?.delivery_address || 'Customer Delivery Address'}
                  </span>
                  <span className="text-xs text-[#565e74]">Drop-off Protocol: Contactless Delivery</span>
                </div>
              </div>
            </div>
          </div>

          {/* Package Manifest & Summary Card */}
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm space-y-4 border border-[#e0e3e5]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#565e74] text-[18px]">shopping_bag</span>
                <span className="font-bold text-sm text-[#191c1e]">Session Summary</span>
              </div>
              <button 
                onClick={() => setShowReceipt(!showReceipt)} 
                className="text-xs font-bold text-[#b80035] hover:underline" 
                type="button"
              >
                {showReceipt ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {showReceipt && (
              <div className="space-y-3 pt-2 border-t border-[#eceef0] text-xs">
                <div className="flex justify-between text-[#565e74]">
                  <span>Reference ID</span>
                  <span className="font-mono text-[#191c1e]">#{orderData?.order_reference || orderData?.ride_id || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-[#565e74]">
                  <span>Payment Status</span>
                  <span className="text-[#006847] font-bold">Verified & Paid</span>
                </div>
                <div className="flex justify-between text-[#565e74]">
                  <span>Telemetry Protocol</span>
                  <span className="text-[#191c1e]">WebSockets / Realtime Sync</span>
                </div>
              </div>
            )}
          </div>

        </main>

        {/* Global Bottom Navigation Bar */}
     

      </div>
    </div>
  );
};