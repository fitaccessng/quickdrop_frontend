import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '../components/auth/AuthLayout';
import { RoleSelectionModal } from '../components/auth/RoleSelectionModal';
import { registerUser, registerVendor } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { FaApple } from "react-icons/fa";

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
  const [selectedRole, setSelectedRole] = useState(null);
  const [tempSignupData, setTempSignupData] = useState(null);

  const handleGoogleSignup = () => {
    setOauthMessage('Google sign-up is not wired on the frontend yet. Create your account with email for now.');
  };

  const handleAppleSignup = () => {
    setOauthMessage('Apple sign-up is not wired on the frontend yet. Create your account with email for now.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    setOauthMessage('');

    if (form.fullName.length < 2) {
      setFormError('Full name must be at least 2 characters');
      return;
    }

    if (form.password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (!agreeToTerms) {
      setFormError('Please agree to the terms and privacy policy');
      return;
    }

    setTempSignupData(form);
    setShowRoleModal(true);
  };

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    
    if (role === 'user') {
      userMutation.mutate({
        full_name: tempSignupData.fullName,
        email: tempSignupData.email,
        phone: tempSignupData.phone,
        password: tempSignupData.password,
      });
    } else if (role === 'vendor') {
      setShowRoleModal(false);
      navigate('/vendor/onboarding', { 
        state: { signupData: tempSignupData, isNewSignup: true } 
      });
    } else if (role === 'rider') {
      setShowRoleModal(false);
      navigate('/rider/onboarding', { 
        state: { signupData: tempSignupData, isNewSignup: true } 
      });
    }
  };

  const userMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setSession(data.access_token, data.user, 'user');
      setShowRoleModal(false);
      navigate('/onboarding');
    },
  });

  const isLoading = userMutation.isPending;
  const error = userMutation.error;

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join QuickDrop and start your journey"
      variant="customer"
    >
      {/* Role Selection Modal */}
      <RoleSelectionModal 
        isOpen={showRoleModal} 
        onSelectRole={handleRoleSelect}
        isLoading={isLoading}
      />

      {/* Social Signup Cluster */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={handleGoogleSignup}
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
          onClick={handleAppleSignup}
          disabled={isLoading}
          className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-semibold text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaApple className="text-xl" />
          {isLoading ? 'Loading...' : 'Apple'}
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
            Full Name
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              person
            </span>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="Your Full Name"
              type="text"
              value={form.fullName}
              onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))}
              required
            />
          </div>
        </div>

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
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">
            Phone Number
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
              phone
            </span>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="+254 700 000 000"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
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
              lock
            </span>
            <input
              className="w-full bg-surface-container-high border-none rounded-xl py-4 pl-12 pr-12 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container transition-all"
              placeholder="••••••••"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
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

        <div className="flex items-start gap-3 px-1">
          <input
            className="w-4 h-4 rounded text-primary border-surface-container-highest bg-surface-container focus:ring-primary-container cursor-pointer mt-1"
            id="terms"
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            required
          />
          <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="terms">
            I agree to the{' '}
            <a href="#" className="text-tertiary font-bold hover:underline">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="text-tertiary font-bold hover:underline">
              Privacy Policy
            </a>
          </label>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-error text-sm font-medium">
              {(() => {
                try {
                  const detail = error.response?.data?.detail;
                  if (Array.isArray(detail)) {
                    return detail.map((err) => {
                      return typeof err === 'string' ? err : err.msg || JSON.stringify(err);
                    }).join(", ");
                  }
                  return typeof detail === 'string' ? detail : 'Unable to create account';
                } catch (e) {
                  return 'An error occurred. Please try again.';
                }
              })()}
            </p>
          </div>
        )}

        <button
          className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-6"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>

      <p className="mt-10 text-center text-sm font-medium text-on-surface-variant">
        Already have an account?{' '}
        <Link to="/login" className="text-tertiary font-bold hover:underline ml-1">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};
