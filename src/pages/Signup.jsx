import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '../components/auth/AuthLayout';
import { registerUser } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { FaApple } from "react-icons/fa";
import quickdropLogo from "../styles/quickdrop.jpeg";

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formError, setFormError] = useState('');
  const [oauthMessage, setOauthMessage] = useState('');
  
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  const signupMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setSession(data.access_token, data.user);
      navigate('/dashboard');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    signupMutation.mutate({ full_name: fullName, email, password, phone: '' });
  };

  const isLoading = signupMutation.isPending;

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex flex-col items-center justify-start md:justify-center p-0 md:p-6">
      {/* Mobile Header / Logo Area */}
      <div className="w-full max-w-md pt-12 pb-8 px-6 text-center md:text-left">
        <Link to="/" className="inline-flex items-center gap-2 mb-8">
          <img 
            src={quickdropLogo} 
            alt="QuickDrop" 
            className="h-12 w-auto rounded-xl object-contain shadow-sm" 
          />
          <span className="font-headline text-2xl font-black tracking-tight text-slate-900">
            QuickDrop
          </span>
        </Link>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
          Create Account
        </h1>
        <p className="text-slate-500 font-medium">
          Join the premium neighborhood delivery network.
        </p>
      </div>

      <div className="w-full max-w-md bg-white md:rounded-[2.5rem] md:shadow-2xl md:border md:border-slate-100 p-6 md:p-10">
        {/* Social Actions - Native App Style */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          <button 
            type="button"
            onClick={() => setOauthMessage('Google connection coming soon')}
            className="flex items-center justify-center gap-3 h-[60px] w-full rounded-2xl border-2 border-slate-100 hover:bg-slate-50 active:scale-[0.98] transition-all font-bold text-slate-700"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="" />
            Continue with Google
          </button>
          <button 
            type="button"
            onClick={() => setOauthMessage('Apple connection coming soon')}
            className="flex items-center justify-center gap-3 h-[60px] w-full rounded-2xl bg-slate-900 text-white active:scale-[0.98] transition-all font-bold"
          >
            <FaApple className="text-xl" />
            Continue with Apple
          </button>
        </div>

        <div className="relative flex items-center mb-8">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="mx-4 text-slate-400 text-xs font-black uppercase tracking-widest">or email</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Group */}
          <div className="group relative">
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="peer w-full h-[64px] bg-slate-50 border-transparent border-2 rounded-2xl px-6 pt-5 text-slate-900 text-base font-bold placeholder-transparent focus:bg-white focus:border-[#ff9300] focus:ring-0 transition-all outline-none"
              placeholder="Full Name"
            />
            <label className="absolute left-6 top-2 text-[10px] font-black uppercase tracking-widest text-slate-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:font-bold peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#ff9300] transition-all pointer-events-none">
              Full Name
            </label>
          </div>

          <div className="group relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full h-[64px] bg-slate-50 border-transparent border-2 rounded-2xl px-6 pt-5 text-slate-900 text-base font-bold placeholder-transparent focus:bg-white focus:border-[#ff9300] focus:ring-0 transition-all outline-none"
              placeholder="Email Address"
            />
            <label className="absolute left-6 top-2 text-[10px] font-black uppercase tracking-widest text-slate-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:font-bold peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#ff9300] transition-all pointer-events-none">
              Email Address
            </label>
          </div>

          <div className="group relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full h-[64px] bg-slate-50 border-transparent border-2 rounded-2xl px-6 pt-5 text-slate-900 text-base font-bold placeholder-transparent focus:bg-white focus:border-[#ff9300] focus:ring-0 transition-all outline-none"
              placeholder="Password"
            />
            <label className="absolute left-6 top-2 text-[10px] font-black uppercase tracking-widest text-slate-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-5 peer-placeholder-shown:font-bold peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-[#ff9300] transition-all pointer-events-none">
              Password
            </label>
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>

          {/* Custom Checkbox for Better Mobile Tapping */}
          <div className="flex items-start gap-3 py-2">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                required
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-6 h-6 rounded-lg border-2 border-slate-200 text-[#ff9300] focus:ring-0 transition-all cursor-pointer"
              />
            </div>
            <label className="text-sm text-slate-500 font-medium leading-tight">
              By signing up, I agree to the <span className="text-[#ff9300] font-bold">Terms of Service</span> and <span className="text-[#ff9300] font-bold">Privacy Policy</span>.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: "#ff9300" }}
            className="w-full h-[64px] rounded-2xl text-white font-black text-lg shadow-xl shadow-orange-200 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:grayscale disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Get Started'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 font-bold">
          Already a member?{' '}
          <Link to="/login" className="text-[#ff9300] ml-1">Sign In</Link>
        </p>
      </div>
      
      {/* Bottom Padding for Mobile */}
      <div className="h-12 md:hidden"></div>
    </div>
  );
};