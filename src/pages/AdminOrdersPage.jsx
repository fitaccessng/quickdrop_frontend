import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { assignAdminRider, fetchAdminOrders, fetchAdminRiders } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { formatMoney } from "../lib/utils";

export const AdminOrdersPage = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const isHistory = location.pathname.includes("/history");
  const status = isHistory ? "delivered" : "all";
  const ordersQuery = useQuery({ queryKey: ["admin-orders", status], queryFn: () => fetchAdminOrders({ status }) });
  const ridersQuery = useQuery({ queryKey: ["admin-riders"], queryFn: fetchAdminRiders });
  const assignMutation = useMutation({
    mutationFn: assignAdminRider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  return (
    <AdminShell title={isHistory ? "Order History" : "Orders"} subtitle="Monitor current orders, assign riders, and track delivery state.">
      <div className="mb-4 flex gap-2">
        <Link to="/admin/orders" className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest ${!isHistory ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}>Live Orders</Link>
        <Link to="/admin/orders/history" className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest ${isHistory ? "bg-slate-900 text-white" : "bg-white text-slate-700"}`}>History</Link>
      </div>
      <div className="space-y-4">
        {(ordersQuery.data ?? []).map((order) => (
          <div key={order.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9300]">{order.status.replaceAll("_", " ")}</p>
                <h3 className="mt-2 text-xl font-extrabold text-slate-900">{order.order_reference}</h3>
                <p className="mt-1 text-sm text-slate-500">{order.vendor_name} • {order.customer_name}</p>
              </div>
              <p className="text-lg font-black text-slate-900">{formatMoney(order.total_amount)}</p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600">
                Rider: {order.rider?.full_name || "Unassigned"}
              </span>
              {!isHistory ? (
                <select
                  defaultValue=""
                  disabled={assignMutation.isPending}
                  onChange={(event) => {
                    if (!event.target.value) return;
                    assignMutation.mutate({ orderId: order.id, rider_id: Number(event.target.value) });
                  }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  <option value="">Assign rider</option>
                  {(ridersQuery.data ?? []).map((rider) => (
                    <option key={rider.id} value={rider.id} disabled={rider.rider_status === "offline"}>
                      {rider.full_name} {rider.rider_status === "offline" ? "(offline)" : ""}
                    </option>
                  ))}
                </select>
              ) : null}
              {order.rider ? (
                <Link to={`/admin/orders/${order.id}/track`} className="rounded-2xl bg-[#ff9300] px-4 py-3 text-xs font-black uppercase tracking-widest text-white">
                  Track Live
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
};
