import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { fetchRiderTracking, updateRiderLocation, updateRiderOrder } from "../api/rider";
import { RiderShell } from "../components/rider/RiderShell";
import { LiveRiderMap } from "../components/tracking/LiveRiderMap";

export const RiderNavigatePage = () => {
  const { orderId } = useParams();
  const queryClient = useQueryClient();
  const [geoMessage, setGeoMessage] = useState("Waiting for GPS lock…");
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  const trackingQuery = useQuery({
    queryKey: ["rider-tracking", orderId],
    queryFn: () => fetchRiderTracking(orderId),
    enabled: Boolean(orderId),
    refetchInterval: 5000,
  });

  const locationMutation = useMutation({
    mutationFn: updateRiderLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-tracking", orderId] });
      queryClient.invalidateQueries({ queryKey: ["tracking", String(orderId)] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-detail", String(orderId)] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateRiderOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rider-tracking", orderId] });
      queryClient.invalidateQueries({ queryKey: ["rider-orders"] });
      queryClient.invalidateQueries({ queryKey: ["tracking", String(orderId)] });
      queryClient.invalidateQueries({ queryKey: ["admin-order-detail", String(orderId)] });
    },
  });

  const order = trackingQuery.data;

  useEffect(() => {
    if (!orderId || !navigator.geolocation) {
      setGeoMessage("Geolocation is not supported on this device.");
      return undefined;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        if (now - lastSentRef.current < 5000) {
          return;
        }
        lastSentRef.current = now;
        setGeoMessage("Live location is being shared.");
        locationMutation.mutate({
          orderId: Number(orderId),
          tracking_latitude: position.coords.latitude,
          tracking_longitude: position.coords.longitude,
        });
      },
      (error) => {
        setGeoMessage(error.message || "Unable to access device location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000,
      },
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [locationMutation, orderId]);

  return (
    <RiderShell title="Navigate" subtitle="This page publishes your live location for customer and admin tracking." active="orders" back>
      <LiveRiderMap
        latitude={order?.tracking_latitude}
        longitude={order?.tracking_longitude}
        riderName={order?.rider?.full_name || "You"}
        status={order?.status}
        title={order?.order_reference || "Live delivery"}
        subtitle="Shared rider map"
      />

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Shared Status</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-900">{order?.status?.replaceAll("_", " ") || "Loading"}</h3>
          <p className="mt-3 rounded-[1.5rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
            {order?.tracking_note || "Push live updates so the customer always sees where the order is."}
          </p>
          <p className="mt-4 text-sm font-medium text-emerald-600">{geoMessage}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { status: "rider_assigned", label: "Assigned", note: "Rider assigned and moving to pickup." },
              { status: "on_the_way", label: "On The Way", note: "Rider is currently on the way." },
              { status: "delivered", label: "Delivered", note: "Order delivered successfully." },
            ].map((action) => (
              <button
                key={action.status}
                disabled={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    orderId: Number(orderId),
                    status: action.status,
                    tracking_note: action.note,
                    tracking_latitude: order?.tracking_latitude,
                    tracking_longitude: order?.tracking_longitude,
                  })
                }
                className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest ${
                  order?.status === action.status ? "bg-[#ff9300] text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">People in this trip</p>
          <div className="mt-4 space-y-3">
            <ContactCard title="Customer" value={order?.customer?.full_name} meta={order?.customer?.phone || order?.customer?.email} />
            <ContactCard title="Vendor" value={order?.vendor?.name} meta={order?.address?.line1} />
            <ContactCard title="Rider" value={order?.rider?.full_name || "You"} meta={order?.rider?.phone || "Live dispatch"} />
          </div>
        </div>
      </section>
    </RiderShell>
  );
};

const ContactCard = ({ title, value, meta }) => (
  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
    <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
    <p className="mt-1 text-xs text-slate-500">{meta}</p>
  </div>
);
