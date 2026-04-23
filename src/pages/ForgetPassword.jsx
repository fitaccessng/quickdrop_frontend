import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { forgotUserPassword } from '../api/auth';
import quickdropLogo from "../styles/quickdrop.jpeg";

export const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: forgotUserPassword,
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body">
      {/* --- Branding Header --- */}
      <div className="pt-12 pb-10 px-6 flex flex-col items-center text-center">
        <img 
          src={quickdropLogo} 
          alt="QuickDrop" 
          className="h-16 w-16 rounded-2xl mb-4 shadow-2xl border border-white/10" 
        />
        <h1 className="text-white font-headline text-3xl font-black tracking-tight">
          {submitted ? 'Check Email' : 'Recovery'}
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide">
          {submitted ? 'Reset link dispatched' : 'Secure your account access'}
        </p>
      </div>

      {/* --- Bottom Sheet Style Container --- */}
      <div className="flex-1 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-10 pb-12 overflow-y-auto">
        <div className="max-w-md mx-auto">
          
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-10 -mt-4" />

          {!submitted ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                  <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                    placeholder="Enter your email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {mutation.error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
                    {mutation.error.response?.data?.detail ?? 'Unable to process request'}
                  </div>
                )}

                <button
                  className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  type="submit"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? 'Sending...' : 'Send Reset Link'}
                  <span className="material-symbols-outlined font-bold">arrow_forward</span>
                </button>
              </form>

              <p className="mt-10 text-center text-sm font-bold text-slate-400">
                Remembered it?{' '}
                <Link to="/login" className="text-[#ff9300] font-black underline underline-offset-4 ml-1">
                  Sign In
                </Link>
              </p>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-green-600 text-3xl">mark_email_read</span>
                </div>
                <h3 className="text-slate-900 font-black text-xl mb-2">Instructions Sent</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  We've sent a secure password reset link to <br/>
                  <span className="text-slate-900 font-bold">{email}</span>
                </p>
              </div>

              {/* Dev Token Info (Matches your previous logic) */}
              {mutation.data?.reset_token && (
                <div className="bg-orange-50 rounded-2xl p-5 mb-8 border border-orange-100">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Development Token</p>
                  <code className="block bg-white p-3 rounded-xl text-xs font-mono text-slate-700 break-all border border-orange-200">
                    {mutation.data.reset_token}
                  </code>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-[2.5rem] active:scale-[0.98] transition-all"
                >
                  Try Another Email
                </button>
                <Link
                  to="/login"
                  className="w-full bg-white border-2 border-slate-100 text-slate-400 font-black py-5 rounded-[2.5rem] text-center inline-block active:bg-slate-50 transition-all"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};