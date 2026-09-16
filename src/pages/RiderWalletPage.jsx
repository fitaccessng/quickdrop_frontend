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
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const payoutMutation = useMutation({
    mutationFn: createRiderPayoutRequest,
    onSuccess: () => {
      setMessage("Withdrawal request submitted successfully.");
      setAmount("");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["rider-wallet"] });
    },
    onError: (error) => {
      setMessage(error.response?.data?.detail || "Unable to request withdrawal.");
    },
  });

  const todayEarnings = useMemo(() => {
    const today = new Date().toDateString();
    return (wallet?.recent_deliveries ?? [])
      .filter((order) => new Date(order.updated_at).toDateString() === today)
      .reduce((sum, order) => sum + (order.delivery_fee || 0), 0);
  }, [wallet?.recent_deliveries]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center gap-3">
        <span className="w-8 h-8 border-4 border-[#ff9300] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Wallet...</span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 flex justify-center items-center font-sans overflow-hidden select-none sm:py-6">
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md h-full sm:h-[92vh] bg-white sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl sm:border sm:border-slate-200 relative">

        {/* Mobile Header */}
        <header className="shrink-0 bg-white/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-slate-100 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-800 transition-all cursor-pointer"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>
            <div>
              <span className="text-[10px] font-black text-[#ff9300] uppercase tracking-wider block">Financials</span>
              <h4 className="text-slate-900 font-extrabold text-base tracking-tight leading-none">Rider Wallet</h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/rider/notifications")}
            className="relative w-10 h-10 rounded-full bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-800 transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* Scrollable Main Body */}
        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6 text-slate-800 scrollbar-none pb-32">

          {/* Primary Balance Hero Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-[2rem] text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Available for Withdrawal</span>
                <h3 className="text-4xl font-black tracking-tight">{formatMoney(wallet?.wallet_balance ?? 0)}</h3>
              </div>

              {/* Instant Payout Form Controls */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-[#ff9300] placeholder:text-slate-500 transition-all"
                    placeholder="Amount (R)"
                  />
                  <input
                    type="text"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700/80 rounded-2xl px-3.5 py-3 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-[#ff9300] placeholder:text-slate-500 transition-all"
                    placeholder="Note (optional)"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMessage("");
                    payoutMutation.mutate({ amount: Number(amount), note: note || null });
                  }}
                  disabled={payoutMutation.isPending || !amount}
                  className="w-full bg-[#ff9300] active:bg-orange-600 text-white font-bold py-3.5 text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {payoutMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Requesting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                      <span>Request Payout</span>
                    </>
                  )}
                </button>
                {message && (
                  <p className="text-xs font-semibold text-orange-300 text-center">{message}</p>
                )}
              </div>
            </div>

            {/* Background Decorative Accent */}
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-[#ff9300]/15 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <MetricCard 
              icon="today" 
              label="Today's Earnings" 
              value={formatMoney(todayEarnings)} 
              badge="Live" 
            />
            <MetricCard 
              icon="verified" 
              label="Completed Drops" 
              value={wallet?.completed_deliveries ?? 0} 
              unit="trips" 
            />
            <MetricCard 
              icon="payments" 
              label="Total Revenue" 
              value={formatMoney(wallet?.total_earnings ?? 0)} 
            />
            <MetricCard 
              icon="hourglass_top" 
              label="Payout Ready" 
              value={formatMoney(wallet?.available_payout ?? 0)} 
            />
          </div>

          {/* Recent Activity Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-slate-900 font-extrabold text-sm tracking-tight uppercase">Recent Deliveries</h4>
              <span className="text-[11px] font-bold text-slate-400">Latest earnings</span>
            </div>

            <div className="space-y-2.5">
              {(wallet?.recent_deliveries ?? []).length > 0 ? (
                wallet.recent_deliveries.map((order) => (
                  <div key={order.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#ff9300] flex items-center justify-center shrink-0 border border-orange-100">
                        <span className="material-symbols-outlined text-lg">delivery_dining</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{order.order_reference}</p>
                        <p className="text-[11px] text-slate-500 font-medium truncate max-w-[140px]">{order.vendor?.name || "QuickDrop Vendor"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm">+{formatMoney(order.delivery_fee)}</p>
                      <span className="text-[9px] bg-orange-50 text-[#ff9300] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-orange-100">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                  No recent deliveries found.
                </div>
              )}
            </div>
          </div>

          {/* Withdrawal Requests Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-slate-900 font-extrabold text-sm tracking-tight uppercase">Payout Requests</h4>
              <span className="text-[11px] font-bold text-slate-400">History</span>
            </div>

            <div className="space-y-2.5">
              {(wallet?.payout_requests ?? []).length > 0 ? (
                wallet.payout_requests.map((request) => (
                  <div key={request.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{formatMoney(request.amount)}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{new Date(request.created_at).toLocaleString()}</p>
                      {request.note && <p className="text-[11px] text-slate-600 mt-0.5 italic">{request.note}</p>}
                    </div>
                    <span className="text-[9px] bg-slate-200/70 text-slate-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {request.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
                  No withdrawal requests yet.
                </div>
              )}
            </div>
          </div>

        </main>

        {/* Mobile Navigation Footer Bar */}
        <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-t border-slate-100 z-30 px-6 flex items-center justify-around">
          <NavItem to="/rider/dashboard" icon="home" label="Home" />
          <NavItem to="/rider/wallet" icon="payments" label="Wallet" active />
          <NavItem to="/rider/orders" icon="receipt_long" label="Orders" />
          <NavItem to="/rider/profile" icon="person" label="Profile" />
        </nav>

      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, unit, badge }) => (
  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between relative overflow-hidden">
    {badge && (
      <span className="absolute top-3 right-3 text-[9px] font-extrabold text-[#ff9300] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-widest">
        {badge}
      </span>
    )}
    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff9300] flex items-center justify-center mb-3 border border-orange-100">
      <span className="material-symbols-outlined text-base">{icon}</span>
    </div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
        {value} {unit && <span className="text-[10px] text-slate-400 font-semibold">{unit}</span>}
      </p>
    </div>
  </div>
);

const NavItem = ({ to, icon, label, active = false }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
      active ? "text-[#ff9300]" : "text-slate-400 hover:text-slate-600"
    }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? "bg-orange-50 border border-orange-100 shadow-sm" : ""}`}>
      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
        {icon}
      </span>
    </div>
    <span className="text-[10px] font-bold tracking-tight">{label}</span>
  </Link>
);