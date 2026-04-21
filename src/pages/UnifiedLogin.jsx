import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '../components/auth/AuthLayout';
import { unifiedLogin } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { FaApple } from "react-icons/fa";

export const UnifiedLogin = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [oauthMessage, setOauthMessage] = useState('');

  const handleGoogleLogin = () => {
    setOauthMessage('Google sign-in is not wired on the frontend yet. Use your email and password for now.');
  };

  const handleAppleLogin = () => {
    setOauthMessage('Apple sign-in is not wired on the frontend yet. Use your email and password for now.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setOauthMessage('');

    if (!email) {
      setFormError('Email is required');
      return;
    }

    if (!password) {
      setFormError('Password is required');
      return;
    }

    loginMutation.mutate({ email, password });
  };

  const loginMutation = useMutation({
    mutationFn: unifiedLogin,
    onSuccess: (data) => {
      // Auto-detect account type and route accordingly
      setSession(data.access_token, data.user, data.account_type);
      
      if (data.account_type === 'vendor') {
        navigate(data.user?.is_onboarded ? '/vendor/dashboard' : '/vendor/onboarding');
      } else if (data.account_type === 'rider') {
        navigate(data.user?.is_onboarded ? '/rider/dashboard' : '/rider/onboarding');
      } else {
        navigate('/dashboard');
      }
    },
    onError: (err) => {
      setFormError(err.response?.data?.detail || 'Invalid email or password');
    }
  });

  const isLoading = loginMutation.isPending;
  const error = loginMutation.error;

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account"
      variant="customer"
    >
      {/* Social Login Cluster */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
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
          type="button"
          onClick={handleAppleLogin}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-semibold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaApple className="text-xl" />
          Apple
        </button>
      </div>

      {oauthMessage && (
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-on-surface">{oauthMessage}</p>
        </div>
      )}

      {formError && (
        <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
          <p className="text-error text-sm font-medium">{formError}</p>
        </div>
      )}

      <div className="relative flex py-5 items-center mb-4">
        <div className="flex-grow border-t border-surface-container-highest"></div>
        <span className="flex-shrink mx-4 text-on-surface-variant text-xs uppercase tracking-widest font-bold">
          Or Email
        </span>
        <div className="flex-grow border-t border-surface-container-highest"></div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
            Email Address
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              mail
            </span>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="you@example.com"
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
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex items-center justify-between px-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-primary bg-surface-container cursor-pointer"
            />
            <span className="text-sm font-medium text-on-surface-variant">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-tertiary font-bold hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-4">
            <p className="text-sm text-error font-medium">
              {(() => {
                try {
                  const detail = error.response?.data?.detail;
                  if (Array.isArray(detail)) {
                    return detail.map((err) => {
                      return typeof err === 'string' ? err : err.msg || JSON.stringify(err);
                    }).join(", ");
                  }
                  return typeof detail === 'string' ? detail : 'Invalid credentials';
                } catch (e) {
                  return 'An error occurred. Please try again.';
                }
              })()}
            </p>
          </div>
        )}

        <button
          className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>

      <p className="mt-10 text-center text-sm font-medium text-on-surface-variant">
        Don't have an account?{' '}
        <Link to="/signup" className="text-tertiary font-bold hover:underline ml-1">
          Sign Up
        </Link>
      </p>
    </AuthLayout>
  );
};
