import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { resetVendorPassword } from "../api/auth";
import { useAuthStore } from "../store/authStore";

export const VendorResetPasswordPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ token: "", password: "", confirm_password: "" });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: resetVendorPassword,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, "vendor");
      setSubmitted(true);
      setTimeout(() => navigate("/vendor/onboarding"), 2000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      return;
    }

    mutation.mutate({ token: form.token, password: form.password });
  };

  return (
    <AuthLayout
      title={submitted ? 'Password Reset' : 'Reset Your Password'}
      subtitle={
        submitted
          ? 'Your password has been reset successfully. Redirecting...'
          : 'Enter the reset token from your email and create a new password.'
      }
      variant="vendor"
    >
      {!submitted ? (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
              Reset Token
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                security
              </span>
              <input
                className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all font-mono text-sm"
                placeholder="Paste your reset token here"
                type="text"
                value={form.token}
                onChange={(e) => setForm((current) => ({ ...current, token: e.target.value }))}
                required
              />
            </div>
            <p className="text-xs text-on-surface-variant/60 ml-1">
              Copy the token from the email we sent you
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
              New Password
            </label>
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

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                lock_check
              </span>
              <input
                className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all"
                placeholder="••••••••"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirm_password}
                onChange={(e) => setForm((current) => ({ ...current, confirm_password: e.target.value }))}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {mutation.error && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4">
              <p className="text-sm text-error font-medium">
                {mutation.error.response?.data?.detail ?? "Unable to reset password"}
              </p>
            </div>
          )}

          {form.password && form.confirm_password && form.password !== form.confirm_password && (
            <div className="bg-error/10 border border-error/20 rounded-xl p-4">
              <p className="text-sm text-error font-medium">Passwords do not match</p>
            </div>
          )}

          <button
            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Resetting...' : 'Reset Password'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary mx-auto mb-6 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
          <p className="text-on-surface-variant">
            Redirecting to onboarding...
          </p>
        </div>
      )}

      <p className="mt-10 text-center text-sm font-medium text-on-surface-variant">
        <Link to="/vendor/forgot-password" className="text-tertiary font-bold hover:underline">
          Need a new token?
        </Link>{' '}
        or{' '}
        <Link to="/vendor/login" className="text-tertiary font-bold hover:underline">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
};
