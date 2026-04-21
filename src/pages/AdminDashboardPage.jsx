import React from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAdminDashboard } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { formatMoney } from "../lib/utils";

export const AdminDashboardPage = () => {
  const dashboardQuery = useQuery({ queryKey: ["admin-dashboard"], queryFn: fetchAdminDashboard });
  const stats = dashboardQuery.data || {};

  return (
    <AdminShell title="Dashboard" subtitle="Platform-wide overview across vendors, users, riders, and orders.">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-7">
        <StatCard label="Users" value={stats.total_users ?? 0} />
        <StatCard label="Vendors" value={stats.total_vendors ?? 0} />
        <StatCard label="Pending Vendors" value={stats.pending_vendors ?? 0} accent />
        <StatCard label="Riders" value={stats.total_riders ?? 0} />
        <StatCard label="Active Orders" value={stats.active_orders ?? 0} />
        <StatCard label="Completed Orders" value={stats.completed_orders ?? 0} />
        <StatCard label="Payout Requests" value={stats.payout_requests_pending ?? 0} accent />
      </div>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">Payment Requests</p>
        <div className="mt-4 space-y-3">
          {(stats.recent_payout_requests ?? []).map((request) => (
            <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-slate-50 px-4 py-4">
              <div>
                <p className="text-sm font-extrabold text-slate-900">{request.requester_name}</p>
                <p className="mt-1 text-xs text-slate-500">{request.requester_role} • {request.requester_email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold text-slate-900">{formatMoney(request.amount)}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#ff9300]">{request.status}</p>
              </div>
            </div>
          ))}
          {!stats.recent_payout_requests?.length ? <p className="text-sm text-slate-500">No payout requests yet.</p> : null}
        </div>
      </section>
    </AdminShell>
  );
};

const StatCard = ({ label, value, accent }) => (
  <div className={`rounded-[1.75rem] border p-5 shadow-sm ${accent ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
  </div>
);
