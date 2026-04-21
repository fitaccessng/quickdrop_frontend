import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchAdminRiders } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { formatMoney } from "../lib/utils";

export const AdminRidersPage = () => {
  const ridersQuery = useQuery({ queryKey: ["admin-riders"], queryFn: fetchAdminRiders });

  return (
    <AdminShell title="Riders" subtitle="Manage rider accounts, delivery status, and rider profile access.">
      <div className="space-y-4">
        {(ridersQuery.data ?? []).map((rider) => (
          <div key={rider.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${rider.rider_status === "offline" ? "text-slate-500" : "text-[#ff9300]"}`}>
                  {rider.rider_status || "offline"}
                </p>
                <h3 className="mt-2 text-xl font-extrabold text-slate-900">{rider.full_name}</h3>
                <p className="mt-1 text-sm text-slate-500">{rider.email} • {rider.vehicle_type || "No vehicle set"}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-600">
                  {formatMoney(rider.total_earnings ?? 0)}
                </span>
                <Link to={`/admin/users/${rider.id}`} className="rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white">
                  Rider Info
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
};
