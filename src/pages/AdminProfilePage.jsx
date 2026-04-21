import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchAdminProfile, updateAdminProfile } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";

export const AdminProfilePage = () => {
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["admin-profile"], queryFn: fetchAdminProfile });
  const [form, setForm] = useState({ full_name: "", phone: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (profileQuery.data) {
      setForm({
        full_name: profileQuery.data.full_name || "",
        phone: profileQuery.data.phone || "",
      });
    }
  }, [profileQuery.data]);

  const mutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      setMessage("Admin settings updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
    },
    onError: (err) => setMessage(err.response?.data?.detail || "Unable to save admin settings."),
  });

  return (
    <AdminShell title="Profile & Settings" subtitle="Maintain your admin profile and console settings.">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate(form);
        }}
        className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" value={form.full_name} onChange={(value) => setForm((current) => ({ ...current, full_name: value }))} />
          <Field label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} required={false} />
          <ReadOnlyField label="Email" value={profileQuery.data?.email} />
          <ReadOnlyField label="Role" value={profileQuery.data?.role} />
        </div>
        <div className="mt-6 rounded-[1.5rem] bg-slate-50 px-4 py-4 text-sm text-slate-600">
          Settings note: notification preferences and audit controls can hang off this page next.
        </div>
        {message ? <p className="mt-4 rounded-2xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700">{message}</p> : null}
        <button disabled={mutation.isPending} className="mt-6 rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black uppercase tracking-widest text-white">
          {mutation.isPending ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </AdminShell>
  );
};

const Field = ({ label, value, onChange, required = true }) => (
  <label className="block space-y-2">
    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
    <input value={value} required={required} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
  </label>
);

const ReadOnlyField = ({ label, value }) => (
  <div className="space-y-2">
    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{value || "Not set"}</div>
  </div>
);
