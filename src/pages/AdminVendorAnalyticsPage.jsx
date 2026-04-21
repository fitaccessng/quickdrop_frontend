import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { fetchAdminVendorAnalytics } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { formatMoney } from "../lib/utils";

export const AdminVendorAnalyticsPage = () => {
  const { vendorId } = useParams();
  const analyticsQuery = useQuery({
    queryKey: ["admin-vendor-analytics", vendorId],
    queryFn: () => fetchAdminVendorAnalytics(vendorId),
    enabled: Boolean(vendorId),
  });
  const analytics = analyticsQuery.data;

  return (
    <AdminShell title="Vendor Analytics" subtitle="Performance view for one vendor across orders and revenue.">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Orders" value={analytics?.total_orders ?? 0} />
        <MetricCard label="Completed" value={analytics?.completed_orders ?? 0} />
        <MetricCard label="Pending" value={analytics?.pending_orders ?? 0} />
        <MetricCard label="Revenue" value={formatMoney(analytics?.total_revenue ?? 0)} />
      </div>
      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900">{analytics?.vendor_name || "Vendor"}</h3>
        <p className="mt-2 text-sm text-slate-500">Average order value: {formatMoney(analytics?.average_order_value ?? 0)}</p>
        <div className="mt-5 space-y-3">
          {(analytics?.top_products ?? []).map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-4">
              <div>
                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.units} units sold</p>
              </div>
              <p className="text-sm font-black text-slate-900">{formatMoney(item.revenue)}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
  </div>
);
