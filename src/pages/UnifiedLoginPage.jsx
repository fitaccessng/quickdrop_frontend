import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '../components/auth/AuthLayout';
import { unifiedLogin } from '../api/auth';
import { useAuthStore } from '../store/authStore';

export const UnifiedLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthMessage, setOauthMessage] = useState('');
  const navigate = useNavigate();
  const { setSession } = useAuthStore();

  // Unified login mutation
  const loginMutation = useMutation({
    mutationFn: unifiedLogin,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, data.account_type);
      
      // Route based on account type
      if (data.account_type === 'vendor') {
        navigate(data.user?.is_onboarded ? '/vendor/dashboard' : '/vendor/onboarding');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (err) => {
      // Error message is already displayed below
    }
  });

  const handleGoogleLogin = () => {
    setOauthMessage('Google sign-in is not wired on the frontend yet. Use email and password for now.');
  };

  const handleAppleLogin = () => {
    setOauthMessage('Apple sign-in is not wired on the frontend yet. Use email and password for now.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOauthMessage('');
    loginMutation.mutate({ email, password });
  };

  const isLoading = loginMutation.isPending;
  const error = loginMutation.error;

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account - works for customers and merchants."
      variant="customer"
    >
      {/* Social Login Cluster */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          type="button"
          className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-semibold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img
            alt="Google"
            className="w-5 h-5"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
          />
          Google
        </button>
        <button 
          onClick={handleAppleLogin}
          disabled={isLoading}
          type="button"
          className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-semibold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-xl">apple</span>
          Apple
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
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
            <p className="text-sm font-medium text-rose-600">
              {error.response?.data?.detail || 'Login failed. Please try again.'}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
            Email
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              mail
            </span>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
            Password
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              lock
            </span>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs font-medium text-on-surface-variant">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl bg-primary text-on-primary font-bold text-sm uppercase tracking-wider hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/signup" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Sign up
          </Link>
          {' '}or{' '}
          <Link to="/vendor/signup" className="font-bold text-primary hover:text-primary/80 transition-colors">
            become a merchant
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
