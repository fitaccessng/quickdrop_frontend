import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { assignRideManually, fetchAdminLiveRides } from "../api/rides";
import { assignAdminRider, fetchAdminOrders } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { RealtimeRideMap } from "../components/tracking/RealtimeRideMap";
import { useRideRealtime } from "../hooks/useRideRealtime";
import { formatEta, formatMoney } from "../lib/rideMaps";

export const AdminRideOperationsPage = () => {
  const queryClient = useQueryClient();
  const [selectedRideId, setSelectedRideId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedType, setSelectedType] = useState("ride");
  const [message, setMessage] = useState("");

  const liveQuery = useQuery({
    queryKey: ["admin-live-rides"],
    queryFn: fetchAdminLiveRides,
    refetchInterval: 15000,
  });
  const orderRequestsQuery = useQuery({
    queryKey: ["admin-ride-ops-orders"],
    queryFn: () => fetchAdminOrders({ status: "all" }),
    refetchInterval: 10000,
  });

  useRideRealtime({
    admin: true,
    enabled: true,
    onRideEvent: (payload) => {
      if (payload.rides) {
        queryClient.setQueryData(["admin-live-rides"], (current) => {
          if (payload.event === "ride.bootstrap") {
            return {
              ...(current || {}),
              active_rides: payload.rides,
              active_riders: current?.active_riders || [],
            };
          }
          const currentRides = current?.active_rides || [];
          const updates = new Map(payload.rides.map((ride) => [ride.ride_id, ride]));
          const merged = currentRides.map((ride) => updates.get(ride.ride_id) ? { ...ride, ...updates.get(ride.ride_id) } : ride);
          payload.rides.forEach((ride) => {
            if (!currentRides.some((currentRide) => currentRide.ride_id === ride.ride_id)) {
              merged.unshift(ride);
            }
          });
          return {
            ...(current || {}),
            active_rides: merged,
            active_riders: current?.active_riders || [],
          };
        });
      }
      if (payload.ride) {
        queryClient.setQueryData(["admin-live-rides"], (current) => {
          const rides = current?.active_rides || [];
          const existing = rides.find((ride) => ride.ride_id === payload.ride.ride_id);
          const nextRide = existing ? { ...existing, ...payload.ride } : payload.ride;
          const next = [nextRide, ...rides.filter((ride) => ride.ride_id !== payload.ride.ride_id)];
          return { ...(current || {}), active_rides: next };
        });
      }
    },
  });

  const rides = liveQuery.data?.active_rides || [];
  const riders = liveQuery.data?.active_riders || [];
  const orderRequests = useMemo(
    () =>
      (orderRequestsQuery.data || []).filter(
        (order) =>
          ["confirmed", "preparing", "rider_assigned", "on_the_way"].includes(order.status)
      ),
    [orderRequestsQuery.data]
  );
  const selectedRide = useMemo(
    () => (selectedType === "ride" ? rides.find((ride) => ride.ride_id === selectedRideId) || rides[0] || null : null),
    [rides, selectedRideId, selectedType]
  );
  const selectedOrder = useMemo(
    () => (selectedType === "order" ? orderRequests.find((order) => order.id === selectedOrderId) || orderRequests[0] || null : null),
    [orderRequests, selectedOrderId, selectedType]
  );
  const rankedRiders = useMemo(() => {
    if (!selectedRide) return riders;
    return [...riders].sort((left, right) => {
      const leftDistance = getDistanceKm(left, selectedRide);
      const rightDistance = getDistanceKm(right, selectedRide);
      return leftDistance - rightDistance;
    });
  }, [riders, selectedRide]);

  const assignMutation = useMutation({
    mutationFn: assignRideManually,
    onSuccess: () => {
      setMessage("Rider assigned successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-live-rides"] });
      queryClient.invalidateQueries({ queryKey: ["admin-ride-ops-orders"] });
    },
    onError: (error) => {
      setMessage(error?.response?.data?.detail || "Unable to assign rider right now.");
    },
  });
  const assignOrderMutation = useMutation({
    mutationFn: assignAdminRider,
    onSuccess: () => {
      setMessage("Order rider assigned successfully.");
      setSelectedOrderId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-ride-ops-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
    },
    onError: (error) => {
      setMessage(error?.response?.data?.detail || "Unable to assign rider to order right now.");
    },
  });

  useEffect(() => {
    if (selectedType === "ride" && !rides.length && orderRequests.length) {
      setSelectedType("order");
      setSelectedOrderId(orderRequests[0].id);
    }
    if (selectedType === "order" && !orderRequests.length && rides.length) {
      setSelectedType("ride");
      setSelectedRideId(rides[0].ride_id);
    }
  }, [orderRequests, rides, selectedType]);

  return (
    <AdminShell title="Ride Operations" subtitle="Monitor live ride requests, assign riders to order requests, and keep dispatch connected to the rider backend.">
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <RealtimeRideMap ride={selectedRide} />
          <div className="grid gap-4 md:grid-cols-3">
            <OpsMetric label="Active Trips" value={String(rides.length)} />
            <OpsMetric label="Open Order Requests" value={String(orderRequests.length)} />
            <OpsMetric label="Live Riders" value={String(riders.length)} />
            <OpsMetric label="Focused ETA" value={formatEta(selectedRide?.estimated_arrival_seconds)} />
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Active Trips</p>
            <div className="mt-4 space-y-3">
              {rides.map((ride) => (
                <button
                  key={ride.ride_id}
                  onClick={() => {
                    setSelectedType("ride");
                    setSelectedRideId(ride.ride_id);
                    setSelectedOrderId(null);
                  }}
                  className={`w-full rounded-[1.5rem] border p-4 text-left ${selectedRide?.ride_id === ride.ride_id ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-slate-50"}`}
                >
                  <p className="text-sm font-black text-slate-900">{ride.customer?.full_name || "Customer"} • {ride.status.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatMoney(ride.price, ride.currency)} • {ride.pickup.address}</p>
                  {ride.customer_note ? <p className="mt-2 text-xs text-slate-600">Note: {ride.customer_note}</p> : null}
                </button>
              ))}
              {!rides.length ? <EmptyPanel text="No active rides right now." /> : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Order Requests</p>
            <div className="mt-4 space-y-3">
              {orderRequests.map((order) => (
                <button
                  key={order.id}
                  onClick={() => {
                    setSelectedType("order");
                    setSelectedOrderId(order.id);
                    setSelectedRideId(null);
                  }}
                  className={`w-full rounded-[1.5rem] border p-4 text-left ${selectedOrder?.id === order.id ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-slate-50"}`}
                >
                  <p className="text-sm font-black text-slate-900">{order.order_reference} • {order.status.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.vendor_name} • {order.customer_name}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatMoney(order.total_amount)}</p>
                  {order.items?.length ? (
                    <p className="mt-2 text-xs text-slate-600">
                      {order.items.map((item) => `${item.quantity}x ${item.product_name}`).join(", ")}
                    </p>
                  ) : null}
                </button>
              ))}
              {!orderRequests.length ? <EmptyPanel text="No order requests are waiting for rider assignment." /> : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Manual Assignment</p>
            {selectedRide || selectedOrder ? (
              <div className="mt-4 space-y-3">
                {message ? <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}
                {selectedRide ? (
                  <div className="rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-black text-slate-900">Ride request details</p>
                    <p className="mt-2">Pickup: {selectedRide.pickup.address}</p>
                    <p>Dropoff: {selectedRide.dropoff.address}</p>
                    <p>Vehicle: {selectedRide.vehicle_type.toUpperCase()}</p>
                    {selectedRide.customer_note ? <p>Rider note: {selectedRide.customer_note}</p> : null}
                    {selectedRide.receiver_name ? <p>Receiver: {selectedRide.receiver_name}</p> : null}
                    {selectedRide.receiver_phone ? <p>Receiver phone: {selectedRide.receiver_phone}</p> : null}
                  </div>
                ) : null}
                {selectedOrder ? (
                  <div className="rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-black text-slate-900">Order request details</p>
                    <p className="mt-2">Order: {selectedOrder.order_reference}</p>
                    <p>Vendor: {selectedOrder.vendor_name}</p>
                    <p>Customer: {selectedOrder.customer_name}</p>
                    <p>Total: {formatMoney(selectedOrder.total_amount)}</p>
                    {selectedOrder.items?.length ? (
                      <p className="mt-2">Items: {selectedOrder.items.map((item) => `${item.quantity}x ${item.product_name}`).join(", ")}</p>
                    ) : null}
                  </div>
                ) : null}
                {rankedRiders.map((rider) => (
                  <button
                    key={rider.id}
                    onClick={() => {
                      setMessage("");
                      if (selectedOrder?.id) {
                        assignOrderMutation.mutate({ orderId: selectedOrder.id, rider_id: rider.id });
                        return;
                      }
                      if (selectedRide?.ride_id) {
                        assignMutation.mutate({ rideId: selectedRide.ride_id, rider_id: rider.id });
                      }
                    }}
                    disabled={(assignMutation.isPending || assignOrderMutation.isPending) || !isAssignableRider(rider)}
                    className="flex w-full items-center justify-between rounded-[1.25rem] bg-slate-50 px-4 py-3 text-left disabled:opacity-50"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">{rider.full_name}</p>
                      <p className="text-xs text-slate-500">{rider.vehicle_type || "Rider"} • {rider.phone || "No phone"}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatRiderStatus(rider.rider_status)} • {selectedRide ? formatRiderDistance(rider, selectedRide) : "Order dispatch"}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Live: {formatCoords(rider.current_latitude, rider.current_longitude)}
                      </p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-orange-500">
                      {isAssignableRider(rider) ? "Assign" : "Unavailable"}
                    </span>
                  </button>
                ))}
              </div>
            ) : <EmptyPanel text="Select a ride or order request to assign a rider manually." />}
          </section>
        </div>
      </section>
    </AdminShell>
  );
};

const OpsMetric = ({ label, value }) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
  </div>
);

const EmptyPanel = ({ text }) => (
  <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
    {text}
  </div>
);

const formatRiderStatus = (status) => (status || "offline").replaceAll("_", " ");

const formatCoords = (latitude, longitude) => (
  latitude == null || longitude == null ? "No live location yet" : `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`
);

const getDistanceKm = (rider, ride) => {
  if (rider?.current_latitude == null || rider?.current_longitude == null || !ride?.pickup) return Number.POSITIVE_INFINITY;
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(ride.pickup.latitude - rider.current_latitude);
  const dLon = toRad(ride.pickup.longitude - rider.current_longitude);
  const lat1 = toRad(rider.current_latitude);
  const lat2 = toRad(ride.pickup.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const formatRiderDistance = (rider, ride) => {
  const distance = getDistanceKm(rider, ride);
  return Number.isFinite(distance) ? `${distance.toFixed(1)} km away` : "Distance unavailable";
};

const isAssignableRider = (rider) =>
  ["available", "online"].includes(rider?.rider_status) &&
  rider?.current_latitude != null &&
  rider?.current_longitude != null;
