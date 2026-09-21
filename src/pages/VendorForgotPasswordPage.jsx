import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotVendorPassword } from "../api/auth";
import { getApiErrorMessage } from "../lib/errorMessage";
import quickdropLogo from "../styles/quickdrop.jpeg";

const FormInput = ({ label, icon, type = "text", ...props }) => (
  <div className="relative">
    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
      {icon}
    </span>
    <input
      type={type}
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-[#ff9300] focus:ring-2 focus:ring-[#ff9300]/20 outline-none transition-all font-medium text-sm"
    />
  </div>
);

export const VendorForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: forgotVendorPassword,
    onSuccess: () => {
      setSubmitted(true);
      setFormError("");
    },
    onError: (err) => {
      setFormError(getApiErrorMessage(err, "Unable to generate token"));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    mutation.mutate({ email });
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
          {submitted ? 'Check Your Email' : 'Reset Your Password'}
        </h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide max-w-xs">
          {submitted
            ? 'We sent a password reset link and token to your email. Please check your inbox.'
            : 'Enter your business email to receive password reset instructions.'}
        </p>
      </div>

      {/* --- Bottom Sheet Container --- */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-8 pb-10 overflow-y-auto">
        <div className="max-w-md mx-auto">
          
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-8 -mt-2" />

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="mb-4 p-4 rounded-2xl text-xs font-bold border animate-in fade-in zoom-in-95 bg-red-50 text-red-600 border-red-100 text-center">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <FormInput 
                  icon="mail" 
                  name="email" 
                  type="email" 
                  placeholder="Business Email Address"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
                <p className="text-[11px] font-medium text-slate-400 ml-1 pt-1">
                  We'll send you an email with instructions to reset your password.
                </p>
              </div>

              <button
                className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Generating Token...' : 'Generate Reset Token'}
                <span className="material-symbols-outlined font-bold">arrow_forward</span>
              </button>

              <div className="pt-4 text-center">
                <Link to="/vendor/login" className="text-sm font-bold text-slate-400 hover:text-slate-600">
                  Back to <span className="text-[#ff9300] underline underline-offset-4">Sign In</span>
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#ff9300] text-2xl mt-0.5">mail_outline</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm mb-0.5">Reset token sent to:</p>
                    <p className="text-xs font-medium text-slate-600 break-all">{email}</p>
                  </div>
                </div>
              </div>

              {mutation.data && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Your Reset Token (Development)
                  </p>
                  <div className="bg-white rounded-xl p-3 mb-3 border border-slate-200">
                    <p className="font-mono text-xs text-slate-800 break-all select-all font-bold">
                      {mutation.data.reset_token}
                    </p>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">
                    Copy this token and use it on the reset password page.
                  </p>
                </div>
              )}

              <p className="text-xs font-medium text-slate-500 text-center">
                Didn't receive the email? Check your spam folder or try another email address.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                    setFormError('');
                  }}
                  className="w-full border-2 border-[#ff9300]/20 text-[#ff9300] font-black py-4 rounded-2xl hover:bg-orange-50 active:scale-[0.98] transition-all text-sm"
                >
                  Try Another Email
                </button>
                <Link
                  to="/vendor/login"
                  className="w-full bg-[#ff9300] text-white font-black py-4 rounded-2xl text-center shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all inline-block text-sm"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};