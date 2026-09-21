import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { unifiedSignup } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { getApiErrorMessage } from "../lib/errorMessage";
import quickdropLogo from "../styles/quickdrop.jpeg";

const FormInput = ({ label, icon, type = "text", showPasswordToggle, showPassword, onTogglePassword, ...props }) => (
  <div className="relative">
    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
      {icon}
    </span>
    <input
      type={showPasswordToggle && showPassword ? "text" : type}
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-[#ff9300] focus:ring-2 focus:ring-[#ff9300]/20 outline-none transition-all font-medium text-sm"
    />
    {showPasswordToggle && (
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
      >
        <span className="material-symbols-outlined text-xl">
          {showPassword ? "visibility_off" : "visibility"}
        </span>
      </button>
    )}
  </div>
);

export const RiderSignupPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signupMutation = useMutation({
    mutationFn: unifiedSignup,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, data.account_type);
      navigate(data.user?.is_onboarded ? "/rider/dashboard" : "/rider/onboarding");
    },
    onError: (err) => setError(getApiErrorMessage(err, "Unable to create rider account.")),
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
    <div className="min-h-screen bg-slate-950 flex flex-col font-body">
      {/* --- Branding Header --- */}
      <div className="pt-10 pb-8 px-6 flex flex-col items-center text-center">
        <img 
          src={quickdropLogo} 
          alt="QuickDrop" 
          className="h-14 w-14 rounded-2xl mb-4 shadow-2xl border border-white/10" 
        />
        <h1 className="text-white font-headline text-2xl font-black tracking-tight">Ride With QuickDrop</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide max-w-xs">Create your rider account and start delivering.</p>
      </div>

      {/* --- Bottom Sheet Container --- */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-8 pb-10 overflow-y-auto">
        <div className="max-w-md mx-auto">
          
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-8 -mt-2" />

          {error && (
            <div className="mb-6 p-4 rounded-2xl text-xs font-bold border animate-in fade-in zoom-in-95 bg-red-50 text-red-600 border-red-100 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput 
              icon="person" 
              placeholder="Full Name"
              value={form.full_name} 
              onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} 
              required
            />
            <FormInput 
              icon="mail" 
              type="email" 
              placeholder="Email Address"
              value={form.email} 
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} 
              required
            />
            <FormInput 
              icon="call" 
              type="tel" 
              placeholder="Phone Number"
              value={form.phone} 
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} 
              required
            />
            <FormInput 
              icon="lock" 
              type="password" 
              placeholder="Password"
              value={form.password} 
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} 
              required
              showPasswordToggle={true}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
            />
            <FormInput 
              icon="verified_user" 
              type="password" 
              placeholder="Confirm Password"
              value={form.confirm} 
              onChange={(event) => setForm((current) => ({ ...current, confirm: event.target.value }))} 
              required
              showPasswordToggle={true}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
            />
            <button
              disabled={signupMutation.isPending}
              className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              type="submit"
            >
              {signupMutation.isPending ? "Creating account..." : "Create Rider Account"}
              <span className="material-symbols-outlined font-bold">rocket_launch</span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-400">
            Already have an account?{' '}
            <Link to="/rider/login" className="text-[#ff9300] font-black underline underline-offset-4 ml-1">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};