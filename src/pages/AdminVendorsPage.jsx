import React from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { approveAdminVendor, fetchAdminVendors } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";

export const AdminVendorsPage = () => {
  const queryClient = useQueryClient();
  const vendorsQuery = useQuery({ queryKey: ["admin-vendors"], queryFn: fetchAdminVendors });
  const approveMutation = useMutation({
    mutationFn: approveAdminVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-vendors"] }),
  });

  return (
    <AdminShell title="Vendor Approvals" subtitle="Review vendor onboarding status and publish approved storefronts.">
      <div className="space-y-4">
        {(vendorsQuery.data ?? []).map((vendor) => (
          <div key={vendor.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{vendor.category}</p>
                <h3 className="mt-2 text-xl font-extrabold text-slate-900">{vendor.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{vendor.email} • {vendor.city}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/admin/vendors/${vendor.id}/analytics`} className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700">
                  Analytics
                </Link>
                <button
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate({ vendorId: vendor.id, is_approved: !vendor.is_approved })}
                  className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest ${vendor.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-[#ff9300] text-white"}`}
                >
                  {vendor.is_approved ? "Approved" : "Approve"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
};
