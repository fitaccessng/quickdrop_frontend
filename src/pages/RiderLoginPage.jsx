import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { AuthLayout } from "../components/auth/AuthLayout";
import { unifiedLogin } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export const RiderLoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: unifiedLogin,
    onSuccess: (data) => {
      if (data.account_type !== "rider") {
        setError("This account is not a rider account.");
        return;
      }
      setSession(data.access_token, data.user, data.account_type);
      navigate(data.user?.is_onboarded ? "/rider/dashboard" : "/rider/onboarding");
    },
    onError: (err) => setError(err.response?.data?.detail || "Unable to sign in."),
  });

  return (
    <AuthLayout title="Rider Sign In" subtitle="Manage deliveries, requests, and earnings in one place." variant="customer">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setError("");
          loginMutation.mutate(form);
        }}
        className="space-y-4"
      >
        <AuthInput label="Email" icon="mail" type="email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
        <AuthInput label="Password" icon="lock" type="password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</p> : null}
        <button disabled={loginMutation.isPending} className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white">
          {loginMutation.isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <div className="mt-8 flex items-center justify-between text-sm">
        <Link to="/rider/forgot-password" className="font-bold text-[#ff9300]">Forgot password?</Link>
        <Link to="/rider/signup" className="font-bold text-slate-700">Create account</Link>
      </div>
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
