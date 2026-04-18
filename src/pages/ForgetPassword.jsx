import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '../components/auth/AuthLayout';
import { forgotUserPassword } from '../api/auth';

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
    <AuthLayout
      title={submitted ? 'Check Your Email' : 'Forgot Password?'}
      subtitle={
        submitted
          ? 'We sent a password reset link to your email. Please check your inbox.'
          : 'Enter your email to receive password reset instructions.'
      }
      variant="customer"
    >
      {!submitted ? (
        <>
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  placeholder="curator@quickdrop.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-on-surface-variant/60 ml-1">
              We'll send you an email with instructions to reset your password.
              </p>
            </div>

            {mutation.error && (
              <div className="bg-error/10 border border-error/20 rounded-xl p-4">
                <p className="text-sm text-error font-medium">
                  {mutation.error.response?.data?.detail ?? 'Unable to generate reset token'}
                </p>
              </div>
            )}

            <button
              className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold py-4 rounded-xl shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Generating Token...' : 'Send Reset Link'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-on-surface-variant">
            Remember your password?{' '}
            <Link to="/login" className="text-tertiary font-bold hover:underline ml-1">
              Sign In
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-2xl mt-1">mail_outline</span>
              <div>
                <p className="font-semibold text-on-surface mb-1">Reset instructions sent to:</p>
                <p className="text-sm text-on-surface-variant">{email}</p>
              </div>
            </div>
          </div>

          {mutation.data && (
            <div className="bg-surface-container-high rounded-xl p-4 mb-6 border border-outline/20">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Your Reset Token (Development)
              </p>
              <div className="bg-surface-container rounded-lg p-3 mb-3">
                <p className="font-mono text-sm text-on-surface break-all select-all">
                  {mutation.data.reset_token}
                </p>
              </div>
              <p className="text-xs text-on-surface-variant">
                Use this token on the reset password page.
              </p>
            </div>
          )}

          <p className="text-sm text-on-surface-variant mb-6">
            Didn't receive the email? Check your spam folder or try a different email address.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setSubmitted(false)}
              className="w-full border-2 border-primary/20 text-primary font-bold py-4 rounded-xl hover:bg-primary/5 active:scale-[0.98] transition-all"
            >
              Try Another Email
            </button>
            <Link
              to="/login"
              className="w-full bg-surface-container text-on-surface font-bold py-4 rounded-xl text-center hover:bg-surface-container-high active:scale-[0.98] transition-all inline-block"
            >
              Back to Sign In
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
};
