import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createRiderPayoutRequest, fetchRiderWallet } from "../api/rider";
import { formatMoney } from "../lib/utils";

export const RiderWalletPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["rider-wallet"],
    queryFn: fetchRiderWallet,
  });

  const payoutMutation = useMutation({
    mutationFn: createRiderPayoutRequest,
    onSuccess: () => {
      setMessage("Withdrawal request submitted.");
      setAmount("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["rider-wallet"] });
    },
    onError: (error) => {
      setMessage(error.response?.data?.detail || "Unable to request withdrawal.");
    },
  });

  const dailyGoal = 200;
  const todayEarnings = useMemo(() => {
    const today = new Date().toDateString();
    return (wallet?.recent_deliveries ?? [])
      .filter((order) => new Date(order.updated_at).toDateString() === today)
      .reduce((sum, order) => sum + (order.delivery_fee || 0), 0);
  }, [wallet?.recent_deliveries]);
  const progressPercent = Math.min((todayEarnings / dailyGoal) * 100, 100);

  if (isLoading) {
    return <div className="p-10 text-center font-black uppercase tracking-widest text-slate-400">Loading Wallet...</div>;
  }

  return (
    <div className="min-h-screen bg-white pt-20 font-body antialiased text-slate-900">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-[#5a5c58] hover:bg-slate-50 transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#4e6300] hidden sm:block">payments</span>
            <h1 className="text-lg font-black text-[#4e6300] tracking-tight uppercase">Rider Wallet</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white border border-slate-200 text-[#5a5c58] hover:text-[#ff8c00] transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-32 space-y-8">
        <section className="mb-10">
          <p className="text-[10px] font-black tracking-[0.2em] text-[#3a5f94] uppercase mb-2">Financial Overview</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#0A192F]">Wallet & Earnings</h2>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-gradient-to-br from-[#0A192F] to-[#1e293b] p-8 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col justify-between min-h-[280px] shadow-xl">
            <div className="relative z-10">
              <span className="text-sm font-semibold opacity-60 mb-1 block">Available for Withdrawal</span>
              <h3 className="text-5xl font-black mb-8">{formatMoney(wallet?.wallet_balance ?? 0)}</h3>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="rounded-2xl px-4 py-4 text-sm font-bold text-slate-900"
                  placeholder="Withdrawal amount"
                />
                <input
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="rounded-2xl px-4 py-4 text-sm font-bold text-slate-900"
                  placeholder="Optional note"
                />
                <button
                  onClick={() => {
                    setMessage("");
                    payoutMutation.mutate({ amount: Number(amount), note: note || null });
                  }}
                  disabled={payoutMutation.isPending || !amount}
                  className="bg-white text-[#0A192F] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#ff8c00] hover:text-white active:scale-95 transition-all shadow-lg disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                  Withdraw
                </button>
              </div>
              {message ? <p className="mt-4 text-sm font-bold text-orange-200">{message}</p> : null}
            </div>
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="absolute right-8 top-8 opacity-10">
              <span className="material-symbols-outlined text-[140px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
            </div>
          </div>

          <div className="bg-[#d5e3ff] p-8 rounded-[2.5rem] text-[#001b3c] flex flex-col justify-center shadow-sm">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60 block mb-2">Today's Progress</span>
              <p className="text-3xl font-black">{formatMoney(todayEarnings)}</p>
              <p className="text-xs font-bold text-[#3a5f94] mt-2 flex items-center gap-1 uppercase tracking-tighter">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                Live Activity
              </p>
            </div>
            <div className="h-2 w-full bg-[#001b3c]/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#ff8c00] transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <p className="text-[10px] mt-4 font-black opacity-40 uppercase tracking-widest">
              DAILY GOAL: {formatMoney(dailyGoal)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard icon="distance" label="Completed Drops" value={wallet?.completed_deliveries ?? 0} unit="trips" color="text-[#904d00]" />
            <MetricCard icon="timer" label="Payout Ready" value={formatMoney(wallet?.available_payout ?? 0)} unit="" color="text-[#3a5f94]" />
            <MetricCard icon="avg_pace" label="Total Revenue" value={formatMoney(wallet?.total_earnings ?? 0)} unit="" color="text-[#904d00]" />
            <MetricCard icon="account_balance" label="Requests" value={wallet?.payout_requests?.length ?? 0} unit="" color="text-[#3a5f94]" />
          </div>

          <div className="bg-[#003e7d] text-white p-8 rounded-[2.5rem] flex flex-col justify-center relative overflow-hidden shadow-lg">
            <div className="z-10">
              <h5 className="text-xl font-black mb-2 uppercase tracking-tight">Withdrawal Requests</h5>
              <p className="text-sm opacity-70 leading-relaxed">
                Submit a payout request from your wallet balance. Recent requests appear below for easy tracking.
              </p>
            </div>
            <span className="material-symbols-outlined text-8xl opacity-10 absolute right-4 top-1/2 -translate-y-1/2">verified</span>
          </div>
        </div>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-2xl font-black text-[#0A192F]">Recent Activity</h4>
          </div>

          <div className="space-y-4">
            {(wallet?.recent_deliveries ?? []).length > 0 ? (
              wallet.recent_deliveries.map((order) => (
                <div key={order.id} className="group bg-white p-5 rounded-3xl flex items-center justify-between hover:shadow-md transition-all border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-[#ff8c00]">
                      <span className="material-symbols-outlined">delivery_dining</span>
                    </div>
                    <div>
                      <p className="font-black text-[#0A192F]">{order.order_reference}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                        {order.vendor?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-[#0A192F]">+{formatMoney(order.delivery_fee)}</p>
                    <span className="text-[10px] bg-orange-100 text-[#ff8c00] px-3 py-1 rounded-full font-black uppercase tracking-widest">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 font-bold">
                No recent transactions found.
              </div>
            )}
          </div>
        </section>

        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-2xl font-black text-[#0A192F]">Withdrawal Requests</h4>
          </div>
          <div className="space-y-4">
            {(wallet?.payout_requests ?? []).length ? (
              wallet.payout_requests.map((request) => (
                <div key={request.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-[#0A192F]">{formatMoney(request.amount)}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                    {request.note ? <p className="text-xs text-slate-500 mt-1">{request.note}</p> : null}
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                    {request.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 font-bold">
                No withdrawal requests yet.
              </div>
            )}
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-white/90 backdrop-blur-2xl z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] border-t border-slate-100">
        <NavItem to="/rider/dashboard" icon="home" />
        <NavItem to="/rider/wallet" icon="payments" active />
        <NavItem to="/rider/orders" icon="receipt_long" />
        <NavItem to="/rider/profile" icon="person" />
      </nav>
    </div>
  );
};

const MetricCard = ({ icon, label, value, unit, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <span className={`material-symbols-outlined ${color} mb-3`}>{icon}</span>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-xl font-black text-[#0A192F] mt-1">
      {value} <span className="text-[10px] font-bold text-slate-300">{unit}</span>
    </p>
  </div>
);

const NavItem = ({ to, icon, active = false }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center rounded-full p-3 w-14 h-14 transition-all duration-300 ${
      active ? "bg-[#ff8c00] text-white scale-110 shadow-lg shadow-orange-500/40" : "text-slate-400 hover:text-[#0A192F]"
    }`}
  >
    <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
      {icon}
    </span>
  </Link>
);
