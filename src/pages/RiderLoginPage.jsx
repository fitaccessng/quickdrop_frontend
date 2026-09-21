import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { unifiedLogin } from "../api/auth";
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

export const RiderLoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [oauthMessage, setOauthMessage] = useState("");

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
    onError: (err) => setError(getApiErrorMessage(err, "Unable to sign in.")),
  });

  const handleGoogleLogin = () => {
    setOauthMessage('Google sign-in is not wired on the frontend yet. Use your email and password for now.');
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
        <h1 className="text-white font-headline text-2xl font-black tracking-tight">Rider Sign In</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide max-w-xs">Manage deliveries, requests, and earnings in one place.</p>
      </div>

      {/* --- Bottom Sheet Container --- */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-8 pb-10 overflow-y-auto">
        <div className="max-w-md mx-auto">
          
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-8 -mt-2" />

          {/* Social Cluster - Google only */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <button 
              type="button"
              onClick={() => {
                handleGoogleLogin();
                setError("");
              }}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm active:bg-slate-50 active:scale-[0.97] transition-all"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="G" />
              <span className="text-slate-700 font-bold text-sm">Continue with Google</span>
            </button>
          </div>

          {oauthMessage && (
            <div className="mb-6 p-4 rounded-2xl text-xs font-bold border bg-orange-50 text-orange-700 border-orange-100 text-center">
              {oauthMessage}
            </div>
          )}

          <div className="relative flex py-3 items-center mb-6">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="mx-4 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Or use email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl text-xs font-bold border animate-in fade-in zoom-in-95 bg-red-50 text-red-600 border-red-100 text-center">
              {error}
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              setOauthMessage("");
              loginMutation.mutate(form);
            }}
            className="space-y-4"
          >
            <FormInput 
              icon="mail" 
              type="email" 
              placeholder="Email Address"
              value={form.email} 
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} 
              required
            />

            <div className="space-y-1">
              <FormInput 
                icon="lock" 
                type="password" 
                placeholder="Password"
                value={form.password} 
                onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} 
                required
                showPasswordToggle={true}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword((prev) => !prev)}
              />
              <div className="flex justify-end px-1 pt-1">
                <Link to="/rider/forgot-password" className="text-xs font-bold text-[#ff9300] hover:underline">
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              disabled={loginMutation.isPending}
              className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              type="submit"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-400">
            Don't have a rider account?{' '}
            <Link to="/rider/signup" className="text-[#ff9300] font-black underline underline-offset-4 ml-1">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};