import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { AuthLayout } from "../components/auth/AuthLayout";
import { adminSignup } from "../api/admin";
import { useAuthStore } from "../store/authStore";

export const AdminSignupPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: adminSignup,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, data.account_type);
      navigate("/admin/dashboard");
    },
    onError: (err) => setError(err.response?.data?.detail || "Unable to create admin account."),
  });

  return (
    <AuthLayout title="Create Admin Account" subtitle="Set up an admin profile for platform operations." variant="customer">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (form.password !== form.confirm) {
            setError("Passwords do not match.");
            return;
          }
          mutation.mutate({
            full_name: form.full_name,
            email: form.email,
            phone: form.phone,
            password: form.password,
          });
        }}
        className="space-y-4"
      >
        <AuthField label="Full Name" value={form.full_name} onChange={(value) => setForm((current) => ({ ...current, full_name: value }))} />
        <AuthField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
        <AuthField label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
        <AuthField label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
        <AuthField label="Confirm Password" type="password" value={form.confirm} onChange={(value) => setForm((current) => ({ ...current, confirm: value }))} />
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}
        <button disabled={mutation.isPending} className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white">
          {mutation.isPending ? "Creating..." : "Create Admin Account"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have access? <Link to="/admin/login" className="font-bold text-[#ff9300]">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

const AuthField = ({ label, type = "text", value, onChange }) => (
  <label className="block space-y-2">
    <span className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl bg-surface-container-high px-4 py-4 text-on-surface" required />
  </label>
);
