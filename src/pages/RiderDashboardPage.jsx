import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRiderDashboard, updateRiderProfile } from "../api/rider";
import { fetchRiderRideQueue } from "../api/rides";
import { QuickDropLogo } from "../components/branding/QuickDropLogo";
import { RealtimeNotifications } from "../components/layout/RealtimeNotifications";
import { formatMoney } from "../lib/utils";
import { useAuthStore } from "../store/authStore";

export const RiderDashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((state) => state.setProfile);
  
  const { data: dashboard, isLoading } = useQuery({ 
    queryKey: ["rider-dashboard"], 
    queryFn: fetchRiderDashboard,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
  const rideQueueQuery = useQuery({
    queryKey: ["rider-ride-queue"],
    queryFn: fetchRiderRideQueue,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const [statusMessage, setStatusMessage] = useState("");
  const isOnline = (dashboard?.rider?.rider_status || "offline") !== "offline";
  const activeRide = (rideQueueQuery.data ?? []).find((ride) => ride.rider?.id === dashboard?.rider?.id && ride.status !== "completed" && ride.status !== "cancelled");
  const pendingRideRequests = (rideQueueQuery.data ?? []).filter((ride) => ride.rider?.id == null || ride.rider?.id === dashboard?.rider?.id).length;

  const statusMutation = useMutation({
    mutationFn: updateRiderProfile,
    onSuccess: (data) => {
      setProfile(data);
      setStatusMessage(`Rider is now ${data.rider_status}.`);
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rider-profile"] });
    },
  });

  useEffect(() => {
    if (!isOnline) return;
    if (dashboard?.rider?.current_latitude != null && dashboard?.rider?.current_longitude != null) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        statusMutation.mutate({
          rider_status: dashboard?.rider?.rider_status || "available",
          current_latitude: position.coords.latitude,
          current_longitude: position.coords.longitude,
        });
      },
      () => {
        setStatusMessage("Turn on location so admin can see you while you are online.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [dashboard?.rider?.current_latitude, dashboard?.rider?.current_longitude, dashboard?.rider?.rider_status, isOnline]);

  const goOnlineWithLocation = () => {
    if (!navigator.geolocation) {
      setStatusMessage("This device does not support live location. Turn it on from a supported device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStatusMessage("");
        statusMutation.mutate({
          rider_status: "available",
          current_latitude: position.coords.latitude,
          current_longitude: position.coords.longitude,
        });
      },
      () => {
        setStatusMessage("Turn on location access before going online.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9f9f9]">
        <div className="text-center font-black uppercase tracking-widest text-slate-400 animate-pulse">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] font-['Plus_Jakarta_Sans'] selection:bg-orange-100 antialiased pb-28 md:pb-12">
      <RealtimeNotifications />
      
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#f6f7f1]/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <QuickDropLogo size={40} showWordmark labelClassName="font-headline text-2xl font-bold text-[#4e6300]" />
          </div>
          
          {/* Desktop Navigation Links integrated into top header */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-2 mr-4 border-r border-slate-200 pr-4">
              <HeaderNavLink to="/rider/dashboard" label="Dashboard" active />
              <HeaderNavLink to="/rider/wallet" label="Wallet" />
              <HeaderNavLink to="/rider/orders" label="Orders" />
              <HeaderNavLink to="/rider/profile" label="Profile" />
            </nav>
            <button
              type="button"
              onClick={() => navigate("/profile/notifications")}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 hover:opacity-80 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[#5a5c58]">notifications</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left / Top Section: Status & Financial Metrics */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status & Online Toggle Card */}
            <div>
              <section className="flex items-center justify-between bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
                <div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400 mb-1">Rider Status</h2>
                  <p className="text-2xl font-black text-[#0A192F]">
                    {isOnline ? "Available" : "Resting"}
                  </p>
                </div>
                <div className="relative flex items-center">
                  <label className="inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={isOnline} 
                      onChange={() => {
                        setStatusMessage("");
                        if (isOnline) {
                          statusMutation.mutate({ rider_status: "offline" });
                          return;
                        }
                        goOnlineWithLocation();
                      }}
                      className="sr-only peer" 
                    />
                    <div className="relative w-14 h-7 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-[#ff8c00]"></div>
                    <span className="ms-3 text-xs font-black text-[#ff8c00] uppercase tracking-widest hidden sm:inline-block w-16">
                      {isOnline ? "ONLINE" : "OFFLINE"}
                    </span>
                  </label>
                </div>
              </section>
              {statusMessage && <p className="px-1 mt-2 text-xs font-bold text-slate-500">{statusMessage}</p>}
            </div>

            {/* Financial Metrics Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-8 bg-gradient-to-br from-[#0A192F] to-[#1e293b] p-6 sm:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60 mb-1">Today's Earnings</p>
                  <h3 className="text-4xl sm:text-5xl font-black tracking-tighter mb-6">{formatMoney(dashboard?.today_earnings ?? 0)}</h3>
                </div>
                <div className="flex gap-4 relative z-10">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 flex-1 sm:flex-initial">
                    <p className="text-[10px] uppercase font-black opacity-60">Deliveries</p>
                    <p className="text-lg sm:text-xl font-black">{dashboard?.completed_deliveries ?? 0}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-white/10 flex-1 sm:flex-initial">
                    <p className="text-[10px] uppercase font-black opacity-60">Wallet</p>
                    <p className="text-lg sm:text-xl font-black">{formatMoney(dashboard?.wallet_balance ?? 0)}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -right-6 -bottom-6 text-[150px] sm:text-[180px] opacity-10 rotate-12 pointer-events-none">payments</span>
              </div>
              
              <div className="md:col-span-4 bg-[#ff8c00] p-6 rounded-[2rem] flex md:flex-col justify-between items-center md:items-start shadow-lg shadow-orange-500/10 min-h-[120px] md:min-h-[220px]">
                <div className="w-12 h-12 bg-[#0A192F] rounded-full flex items-center justify-center md:mb-4">
                  <span className="material-symbols-outlined text-[#ff8c00]" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
                </div>
                <div className="text-right md:text-left">
                  <h4 className="text-3xl sm:text-4xl font-black text-[#0A192F]">{dashboard?.active_deliveries ?? 0}</h4>
                  <p className="text-xs font-bold text-[#0A192F]/70 uppercase tracking-widest">Active Deliveries</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right / Sidebar Section: Navigation Actions & Active Deliveries */}
          <div className="space-y-6">
            
            {/* Quick Actions (Full width grid rows on mobile, clear control panel layout on desktop) */}
            <section className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 px-1">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-3">
                <QuickAction to="/rider/order-requests" icon="electric_moped" label="Requests" color="bg-orange-50 text-[#ff8c00]" />
                <QuickAction to="/rider/orders" icon="package_2" label="Orders" color="bg-blue-50 text-blue-600" />
                <QuickAction to="/rider/analytics" icon="bar_chart_4_bars" label="Analytics" color="bg-purple-50 text-purple-600" />
                <QuickAction to="/rider/profile" icon="person" label="Profile" color="bg-slate-100 text-slate-700" />
              </div>
            </section>

            {/* Current Delivery / Active Order Panel */}
            <section className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <h3 className="text-xl font-black tracking-tight text-[#0A192F]">Live Ride</h3>
                <Link to="/rider/order-requests" className="text-xs font-black text-[#ff8c00] uppercase tracking-widest hover:underline transition-all">
                  Requests ({(dashboard?.pending_requests ?? 0) + pendingRideRequests})
                </Link>
              </div>

              {activeRide || dashboard?.active_order ? (
                <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border-l-[12px] border-[#ff8c00] relative transition-all hover:shadow-md">
                  <div className="flex justify-between items-start mb-6 gap-2">
                    <div>
                      <span className="inline-block bg-orange-100 text-[#ff8c00] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                        {activeRide ? "Active ride" : dashboard.active_order.requires_rider_response ? "Assignment waiting" : "Active Delivery"}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-black text-[#0A192F] leading-tight break-words">
                        {activeRide ? `${activeRide.vehicle_type.toUpperCase()} pickup` : dashboard.active_order.vendor?.name}
                      </h4>
                      <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">
                        {activeRide ? `To: ${activeRide.dropoff.address}` : `To: ${dashboard.active_order.customer?.full_name}`}
                      </p>
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#ff8c00] whitespace-nowrap">
                      {formatMoney(activeRide ? activeRide.price : dashboard.active_order.total_amount ?? 0, activeRide?.currency)}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-400 text-xs sm:text-sm mb-8">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      <span className="font-bold uppercase tracking-wide">{(activeRide ? activeRide.status : dashboard.active_order.status).replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">tag</span>
                      <span className="font-bold">{activeRide ? activeRide.ride_id : dashboard.active_order.order_reference}</span>
                    </div>
                  </div>

                  <Link 
                    to={activeRide ? "/rider/orders" : `/rider/navigate/${dashboard.active_order.id}`}
                    className="w-full flex items-center justify-center bg-[#0A192F] text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-md shadow-slate-900/10 text-xs sm:text-sm"
                  >
                    {activeRide ? "Manage Ride" : dashboard.active_order.requires_rider_response ? "Review Assignment" : "Start Navigation"}
                  </Link>
                </div>
              ) : (
                <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">shopping_basket</span>
                  <p className="text-slate-500 text-sm font-medium">No active deliveries right now.</p>
                </div>
              )}
            </section>
          </div>

        </div>
      </main>

      {/* Mobile Bottom Navbar (Hidden natively on tablet/desktop views) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 backdrop-blur-2xl z-50 rounded-t-[2rem] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-slate-100">
        <MobileNavItem to="/rider/dashboard" icon="home" active />
        <MobileNavItem to="/rider/wallet" icon="payments" />
        <MobileNavItem to="/rider/orders" icon="receipt_long" />
        <MobileNavItem to="/rider/profile" icon="person" />
      </nav>
    </div>
  );
};

// Sub-components used within the main page dashboard context
const QuickAction = ({ to, icon, label, color }) => (
  <Link to={to} className="flex flex-col items-center group w-full">
    <div className={`w-full aspect-square max-w-[64px] rounded-2xl flex items-center justify-center mb-2 transition-all group-hover:scale-105 group-active:scale-95 shadow-sm ${color}`}>
      <span className="material-symbols-outlined text-2xl">{icon}</span>
    </div>
    <span className="text-[9px] font-black uppercase tracking-tight text-slate-500 text-center leading-tight max-w-[72px] truncate sm:whitespace-normal">
      {label}
    </span>
  </Link>
);

const HeaderNavLink = ({ to, label, active = false }) => (
  <Link
    to={to}
    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
      active 
        ? "bg-[#ff8c00] text-white shadow-sm shadow-orange-500/20" 
        : "text-slate-500 hover:text-[#0A192F] hover:bg-slate-100"
    }`}
  >
    {label}
  </Link>
);

const MobileNavItem = ({ to, icon, active = false }) => (
  <Link 
    to={to} 
    className={`flex flex-col items-center justify-center rounded-full p-2.5 w-12 h-12 transition-all duration-300 ${
      active ? "bg-[#ff8c00] text-white scale-105 shadow-md shadow-orange-500/30" : "text-slate-400 hover:text-[#0A192F]"
    }`}
  >
    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
      {icon}
    </span>
  </Link>
);
