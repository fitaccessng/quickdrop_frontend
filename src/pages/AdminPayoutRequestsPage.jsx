import React, { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchAdminPayoutRequests, updateAdminPayoutRequest } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { formatMoney } from "../lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "paid", label: "Paid" },
  { id: "rejected", label: "Rejected" },
];

export const AdminPayoutRequestsPage = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = React.useState("all");
  const payoutQuery = useQuery({
    queryKey: ["admin-payout-requests"],
    queryFn: fetchAdminPayoutRequests,
    refetchInterval: 15000,
  });

  const updateMutation = useMutation({
    mutationFn: updateAdminPayoutRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payout-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const requests = payoutQuery.data ?? [];
  const filteredRequests = useMemo(
    () => requests.filter((request) => activeFilter === "all" || request.status === activeFilter),
    [activeFilter, requests],
  );

  return (
    <AdminShell title="Withdrawal Requests" subtitle="Review rider and vendor withdrawal requests in one place.">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Total" value={requests.length} />
        <MetricCard label="Riders" value={requests.filter((item) => item.requester_role === "rider").length} />
        <MetricCard label="Vendors" value={requests.filter((item) => item.requester_role === "vendor").length} />
        <MetricCard label="Pending" value={requests.filter((item) => item.status === "pending").length} accent />
      </div>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-black uppercase tracking-widest ${
                activeFilter === filter.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {filteredRequests.map((request) => (
            <div key={request.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">{request.requester_name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.requester_role} • {request.requester_email}
                  </p>
                  {request.note ? <p className="mt-3 text-sm text-slate-600">{request.note}</p> : null}
                </div>
                <div className="text-right">
                  <p className="text-base font-extrabold text-slate-900">{formatMoney(request.amount)}</p>
                  <p className={`mt-1 text-[10px] font-black uppercase tracking-widest ${statusTone(request.status)}`}>
                    {request.status}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-400">{new Date(request.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["approved", "paid", "rejected"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={updateMutation.isPending || request.status === status}
                    onClick={() => updateMutation.mutate({ requestId: request.id, status })}
                    className="rounded-xl bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700 disabled:opacity-50"
                  >
                    Mark {status}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!filteredRequests.length ? <p className="text-sm text-slate-500">No withdrawal requests in this filter.</p> : null}
        </div>
      </section>
    </AdminShell>
  );
};

const MetricCard = ({ label, value, accent = false }) => (
  <div className={`rounded-[1.75rem] border p-5 shadow-sm ${accent ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
  </div>
);

const statusTone = (status) => {
  if (status === "paid") return "text-emerald-600";
  if (status === "approved") return "text-sky-600";
  if (status === "rejected") return "text-rose-600";
  return "text-[#ff9300]";
};
