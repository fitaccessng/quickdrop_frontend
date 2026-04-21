import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { AuthLayout } from "../components/auth/AuthLayout";
import { adminLogin } from "../api/admin";
import { useAuthStore } from "../store/authStore";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: adminLogin,
    onSuccess: (data) => {
      if (data.account_type !== "admin") {
        setError("This account is not an admin account.");
        return;
      }
      setSession(data.access_token, data.user, data.account_type);
      navigate("/admin/dashboard");
    },
    onError: (err) => setError(err.response?.data?.detail || "Unable to sign in."),
  });

  return (
    <AuthLayout title="Admin Login" subtitle="Access vendor approvals, dispatch, and platform controls." variant="customer">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate(form);
        }}
        className="space-y-4"
      >
        <AuthField label="Email" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
        <AuthField label="Password" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}
        <button disabled={mutation.isPending} className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white">
          {mutation.isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-500">
        Need an admin account? <Link to="/admin/signup" className="font-bold text-[#ff9300]">Create one</Link>
      </p>
    </AuthLayout>
  );
};

const AuthField = ({ label, type, value, onChange }) => (
  <label className="block space-y-2">
    <span className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl bg-surface-container-high px-4 py-4 text-on-surface" required />
  </label>
);
