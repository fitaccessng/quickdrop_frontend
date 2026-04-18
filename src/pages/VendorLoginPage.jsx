import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { loginVendor } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { FaApple } from "react-icons/fa";

export const VendorLoginPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthMessage, setOauthMessage] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  const mutation = useMutation({
    mutationFn: loginVendor,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, "vendor");
      navigate(data.user?.is_onboarded ? "/marketplace" : "/vendor/onboarding");
    },
  });

    const handleGoogleSignup = () => {
    setOauthMessage('Google sign-up is not wired on the frontend yet. Create your account with email for now.');
  };

  const handleAppleSignup = () => {
    setOauthMessage('Apple sign-up is not wired on the frontend yet. Create your account with email for now.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOauthMessage("");
    mutation.mutate(form);
  };

  return (
    <AuthLayout
      title="Welcome Back, Merchant"
      subtitle="Sign in to manage your storefront and orders."
      variant="vendor"
    >
      {/* Social Login Cluster */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={() => setOauthMessage("Vendor social sign-in is not wired on the frontend yet. Use your business email and password for now.")}
          className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-semibold text-sm active:scale-95"
        >
          <img
            alt="Google"
            className="w-5 h-5"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
          />
          Google
        </button>
        <button 
     onClick={handleAppleSignup}
     disabled={mutation.isPending}
     className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-semibold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
   >
     <FaApple className="text-xl" />
     {mutation.isPending ? 'Loading...' : 'Apple'}
   </button>
      </div>

      {oauthMessage && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-on-surface">{oauthMessage}</p>
        </div>
      )}

      <div className="relative flex py-5 items-center mb-4">
        <div className="flex-grow border-t border-surface-container-highest"></div>
        <span className="flex-shrink mx-4 text-on-surface-variant text-xs uppercase tracking-widest font-bold">
          Or Email
        </span>
        <div className="flex-grow border-t border-surface-container-highest"></div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
            Business Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              mail
            </span>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="business@quickdrop.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Password
            </label>
            <Link to="/vendor/forgot-password" className="text-xs font-bold text-tertiary hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              lock
            </span>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 px-1">
          <input
            className="w-4 h-4 rounded text-primary border-surface-container-highest bg-surface-container focus:ring-primary-container cursor-pointer"
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">
            Keep me signed in
          </label>
        </div>

        {mutation.error && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4">
            <p className="text-sm text-error font-medium">
              {(() => {
                try {
                  const detail = mutation.error.response?.data?.detail;
                  if (Array.isArray(detail)) {
                    return detail.map((err) => {
                      return typeof err === 'string' ? err : err.msg || JSON.stringify(err);
                    }).join(", ");
                  }
                  return typeof detail === 'string' ? detail : "Unable to sign in";
                } catch (e) {
                  return "An error occurred. Please try again.";
                }
              })()}
            </p>
          </div>
        )}

        <button
          className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Signing in...' : 'Sign In'}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>

      <p className="mt-10 text-center text-sm font-medium text-on-surface-variant">
        Don't have a merchant account?{' '}
        <Link to="/vendor/signup" className="text-tertiary font-bold hover:underline ml-1">
          Apply Now
        </Link>
      </p>
    </AuthLayout>
  );
};
