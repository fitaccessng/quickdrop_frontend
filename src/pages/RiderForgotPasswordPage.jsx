import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { AuthLayout } from "../components/auth/AuthLayout";
import { forgotUserPassword } from "../api/auth";

export const RiderForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: forgotUserPassword,
    onSuccess: () => setSubmitted(true),
  });

  return (
    <AuthLayout title={submitted ? "Reset Token Ready" : "Rider Password Reset"} subtitle="We’ll generate a reset token for your rider account." variant="customer">
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-100 px-4 py-4">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Reset token</p>
            <p className="mt-3 break-all font-mono text-sm text-slate-900">{mutation.data?.reset_token}</p>
          </div>
          <Link to="/rider/login" className="block w-full rounded-xl bg-slate-900 py-4 text-center font-bold text-white">Back to rider login</Link>
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate({ email });
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl bg-surface-container-high py-4 pl-12 pr-4 text-on-surface" required />
            </div>
          </div>
          <button disabled={mutation.isPending} className="w-full rounded-xl bg-slate-900 py-4 font-bold text-white">
            {mutation.isPending ? "Generating..." : "Generate Reset Token"}
          </button>
          <div className="text-center text-sm text-slate-500">
            <Link to="/rider/login" className="font-bold text-[#ff9300]">Back to rider login</Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
