import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { resetVendorPassword } from "../api/auth";
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

export const VendorResetPasswordPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ token: "", password: "", confirm_password: "" });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: resetVendorPassword,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, "vendor");
      setSubmitted(true);
      setFormError("");
      setTimeout(() => navigate("/vendor/onboarding"), 2000);
    },
    onError: (err) => {
      setFormError(getApiErrorMessage(err, "Unable to reset password"));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (form.password !== form.confirm_password) {
      setFormError("Passwords do not match");
      return;
    }

    mutation.mutate({ token: form.token, password: form.password });
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
        <h1 className="text-white font-headline text-2xl font-black tracking-tight">
          {submitted ? 'Password Reset' : 'Reset Your Password'}
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide max-w-xs">
          {submitted
            ? 'Your password has been reset successfully. Redirecting...'
            : 'Enter the reset token from your email and create a new password.'}
        </p>
      </div>

      {/* --- Bottom Sheet Container --- */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-8 pb-10 overflow-y-auto">
        <div className="max-w-md mx-auto">
          
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-8 -mt-2" />

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {(mutation.error || formError) && (
                <div className="mb-4 p-4 rounded-2xl text-xs font-bold border animate-in fade-in zoom-in-95 bg-red-50 text-red-600 border-red-100 text-center">
                  {formError || "Unable to reset password"}
                </div>
              )}

              <div className="space-y-1">
                <FormInput 
                  icon="security" 
                  name="token" 
                  type="text" 
                  placeholder="Paste your reset token here"
                  value={form.token} 
                  onChange={(e) => setForm((current) => ({ ...current, token: e.target.value }))} 
                  required
                />
                <p className="text-[11px] font-medium text-slate-400 ml-1 pt-1">
                  Copy the token from the email we sent you
                </p>
              </div>

              <FormInput 
                icon="lock" 
                name="password" 
                type="password" 
                placeholder="New Password"
                value={form.password} 
                onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} 
                required
                showPasswordToggle={true}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(prev => !prev)}
              />

              <FormInput 
                icon="lock_reset" 
                name="confirm_password" 
                type="password" 
                placeholder="Confirm New Password"
                value={form.confirm_password} 
                onChange={(e) => setForm((current) => ({ ...current, confirm_password: e.target.value }))} 
                required
                showPasswordToggle={true}
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(prev => !prev)}
              />

              <button
                className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Resetting...' : 'Reset Password'}
                <span className="material-symbols-outlined font-bold">arrow_forward</span>
              </button>

              <div className="pt-4 text-center space-x-3 text-sm font-bold text-slate-400">
                <Link to="/vendor/forgot-password" className="text-[#ff9300] hover:underline underline-offset-4">
                  Need a new token?
                </Link>
                <span>•</span>
                <Link to="/vendor/login" className="text-slate-600 hover:underline underline-offset-4">
                  Back to Sign In
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-10 space-y-4">
              <div className="w-20 h-20 rounded-full bg-orange-50 border-2 border-[#ff9300] mx-auto flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[#ff9300] text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <p className="text-slate-600 font-bold text-sm">
                Redirecting to onboarding...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};