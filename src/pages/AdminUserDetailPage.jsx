import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchAdminOrders, fetchAdminUserDetail } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { formatMoney } from "../lib/utils";

export const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const userQuery = useQuery({
    queryKey: ["admin-user-detail", userId],
    queryFn: () => fetchAdminUserDetail(userId),
    enabled: Boolean(userId),
  });
  const ordersQuery = useQuery({
    queryKey: ["admin-orders", "all"],
    queryFn: () => fetchAdminOrders({ status: "all" }),
  });
  const user = userQuery.data;
  const activeTrackedOrder = (ordersQuery.data ?? []).find(
    (order) =>
      order.rider?.id === Number(userId) &&
      ["rider_assigned", "on_the_way"].includes(order.status),
  );

  return (
    <AdminShell title="User Detail" subtitle="Account, contact, and operational metadata for one user.">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] bg-slate-900 p-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9300]">{user?.role}</p>
          <h3 className="mt-3 text-3xl font-extrabold">{user?.full_name}</h3>
          <p className="mt-2 text-sm text-slate-300">{user?.email}</p>
          {activeTrackedOrder ? (
            <Link
              to={`/admin/orders/${activeTrackedOrder.id}/track`}
              className="mt-5 inline-flex rounded-2xl bg-[#ff9300] px-4 py-3 text-xs font-black uppercase tracking-widest text-white"
            >
              Track Live Delivery
            </Link>
          ) : null}
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Phone" value={user?.phone} />
            <Info label="City" value={user?.city} />
            <Info label="State" value={user?.state} />
            <Info label="Street" value={user?.street} />
            <Info label="Vehicle" value={user?.vehicle_type} />
            <Info label="License" value={user?.license_number} />
            <Info label="Rider Status" value={user?.rider_status} />
            <Info label="Wallet" value={formatMoney(user?.wallet_balance ?? 0)} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-bold text-slate-900">{value || "Not set"}</p>
  </div>
);
