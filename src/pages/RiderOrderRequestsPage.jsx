// RiderOrderRequestsPage.jsx
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptRiderOrder, fetchRiderOrderRequests, fetchRiderProfile, rejectRiderOrder } from "../api/rider";
import { fetchRiderRideQueue, respondToRideOffer } from "../api/rides";
import { RealtimeDeliveryMap } from "../components/tracking/RealtimeDeliveryMap";
import { formatMoney } from "../lib/utils";

export const RiderOrderRequestsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const requestsQuery = useQuery({ 
    queryKey: ["rider-order-requests"], 
    queryFn: fetchRiderOrderRequests,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
  const profileQuery = useQuery({
    queryKey: ["rider-profile", "requests-page"],
    queryFn: fetchRiderProfile,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });
  const rideQueueQuery = useQuery({
    queryKey: ["rider-ride-queue"],
    queryFn: fetchRiderRideQueue,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
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
  const rejectMutation = useMutation({
    mutationFn: rejectRiderOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-order-requests"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
    },
  });
  const acceptRideMutation = useMutation({
    mutationFn: ({ rideId }) => respondToRideOffer({ rideId, action: "accept" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-ride-queue"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rider-ride-history"] });
      navigate("/rider/orders");
    },
  });
  const rejectRideMutation = useMutation({
    mutationFn: ({ rideId }) => respondToRideOffer({ rideId, action: "reject" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-ride-queue"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rider-ride-history"] });
    },
  });

  const requests = requestsQuery.data ?? [];
  const rideRequests = rideQueueQuery.data ?? [];
  const riderId = profileQuery.data?.id;
  const riderLocation = profileQuery.data?.current_latitude != null && profileQuery.data?.current_longitude != null
    ? [profileQuery.data.current_latitude, profileQuery.data.current_longitude]
    : null;
  const featuredRide = rideRequests[0];
  const featuredOrder = featuredRide ? null : requests[0];
  const featuredDestination =
    featuredRide?.pickup?.latitude != null && featuredRide?.pickup?.longitude != null
      ? {
          latitude: featuredRide.pickup.latitude,
          longitude: featuredRide.pickup.longitude,
        }
      : featuredOrder?.address?.latitude != null && featuredOrder?.address?.longitude != null
      ? {
          latitude: featuredOrder.address.latitude,
          longitude: featuredOrder.address.longitude,
        }
      : null;

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-32 font-body antialiased text-slate-900 overflow-x-hidden">
      {/* Header - Fixed & Standardized for Mobile viewports */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-white px-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-[#5a5c58] active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-lg font-bold">arrow_back_ios_new</span>
          </button>
          <h1 className="text-base font-black text-[#4e6300] tracking-tight uppercase">Radar Requests</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/profile/notifications")}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-[#5a5c58] active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>
      </header>

      {/* Main Structural Wrapper Layout Container */}
      <main className="mx-auto max-w-md px-4 pt-4 space-y-5">
        
        {/* Dynamic Map Component Bento Section */}
        <section className="relative h-[42vh] sm:h-[360px] w-full rounded-[2rem] overflow-hidden shadow-lg border-2 border-white bg-white">
          {riderLocation ? (
            <RealtimeDeliveryMap
              riderLocation={{ latitude: riderLocation[0], longitude: riderLocation[1] }}
              destination={featuredDestination}
              height={360}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-50 text-center p-6">
              <div>
                <span className="material-symbols-outlined text-3xl text-slate-300 animate-pulse">map</span>
                <p className="mt-2 text-xs font-bold text-slate-400 max-w-xs">Enable device GPS location services to target nearby orders.</p>
              </div>
            </div>
          )}

          {/* Floated Metrics Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-10">
            <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {rideRequests.length + requests.length} Open Jobs
                </span>
              </div>
            </div>
            
            <button className="pointer-events-auto w-10 h-10 bg-white text-slate-900 rounded-xl shadow-md flex items-center justify-center active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-lg">my_location</span>
            </button>
          </div>

          {(featuredRide || featuredOrder) && (
            <div className="pointer-events-none absolute left-4 top-4 max-w-[80%] rounded-2xl bg-white/95 px-3 py-2 shadow-md backdrop-blur-md border border-slate-100">
              <p className="text-[9px] font-black uppercase tracking-widest text-orange-600">
                {featuredRide
                  ? featuredRide.rider?.id === riderId
                    ? "Assigned Ride"
                    : "Nearest Ride"
                  : featuredOrder?.requires_rider_response
                    ? "Assigned Next"
                    : "Nearest Route"}
              </p>
              <p className="text-xs font-black text-slate-900 truncate mt-0.5">
                {featuredRide ? `${featuredRide.vehicle_type.toUpperCase()} pickup` : featuredOrder?.vendor?.name}
              </p>
            </div>
          )}
        </section>

        {/* Requests Feed Grid Engine */}
        <section className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Job Pool</h3>
            <span className="text-[9px] font-black text-[#ff8c00] uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100/60 animate-pulse">
              Live Feed
            </span>
          </div>
          
          {rideRequests.length > 0 ? (
            rideRequests.map((ride) => {
              const isAssignedRide = ride.rider?.id === riderId;
              const rideDistance = getRideDistanceKm(riderLocation, ride);
              return (
              <div 
                key={ride.ride_id} 
                className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-slate-50 border rounded-xl flex items-center justify-center flex-shrink-0 text-[#ff8c00]">
                    <span className="material-symbols-outlined text-2xl">two_wheeler</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-black text-sm text-slate-900 truncate">
                        {ride.pickup?.address || "Pickup"}
                      </h4>
                      <p className="text-sm font-black text-slate-900 flex-shrink-0">{formatMoney(ride.price, ride.currency)}</p>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                      {isAssignedRide ? "Assigned ride" : ride.status.replaceAll("_", " ")} • {Number.isFinite(rideDistance) ? `${rideDistance.toFixed(1)}km away` : "Distance unavailable"}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-1 break-all">
                      Dropoff: {ride.dropoff?.address || "No dropoff set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
                  {isAssignedRide ? (
                    <button
                      disabled={rejectRideMutation.isPending}
                      onClick={() => rejectRideMutation.mutate({ rideId: ride.ride_id })}
                      className="flex-1 text-[10px] font-black uppercase bg-slate-100 text-slate-700 py-3 rounded-xl border border-slate-200/60 active:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  ) : null}
                  <button
                    disabled={acceptRideMutation.isPending}
                    onClick={() => acceptRideMutation.mutate({ rideId: ride.ride_id })}
                    className="flex-1 text-[10px] font-black uppercase bg-slate-950 text-white py-3 rounded-xl active:bg-[#ff8c00] transition-colors disabled:opacity-50 tracking-wider shadow-sm shadow-slate-950/10"
                  >
                    {acceptRideMutation.isPending ? "Connecting..." : isAssignedRide ? "Accept Ride" : "Claim Ride"}
                  </button>
                </div>
              </div>
            )})
          ) : null}

          {requests.length > 0 ? (
            requests.map((order) => (
              <div 
                key={order.id} 
                className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 active:scale-[0.99] transition-transform"
              >
                {/* Meta Layout Row Segment */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-slate-50 border rounded-xl flex items-center justify-center flex-shrink-0 text-[#ff8c00]">
                    <span className="material-symbols-outlined text-2xl">
                      {order.requires_rider_response ? "assignment_ind" : "restaurant"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="font-black text-sm text-slate-900 truncate">{order.vendor?.name}</h4>
                      <p className="text-sm font-black text-slate-900 flex-shrink-0">{formatMoney(order.total_amount)}</p>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                      REF: {order.order_reference} • {formatOrderMeta(order, riderLocation)}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-1 break-all">{order.address?.line1 || "Drop-off missing"}</p>
                  </div>
                </div>

                {/* Mobile Unified Action Triggers Button Deck */}
                <div className="flex items-center gap-2 border-t border-slate-50 pt-3">
                  {order.requires_rider_response && (
                    <button
                      disabled={rejectMutation.isPending}
                      onClick={() => rejectMutation.mutate({ orderId: order.id })}
                      className="flex-1 text-[10px] font-black uppercase bg-slate-100 text-slate-700 py-3 rounded-xl border border-slate-200/60 active:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                  )}
                  <button 
                    disabled={acceptMutation.isPending}
                    onClick={() => acceptMutation.mutate({ orderId: order.id, current_latitude: riderLocation?.[0], current_longitude: riderLocation?.[1] })}
                    className="flex-1 text-[10px] font-black uppercase bg-slate-950 text-white py-3 rounded-xl active:bg-[#ff8c00] transition-colors disabled:opacity-50 tracking-wider shadow-sm shadow-slate-950/10"
                  >
                    {acceptMutation.isPending ? "Connecting..." : order.requires_rider_response ? "Accept Order" : "Claim Order"}
                  </button>
                </div>
              </div>
            ))
          ) : null}

          {!rideRequests.length && !requests.length ? (
            <div className="py-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200 px-4">
              <span className="material-symbols-outlined text-3xl text-slate-300 mb-1">radar</span>
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Scanning for available dispatches...</p>
            </div>
          ) : null}
        </section>
      </main>

      {/* Navigation Dock - Refactored Height Footprint to handle safe device viewports */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center px-4 bg-white/95 backdrop-blur-xl z-50 border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.02)] max-w-md mx-auto rounded-t-2xl">
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
    className={`flex items-center justify-center rounded-xl w-11 h-11 transition-all duration-200 ${
      active ? "bg-[#ff8c00] text-white shadow-md shadow-orange-500/20" : "text-slate-400 active:text-slate-900"
    }`}
  >
    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
      {icon}
    </span>
  </Link>
);

const formatOrderMeta = (order, riderLocation) => {
  const distance = getDistanceKm(riderLocation, order);
  const distanceLabel = Number.isFinite(distance) ? `${distance.toFixed(1)}km away` : order.status.replaceAll("_", " ");
  return order.requires_rider_response ? `Assigned • ${distanceLabel}` : `${order.status.replaceAll("_", " ")} • ${distanceLabel}`;
};

const getDistanceKm = (riderLocation, order) => {
  if (!riderLocation || order.address?.latitude == null || order.address?.longitude == null) return Number.POSITIVE_INFINITY;
  const [lat1, lng1] = riderLocation;
  const lat2 = order.address.latitude;
  const lng2 = order.address.longitude;
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const getRideDistanceKm = (riderLocation, ride) => {
  if (!riderLocation || ride.pickup?.latitude == null || ride.pickup?.longitude == null) return Number.POSITIVE_INFINITY;
  const [lat1, lng1] = riderLocation;
  const lat2 = ride.pickup.latitude;
  const lng2 = ride.pickup.longitude;
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};
