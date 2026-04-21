import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchAdminOrderDetail } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { LiveRiderMap } from "../components/tracking/LiveRiderMap";

export const AdminTrackRiderPage = () => {
  const { orderId } = useParams();
  const orderQuery = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: () => fetchAdminOrderDetail(orderId),
    enabled: Boolean(orderId),
    refetchInterval: 8000,
  });
  const order = orderQuery.data;

  return (
    <AdminShell title="Track Rider" subtitle="Live rider assignment and delivery tracking for an order.">
      <LiveRiderMap
        latitude={order?.tracking_latitude}
        longitude={order?.tracking_longitude}
        riderName={order?.rider?.full_name}
        status={order?.status}
        title={order?.order_reference || "Order"}
        subtitle="Admin live route"
        heightClassName="h-[360px]"
      />

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Delivery Status</p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate-900">{order?.status?.replaceAll("_", " ") || "Loading"}</h3>
          <p className="mt-4 rounded-[1.5rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
            {order?.tracking_note || "Waiting for a rider update."}
          </p>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rider</p>
          <h3 className="mt-2 text-2xl font-extrabold text-slate-900">{order?.rider?.full_name || "No rider assigned"}</h3>
          <p className="mt-2 text-sm text-slate-500">{order?.rider?.phone || "No contact yet"}</p>
          <p className="mt-4 text-sm text-slate-500">Tracking coordinates: {order?.tracking_latitude ?? "N/A"}, {order?.tracking_longitude ?? "N/A"}</p>
        </div>
      </section>
    </AdminShell>
  );
};
