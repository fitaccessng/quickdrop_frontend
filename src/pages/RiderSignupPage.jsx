import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { AuthLayout } from "../components/auth/AuthLayout";
import { unifiedSignup } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export const RiderSignupPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const signupMutation = useMutation({
    mutationFn: unifiedSignup,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, data.account_type);
      navigate(data.user?.is_onboarded ? "/rider/dashboard" : "/rider/onboarding");
    },
    onError: (err) => setError(err.response?.data?.detail || "Unable to create rider account."),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    signupMutation.mutate({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: "rider",
    });
  };

  return (
    <AuthLayout title="Ride With QuickDrop" subtitle="Create your rider account and start delivering." variant="customer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput label="Full Name" icon="person" value={form.full_name} onChange={(value) => setForm((current) => ({ ...current, full_name: value }))} />
        <AuthInput label="Email" icon="mail" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
        <AuthInput label="Phone" icon="call" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
        <AuthInput label="Password" icon="lock" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
        <AuthInput label="Confirm Password" icon="verified_user" type="password" value={form.confirm} onChange={(value) => setForm((current) => ({ ...current, confirm: value }))} />
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}
        <button disabled={signupMutation.isPending} className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white">
          {signupMutation.isPending ? "Creating account..." : "Create Rider Account"}
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account? <Link to="/rider/login" className="font-bold text-[#ff9300]">Sign in</Link>
      </p>
    </AuthLayout>
  );
};

const AuthInput = ({ label, icon, type = "text", value, onChange }) => (
  <div className="space-y-2">
    <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">{label}</label>
    <div className="relative">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl bg-surface-container-high py-4 pl-12 pr-4 text-on-surface"
        required
      />
    </div>
  </div>
);
