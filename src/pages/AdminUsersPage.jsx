import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { fetchAdminUsers } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";

export const AdminUsersPage = () => {
  const usersQuery = useQuery({ queryKey: ["admin-users"], queryFn: () => fetchAdminUsers({ role: "customer" }) });

  return (
    <AdminShell title="Users" subtitle="Customer records, account state, and user detail access.">
      <div className="space-y-4">
        {(usersQuery.data ?? []).map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded-[2rem] border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <div>
              <p className="text-sm font-bold text-slate-900">{user.full_name}</p>
              <p className="mt-1 text-sm text-slate-500">{user.email}</p>
            </div>
            <Link to={`/admin/users/${user.id}`} className="rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white">
              Details
            </Link>
          </div>
        ))}
      </div>
    </AdminShell>
  );
};
