// RiderOrderManagementPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchRiderOrders, fetchRiderProfile, fetchRiderTracking, updateRiderOrder } from "../api/rider";
import { fetchRideStatus, fetchRiderRideHistory, fetchRiderRideQueue, updateRideStatus } from "../api/rides";
import { RealtimeRideMap } from "../components/tracking/RealtimeRideMap";
import { useOrderRealtime } from "../hooks/useOrderRealtime";
import { useRideRealtime } from "../hooks/useRideRealtime";
import { buildGoogleNavigationLink, formatEta, formatMoney } from "../lib/rideMaps";

const ORDER_STATUS_ACTIONS = [
  { status: "rider_assigned", label: "Assigned" },
  { status: "on_the_way", label: "On Route" },
  { status: "delivered", label: "Delivered" },
];

const RIDE_STATUS_ACTIONS = [
  { status: "accepted", label: "Accepted" },
  { status: "arriving", label: "Arriving" },
  { status: "completed", label: "Completed" },
];

const TERMINAL_ORDER_STATUSES = new Set(["delivered", "cancelled"]);
const TERMINAL_RIDE_STATUSES = new Set(["completed", "cancelled"]);

export const RiderOrderManagementPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("active");
  const [selectedKey, setSelectedKey] = useState(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const ordersQuery = useQuery({
    queryKey: ["rider-orders"],
    queryFn: fetchRiderOrders,
    refetchInterval: 3000,
  });
  const profileQuery = useQuery({
    queryKey: ["rider-profile", "orders-page"],
    queryFn: fetchRiderProfile,
    refetchInterval: 3000,
  });
  const rideQueueQuery = useQuery({
    queryKey: ["rider-ride-queue"],
    queryFn: fetchRiderRideQueue,
    refetchInterval: 3000,
  });
  const rideHistoryQuery = useQuery({
    queryKey: ["rider-ride-history"],
    queryFn: fetchRiderRideHistory,
    refetchInterval: 5000,
  });

  const riderProfile = profileQuery.data ?? null;
  const riderId = riderProfile?.id;

  const activeRides = useMemo(
    () => (rideQueueQuery.data ?? []).filter((ride) => ride.rider?.id === riderId && !TERMINAL_RIDE_STATUSES.has(ride.status)),
    [rideQueueQuery.data, riderId],
  );
  const historicalRides = useMemo(
    () => (rideHistoryQuery.data ?? []).filter((ride) => TERMINAL_RIDE_STATUSES.has(ride.status)),
    [rideHistoryQuery.data],
  );
  const activeOrders = useMemo(
    () => (ordersQuery.data ?? []).filter((order) => !TERMINAL_ORDER_STATUSES.has(order.status)),
    [ordersQuery.data],
  );
  const historicalOrders = useMemo(
    () => (ordersQuery.data ?? []).filter((order) => TERMINAL_ORDER_STATUSES.has(order.status)),
    [ordersQuery.data],
  );

  const activeEntries = useMemo(
    () => [...activeRides.map((ride) => buildEntry("ride", ride)), ...activeOrders.map((order) => buildEntry("order", order))].sort(sortEntries),
    [activeOrders, activeRides],
  );
  const historyEntries = useMemo(
    () => [...historicalRides.map((ride) => buildEntry("ride", ride)), ...historicalOrders.map((order) => buildEntry("order", order))].sort(sortEntries),
    [historicalOrders, historicalRides],
  );

  const visibleEntries = activeTab === "active" ? activeEntries : historyEntries;

  useEffect(() => {
    if (!visibleEntries.length) {
      setSelectedKey(null);
      return;
    }
    const selectedStillExists = visibleEntries.some((entry) => entry.key === selectedKey);
    if (!selectedStillExists) {
      setSelectedKey(visibleEntries[0].key);
    }
  }, [selectedKey, visibleEntries]);

  const selectedEntry = useMemo(
    () => visibleEntries.find((entry) => entry.key === selectedKey) ?? visibleEntries[0] ?? null,
    [selectedKey, visibleEntries],
  );

  const focusedRideQuery = useQuery({
    queryKey: ["rider-ride-focus", selectedEntry?.type, selectedEntry?.id],
    queryFn: () => fetchRideStatus(selectedEntry.id),
    enabled: selectedEntry?.type === "ride",
    refetchInterval: 4000,
  });
  const focusedOrderQuery = useQuery({
    queryKey: ["rider-order-focus", selectedEntry?.type, selectedEntry?.id],
    queryFn: () => fetchRiderTracking(selectedEntry.id),
    enabled: selectedEntry?.type === "order",
    refetchInterval: 4000,
  });

  useRideRealtime({
    rideId: selectedEntry?.type === "ride" ? selectedEntry.id : null,
    enabled: activeTab === "active" && selectedEntry?.type === "ride",
    onRideEvent: (payload) => {
      if (!payload?.ride || selectedEntry?.type !== "ride") return;
      queryClient.setQueryData(["rider-ride-focus", "ride", selectedEntry.id], (current) => ({ ...(current || {}), ...payload.ride }));
      queryClient.invalidateQueries({ queryKey: ["rider-ride-queue"] });
    },
  });
  useOrderRealtime({
    orderId: selectedEntry?.type === "order" ? selectedEntry.id : null,
    enabled: activeTab === "active" && selectedEntry?.type === "order",
    onOrderEvent: (payload) => {
      if (!payload?.order || selectedEntry?.type !== "order") return;
      queryClient.setQueryData(["rider-order-focus", "order", selectedEntry.id], (current) => ({ ...(current || {}), ...payload.order }));
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
    },
  });

  const focusedData = selectedEntry?.type === "ride"
    ? focusedRideQuery.data ?? selectedEntry?.data ?? null
    : focusedOrderQuery.data ?? selectedEntry?.data ?? null;

  const mapRide = useMemo(
    () => buildMapRide(selectedEntry?.type, focusedData, riderProfile),
    [focusedData, riderProfile, selectedEntry?.type],
  );
  const navigationTarget = useMemo(
    () => buildNavigationTarget(selectedEntry?.type, focusedData),
    [focusedData, selectedEntry?.type],
  );

  const updateMutation = useMutation({
    mutationFn: updateRiderOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
      queryClient.invalidateQueries({ queryKey: ["rider-order-focus"] });
    },
  });
  const updateRideMutation = useMutation({
    mutationFn: updateRideStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-ride-queue"] });
      queryClient.invalidateQueries({ queryKey: ["rider-ride-history"] });
      queryClient.invalidateQueries({ queryKey: ["rider-ride-focus"] });
    },
  });

  const activeCount = activeEntries.length;
  const completedCount = historyEntries.length;
  const totalLoads = activeEntries.length + historyEntries.length;
  const totalEarnings = visibleEntries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const actionSet = selectedEntry?.type === "ride" ? RIDE_STATUS_ACTIONS : ORDER_STATUS_ACTIONS;
  const isMutating = updateMutation.isPending || updateRideMutation.isPending;

  if (ordersQuery.isLoading || profileQuery.isLoading || rideQueueQuery.isLoading || rideHistoryQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6ef] px-6">
        <div className="rounded-[2rem] border border-[#d9dfc6] bg-white px-6 py-6 text-center max-w-sm w-full shadow-md">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#718355]">Dispatch Core</p>
          <div className="mx-auto my-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-[#ff8e14]" />
          <p className="text-base font-black text-[#14210f]">Syncing live jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6ef] text-[#14210f] pb-32 font-body antialiased selection:bg-orange-200">
      {/* Structural Background Canvas Overlay Blur */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(255,142,20,0.15),_transparent_50%),linear-gradient(180deg,_#14210f_0%,_#1e2d19_70%,_transparent_100%)]" />

      {/* Sticky Mobile Application Bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#14210f]/90 backdrop-blur-xl max-w-md mx-auto w-full">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-lg">west</span>
            </button>
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-[#f7b955]">Rider Terminal</p>
              <h1 className="text-sm font-black tracking-tight text-white truncate">Live Routes & Runs</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Primary Layout Block Stream Container */}
      <main className="relative z-10 max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Global Summary Metric Snapshot */}
        <section className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Shift Income Preview</p>
              <h3 className="text-xl font-black text-[#14210f]">{formatMoney(totalEarnings, "ZAR")}</h3>
            </div>
            <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl">
              <button 
                onClick={() => setActiveTab("active")} 
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === "active" ? "bg-white text-[#14210f] shadow-xs" : "text-slate-400"}`}
              >
                Active ({activeCount})
              </button>
              <button 
                onClick={() => setActiveTab("history")} 
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === "history" ? "bg-white text-[#14210f] shadow-xs" : "text-slate-400"}`}
              >
                History ({completedCount})
              </button>
            </div>
          </div>
        </section>

        {/* Core Live Map Component Wrapper */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-950 shadow-md relative group h-64 z-0">
          <RealtimeRideMap ride={mapRide} height={256} />
          {selectedEntry && (
            <button 
              onClick={() => setIsPanelExpanded(true)}
              className="absolute bottom-3 right-3 bg-[#14210f] text-white p-2 rounded-xl flex items-center justify-center gap-1.5 border border-white/10 shadow-lg active:scale-95 transition-all pointer-events-auto z-[999]"
            >
              <span className="material-symbols-outlined text-sm text-[#f7b955]">handyman</span>
              <span className="text-[9px] font-black uppercase tracking-widest">Controls</span>
            </button>
          )}
        </section>

        {/* Dynamic Route Job Feed Segment List */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Available Route Feed</h4>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md">Auto-updating</span>
          </div>

          <div className="space-y-2">
            {visibleEntries.length ? (
              visibleEntries.map((entry) => {
                const isSelected = entry.key === selectedEntry?.key;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => {
                      setSelectedKey(entry.key);
                      setIsPanelExpanded(true);
                    }}
                    className={`w-full rounded-2xl border p-3.5 text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? "border-[#f7b955] bg-white shadow-md ring-1 ring-[#f7b955]/30"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`h-9 w-9 flex items-center justify-center rounded-xl flex-shrink-0 ${
                          entry.type === "ride" ? "bg-[#14210f] text-[#f7b955]" : "bg-orange-50 text-[#ff8e14]"
                        }`}>
                          <span className="material-symbols-outlined text-lg">
                            {entry.type === "ride" ? "two_wheeler" : "inventory_2"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-[#14210f] truncate">{entry.title}</p>
                          <span className="inline-block text-[8px] font-black uppercase tracking-wider text-slate-400 mt-0.5">
                            {entry.status.replaceAll("_", " ")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-[#14210f]">{formatMoney(entry.amount, "ZAR")}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{entry.type}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-50 grid gap-1.5 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-xs text-slate-400 flex-shrink-0">person</span>
                        <span className="truncate font-medium">{entry.customerLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-xs text-[#ff8e14] flex-shrink-0">place</span>
                        <span className="truncate font-medium">{entry.destinationLabel}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <EmptyState
                icon="inventory"
                title={`No ${activeTab} operations`}
                body="Incoming delivery requests or transport dispatch routes will dynamically stack up inside this workflow panel feed."
              />
            )}
          </div>
        </section>
      </main>

      {/* Ergonomic Context Actions Sliding Panel Bottom Sheet */}
      {selectedEntry && (
        <div className={`fixed bottom-0 left-0 right-0 z-[2001] bg-white border-t border-slate-200 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] rounded-t-[2rem] transition-all duration-300 ease-in-out max-w-md mx-auto ${isPanelExpanded ? "h-[75vh]" : "h-0 overflow-hidden border-none"}`}>
          <div className="w-full py-3 flex flex-col items-center justify-center cursor-pointer" onClick={() => setIsPanelExpanded(false)}>
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1.5">Collapse Control Module</p>
          </div>

          <div className="overflow-y-auto px-4 pb-8 space-y-4 h-[calc(75vh-45px)]">
            <div className="bg-[#f7f3e8] rounded-2xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-[#14210f] truncate max-w-[180px]">{selectedEntry.title}</h3>
                <span className="rounded-md bg-[#14210f] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#f7b955]">
                  {selectedEntry.type === "ride" ? "Ride Sync" : "Order Run"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <SignalCard label="Est Duration" value={formatEta(focusedData?.estimated_arrival_seconds)} icon="schedule" />
                <SignalCard label="Last Signal" value={formatTimestamp(focusedData?.updated_at || focusedData?.created_at)} icon="update" />
              </div>

              <div className="space-y-1.5 pt-1 text-[11px]">
                <RouteLine icon="storefront" label="Pickup Location" value={selectedEntry.originLabel} />
                <RouteLine icon="near_me" label="Dropoff Target" value={selectedEntry.destinationLabel} />
              </div>
            </div>

            {/* Workflow Modifier Form Trigger Nodes */}
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Update Job Matrix</p>
              <div className="grid grid-cols-3 gap-1.5">
                {actionSet.map((action) => {
                  const isCurrent = selectedEntry.status === action.status;
                  return (
                    <button
                      key={action.status}
                      type="button"
                      disabled={isMutating || activeTab !== "active"}
                      onClick={() =>
                        selectedEntry.type === "ride"
                          ? updateRideMutation.mutate({
                              rideId: selectedEntry.id,
                              status: action.status,
                              tracking_note: action.status === "completed" ? "Ride completed." : "Ride status updated.",
                            })
                          : updateMutation.mutate({
                              orderId: selectedEntry.id,
                              status: action.status,
                              tracking_note: action.status === "delivered" ? "Delivered" : "Update",
                            })
                      }
                      className={`rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider transition truncate text-center ${
                        isCurrent ? "bg-[#14210f] text-white shadow-sm" : "border border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                    >
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Native Hardware Mapping Route Deep links */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {selectedEntry.type === "order" ? (
                <Link
                  to={`/rider/navigate/${selectedEntry.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ff8e14] py-3 text-[10px] font-black uppercase tracking-wider text-white shadow-sm text-center"
                >
                  <span className="material-symbols-outlined text-sm">navigation</span>
                  Core Nav
                </Link>
              ) : (
                <a
                  href={buildGoogleNavigationLink(navigationTarget)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ff8e14] py-3 text-[10px] font-black uppercase tracking-wider text-white shadow-sm text-center"
                >
                  <span className="material-symbols-outlined text-sm">route</span>
                  Google Maps
                </a>
              )}
              <button
                type="button"
                onClick={() => navigate("/rider/dashboard")}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-3 text-[10px] font-black uppercase tracking-wider text-slate-700"
              >
                <span className="material-symbols-outlined text-sm">dashboard</span>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Base Global Menu Navigation Stack */}
     
    </div>
  );
};

const SignalCard = ({ label, value, icon }) => (
  <div className="rounded-xl bg-white/80 border border-white p-2.5 shadow-xs">
    <div className="flex items-center gap-1 text-slate-400">
      <span className="material-symbols-outlined text-xs">{icon}</span>
      <p className="text-[8px] font-black uppercase tracking-wider">{label}</p>
    </div>
    <p className="mt-0.5 text-xs font-black text-[#14210f] truncate">{value}</p>
  </div>
);

const RouteLine = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 rounded-xl bg-white/50 px-2.5 py-1.5">
    <span className="material-symbols-outlined text-xs text-[#ff8e14] mt-0.5 flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[7px] font-black uppercase tracking-wider text-slate-400 leading-none">{label}</p>
      <p className="truncate text-[11px] font-bold text-slate-700 mt-0.5">{value}</p>
    </div>
  </div>
);

const EmptyState = ({ icon, title, body }) => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center px-4">
    <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">{icon}</span>
    <p className="text-xs font-black text-[#14210f] uppercase tracking-wide">{title}</p>
    <p className="mt-1 text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">{body}</p>
  </div>
);

const NavItem = ({ to, icon, active = false }) => (
  <Link
    to={to}
    className={`flex h-11 w-11 flex-col items-center justify-center rounded-xl transition-all ${
      active ? "text-[#ff8e14]" : "text-slate-400 active:text-slate-900"
    }`}
  >
    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
      {icon}
    </span>
  </Link>
);

const formatTimestamp = (rawStr) => {
  if (!rawStr) return "Just now";
  try {
    const time = new Date(rawStr);
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return "Recent";
  }
};

const buildEntry = (type, data) => ({
  key: `${type}-${type === "ride" ? data.ride_id : data.id}`,
  type,
  id: type === "ride" ? data.ride_id : data.id,
  data,
  amount: Number(type === "ride" ? data.price : data.total_amount || 0),
  status: data.status || "pending",
  title: type === "ride" ? `Ride Run` : data.order_reference || `Order #${data.id}`,
  customerLabel: type === "ride" ? data.customer?.full_name || "Customer" : data.customer?.full_name || data.customer_name || "Customer",
  originLabel: type === "ride" ? data.pickup?.address || "Pickup pending" : data.vendor?.name || data.vendor_name || "Vendor pending",
  destinationLabel: type === "ride" ? data.dropoff?.address || "Dropoff pending" : data.address?.address_line || data.address?.formatted_address || data.address?.label || data.delivery_address || "Customer destination",
  updatedAt: data.updated_at || data.created_at || null,
});

const sortEntries = (left, right) => {
  const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
  const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
  return rightTime - leftTime;
};

const toNumber = (value) => {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const buildMapRide = (type, data, riderProfile) => {
  if (!type || !data) return null;

  if (type === "ride") {
    const riderLat = toNumber(data.rider_location?.latitude ?? data.rider?.current_latitude ?? riderProfile?.current_latitude);
    const riderLng = toNumber(data.rider_location?.longitude ?? data.rider?.current_longitude ?? riderProfile?.current_longitude);
    const pickupLat = toNumber(data.pickup?.latitude);
    const pickupLng = toNumber(data.pickup?.longitude);
    const dropoffLat = toNumber(data.dropoff?.latitude);
    const dropoffLng = toNumber(data.dropoff?.longitude);

    return {
      ...data,
      pickup: pickupLat != null && pickupLng != null ? { ...data.pickup, latitude: pickupLat, longitude: pickupLng } : null,
      dropoff: dropoffLat != null && dropoffLng != null ? { ...data.dropoff, latitude: dropoffLat, longitude: dropoffLng } : null,
      rider_location: riderLat != null && riderLng != null ? { latitude: riderLat, longitude: riderLng } : null,
      route_geometry: Array.isArray(data.route_geometry) ? data.route_geometry : [],
    };
  }

  const riderLat = toNumber(data.tracking_latitude ?? data.rider_location?.latitude ?? riderProfile?.current_latitude);
  const riderLng = toNumber(data.tracking_longitude ?? data.rider_location?.longitude ?? riderProfile?.current_longitude);
  const pickupLat = toNumber(data.vendor?.latitude ?? data.pickup?.latitude);
  const pickupLng = toNumber(data.vendor?.longitude ?? data.pickup?.longitude);
  const dropoffLat = toNumber(data.destination_latitude ?? data.address?.latitude);
  const dropoffLng = toNumber(data.destination_longitude ?? data.address?.longitude);

  return {
    status: data.status,
    route_geometry: Array.isArray(data.route_geometry) ? data.route_geometry : [],
    pickup: pickupLat != null && pickupLng != null
      ? {
          latitude: pickupLat,
          longitude: pickupLng,
          address: data.vendor?.name || data.vendor_name || "Vendor pickup",
        }
      : null,
    dropoff: dropoffLat != null && dropoffLng != null
      ? {
          latitude: dropoffLat,
          longitude: dropoffLng,
          address: data.address?.address_line || data.address?.formatted_address || data.delivery_address || "Customer destination",
        }
      : null,
    rider_location: riderLat != null && riderLng != null ? { latitude: riderLat, longitude: riderLng } : null,
    rider: riderProfile?.full_name ? { full_name: riderProfile.full_name } : null,
  };
};

const buildNavigationTarget = (type, data) => {
  if (!type || !data) return { latitude: null, longitude: null, address: "" };

  if (type === "ride") {
    const shouldHeadToPickup = ["accepted", "arriving"].includes(data.status);
    const point = shouldHeadToPickup ? data.pickup : data.dropoff;
    return {
      latitude: toNumber(point?.latitude),
      longitude: toNumber(point?.longitude),
      address: point?.address || "",
    };
  }

  const shouldHeadToVendor = ["rider_assigned", "on_the_way"].includes(data.status);
  return {
    latitude: toNumber(shouldHeadToVendor ? (data.vendor?.latitude ?? data.pickup?.latitude) : (data.destination_latitude ?? data.address?.latitude)),
    longitude: toNumber(shouldHeadToVendor ? (data.vendor?.longitude ?? data.pickup?.longitude) : (data.destination_longitude ?? data.address?.longitude)),
    address: shouldHeadToVendor
      ? (data.vendor?.name || "Vendor location")
      : (data.address?.address_line || data.address?.formatted_address || "Customer dropoff"),
  };
};