import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { RoleSelectionModal } from '../components/auth/RoleSelectionModal';
import { unifiedSignup } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { FaApple } from "react-icons/fa";
import quickdropLogo from "../styles/quickdrop.jpeg"; 

export const UnifiedSignup = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formError, setFormError] = useState('');
  const [oauthMessage, setOauthMessage] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempSignupData, setTempSignupData] = useState(null);

  const handleGoogleSignup = () => setOauthMessage('Google signup coming soon.');
  const handleAppleSignup = () => setOauthMessage('Apple signup coming soon.');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }
    if (!agreeToTerms) {
      setFormError('Please agree to the terms');
      return;
    }
    setTempSignupData(form);
    setShowRoleModal(true);
  };

  const handleRoleSelect = (role) => {
    const payload = {
      full_name: tempSignupData.fullName,
      email: tempSignupData.email,
      phone: tempSignupData.phone || "",
      password: tempSignupData.password,
      role: role,
    };
    signupMutation.mutate(payload);
  };

  const signupMutation = useMutation({
    mutationFn: unifiedSignup,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, data.account_type);
      navigate(data.account_type === 'vendor' ? '/vendor/dashboard' : '/dashboard');
    },
    onError: () => setFormError('Signup failed. Please try again.')
  });

  const isLoading = signupMutation.isPending;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body">
      {/* --- Branding Header --- */}
      <div className="pt-10 pb-8 px-6 flex flex-col items-center text-center">
        <img 
          src={quickdropLogo} 
          alt="QuickDrop" 
          className="h-14 w-14 rounded-2xl mb-4 shadow-2xl border border-white/10" 
        />
        <h1 className="text-white font-headline text-2xl font-black tracking-tight">QuickDrop</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide">Premium Urban Logistics</p>
      </div>

      {/* --- Bottom Sheet Container --- */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-8 pb-10 overflow-y-auto">
        <div className="max-w-md mx-auto">
          
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-8 -mt-2" />

          <RoleSelectionModal 
            isOpen={showRoleModal} 
            onSelectRole={handleRoleSelect}
            isLoading={isLoading}
          />

          {/* Social Cluster */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              onClick={handleGoogleSignup}
              type="button"
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm active:bg-slate-50 active:scale-[0.97] transition-all"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="G" />
              <span className="text-slate-700 font-bold text-sm">Google</span>
            </button>

            <button 
              onClick={handleAppleSignup}
              type="button"
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black active:opacity-80 active:scale-[0.97] transition-all"
            >
              <FaApple className="text-white text-lg mb-0.5" />
              <span className="text-white font-bold text-sm">Apple</span>
            </button>
          </div>

          <div className="relative flex py-3 items-center mb-6">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="mx-4 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Or use email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {(formError || oauthMessage) && (
            <div className={`mb-6 p-4 rounded-2xl text-xs font-bold border animate-in fade-in zoom-in-95 ${formError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
              {formError || oauthMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                placeholder="Full Name"
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({...form, fullName: e.target.value})}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                placeholder="Email Address"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">phone</span>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                placeholder="Phone Number"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
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
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 active:text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                placeholder="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 active:text-slate-600"
              >
                <span className="material-symbols-outlined text-xl">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>

            {/* Terms */}
            <div className="flex items-center gap-3 px-1 py-1">
              <input
                id="terms"
                type="checkbox"
                className="w-5 h-5 rounded-lg border-slate-200 text-[#ff9300] focus:ring-[#ff9300]"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label htmlFor="terms" className="text-[10px] font-black text-slate-500 uppercase tracking-tight leading-tight">
                I agree to the <span className="text-[#ff9300]">Terms & Privacy Policy</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Create Account'}
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#ff9300] font-black underline underline-offset-4 ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};