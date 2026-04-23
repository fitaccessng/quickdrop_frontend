import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { unifiedLogin } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { FaApple } from "react-icons/fa";
import quickdropLogo from "../styles/quickdrop.jpeg";

export const UnifiedLogin = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [oauthMessage, setOauthMessage] = useState('');

  const handleGoogleLogin = () => setOauthMessage('Google sign-in coming soon.');
  const handleAppleLogin = () => setOauthMessage('Apple sign-in coming soon.');

  const loginMutation = useMutation({
    mutationFn: unifiedLogin,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, data.account_type);
      
      if (data.account_type === 'vendor') {
        navigate(data.user?.is_onboarded ? '/vendor/dashboard' : '/vendor/onboarding');
      } else if (data.account_type === 'rider') {
        navigate(data.user?.is_onboarded ? '/rider/dashboard' : '/rider/onboarding');
      } else {
        navigate(data.user?.is_onboarded ? '/dashboard' : '/onboarding');
      }
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Invalid email or password');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setOauthMessage('');
    loginMutation.mutate({ email, password });
  };

  const isLoading = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body">
      {/* --- Branding Header --- */}
      <div className="pt-12 pb-10 px-6 flex flex-col items-center text-center">
        <img 
          src={quickdropLogo} 
          alt="QuickDrop" 
          className="h-16 w-16 rounded-2xl mb-4 shadow-2xl border border-white/10" 
        />
        <h1 className="text-white font-headline text-3xl font-black tracking-tight">Welcome Back</h1>
        <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide">Premium Urban Logistics</p>
      </div>

      {/* --- Bottom Sheet Style Container --- */}
      <div className="flex-1 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-10 pb-12 overflow-y-auto">
        <div className="max-w-md mx-auto">
          
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-10 -mt-4" />

          {/* Social Cluster */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button 
              onClick={handleGoogleLogin}
              type="button"
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm active:bg-slate-50 active:scale-[0.98] transition-all"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
              <span className="text-slate-700 font-bold text-sm">Google</span>
            </button>

            <button 
              onClick={handleAppleLogin}
              type="button"
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-black active:opacity-80 active:scale-[0.98] transition-all"
            >
              <FaApple className="text-white text-xl mb-0.5" />
              <span className="text-white font-bold text-sm">Apple</span>
            </button>
          </div>

          <div className="relative flex py-4 items-center mb-6">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="mx-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Or login with Email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {(formError || oauthMessage) && (
            <div className={`mb-6 p-4 rounded-2xl text-xs font-bold border animate-in fade-in slide-in-from-top-2 ${formError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
              {formError || oauthMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Address */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                placeholder="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 active:text-slate-700"
              >
                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-200 text-[#ff9300] focus:ring-[#ff9300] transition-all"
                />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-tight group-hover:text-slate-700">Remember me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-xs font-black text-[#ff9300] uppercase tracking-tight hover:underline">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Sign In'}
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-bold text-slate-400">
            New to QuickDrop?{' '}
            <Link to="/signup" className="text-[#ff9300] font-black underline underline-offset-4 ml-1">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
