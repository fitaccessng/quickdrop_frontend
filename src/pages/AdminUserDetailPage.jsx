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
          {user?.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="mb-4 h-16 w-16 rounded-2xl object-cover" /> : null}
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9300]">{user?.role}</p>
          <h3 className="mt-3 text-3xl font-extrabold">{user?.full_name}</h3>
          <p className="mt-2 text-sm text-slate-300">{user?.email}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
            {user?.is_active ? "Active account" : "Inactive account"} • {user?.is_onboarded ? "Onboarded" : "Not onboarded"}
          </p>
          <p className="mt-2 text-xs text-slate-400">Joined {user?.created_at ? new Date(user.created_at).toLocaleString() : "Unknown"}</p>
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
            <Info label="Email" value={user?.email} />
            <Info label="Role" value={user?.role} />
            <Info label="City" value={user?.city} />
            <Info label="State" value={user?.state} />
            <Info label="Street" value={user?.street} />
            <Info label="PO Box" value={user?.po_box} />
            <Info label="Vehicle" value={user?.vehicle_type} />
            <Info label="License" value={user?.license_number} />
            <Info label="Rider Status" value={user?.rider_status} />
            <Info label="Account Status" value={user?.is_active ? "Active" : "Inactive"} />
            <Info label="Onboarding" value={user?.is_onboarded ? "Completed" : "Pending"} />
            <Info label="Wallet" value={formatMoney(user?.wallet_balance ?? 0)} />
            <Info label="Total Earnings" value={formatMoney(user?.total_earnings ?? 0)} />
            <Info label="Total Deliveries" value={user?.total_deliveries ?? 0} />
            <Info label="Latitude" value={user?.current_latitude} />
            <Info label="Longitude" value={user?.current_longitude} />
            <Info label="Last Updated" value={user?.updated_at ? new Date(user.updated_at).toLocaleString() : null} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Saved Addresses</h3>
          <div className="mt-5 space-y-3">
            {(user?.addresses ?? []).map((address) => (
              <div key={address.id} className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <p className="text-sm font-bold text-slate-900">{address.label}{address.is_default ? " • Default" : ""}</p>
                <p className="mt-1 text-xs text-slate-600">{address.recipient_name} • {address.phone || "No phone"}</p>
                <p className="mt-2 text-sm text-slate-600">{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
                <p className="text-sm text-slate-600">{address.city}, {address.state} {address.postal_code || ""}</p>
                {(address.latitude != null || address.longitude != null) ? (
                  <p className="mt-2 text-xs font-bold text-slate-500">Coordinates: {address.latitude ?? "N/A"}, {address.longitude ?? "N/A"}</p>
                ) : null}
                {address.delivery_notes ? <p className="mt-2 text-xs font-bold text-slate-500">Notes: {address.delivery_notes}</p> : null}
              </div>
            ))}
            {!user?.addresses?.length ? <p className="text-sm text-slate-500">No saved addresses.</p> : null}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Recent Orders</h3>
          <div className="mt-5 space-y-3">
            {(user?.recent_orders ?? []).map((order) => (
              <div key={order.id} className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{order.order_reference}</p>
                    <p className="text-xs text-slate-500">{order.vendor_name} • {order.status}</p>
                  </div>
                  <p className="text-sm font-black text-slate-900">{formatMoney(order.total_amount)}</p>
                </div>
                {order.tracking_note ? <p className="mt-2 text-xs text-slate-500">{order.tracking_note}</p> : null}
              </div>
            ))}
            {!user?.recent_orders?.length ? <p className="text-sm text-slate-500">No recent orders recorded.</p> : null}
          </div>
        </section>
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
