import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { fetchUserOrders } from '../api/orders';
import { fetchCurrentRide } from '../api/rides';

export const RidePage = () => {
  const navigate = useNavigate();
  const ordersQuery = useQuery({
    queryKey: ['ride-page-user-orders'],
    queryFn: fetchUserOrders,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });
  const currentRideQuery = useQuery({
    queryKey: ['ride-page-current-ride'],
    queryFn: fetchCurrentRide,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
  });

  const activeOrder = (ordersQuery.data ?? []).find((order) =>
    ['pending', 'confirmed', 'preparing', 'rider_assigned', 'on_the_way'].includes(order.status),
  );
  const currentRide = currentRideQuery.data;

  const signatureGradient = {
    background: 'linear-gradient(135deg, #b61321 0%, #ff7670 100%)',
  };

  const materialIconFill = {
    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
  };

  return (
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen pb-32">
      {/* Fixed Header */}
      <header className="bg-white/90 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container text-on-surface active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">arrow_back_ios_new</span>
          </button>
          
          <h1 className="text-sm font-black font-headline tracking-tight">Request a Ride</h1>
          
          <div className="w-8"></div>
        </div>
      </header>

      <main className="pt-24 px-6">
        <div className="flex flex-col items-center justify-center pt-20">
          {activeOrder || currentRide ? (
            <div className="w-full max-w-sm mb-8 space-y-3">
              {activeOrder ? (
                <button
                  type="button"
                  onClick={() => navigate(`/tracking/${activeOrder.id}`)}
                  className="w-full rounded-[2rem] bg-white p-5 text-left shadow-sm border border-slate-100"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Active Order</p>
                  <h3 className="mt-2 text-lg font-black text-slate-900">See live rider location</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{activeOrder.vendor?.name || 'Vendor'} • {activeOrder.status.replaceAll('_', ' ')}</p>
                </button>
              ) : null}
              {currentRide ? (
                <button
                  type="button"
                  onClick={() => navigate(`/tracking/${currentRide.ride_id}`)}
                  className="w-full rounded-[2rem] bg-white p-5 text-left shadow-sm border border-slate-100"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Current Ride</p>
                  <h3 className="mt-2 text-lg font-black text-slate-900">Track your rider in real time</h3>
                  <p className="mt-1 text-sm font-medium text-slate-500">{currentRide.status.replaceAll('_', ' ')} • {currentRide.vehicle_type}</p>
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mb-8 shadow-lg">
            <span className="material-symbols-outlined text-6xl text-rose-600" style={materialIconFill}>two_wheeler</span>
          </div>
          <h2 className="font-black text-4xl text-slate-900 mb-3 text-center">QuickDrop Rides</h2>
          <p className="text-base text-slate-600 font-medium text-center px-6 mb-8 max-w-sm leading-relaxed">
            Fast, reliable, and affordable rides from trusted drivers. Get where you need to go.
          </p>
          
          {/* Features */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-sm mb-12">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-rose-600 text-xl">schedule</span>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-500 text-center">Fast</p>
              <p className="text-[9px] text-slate-400 text-center">3-8 mins</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-rose-600 text-xl">verified</span>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-500 text-center">Safe</p>
              <p className="text-[9px] text-slate-400 text-center">Trusted drivers</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-rose-600 text-xl">payments</span>
              </div>
              <p className="text-[10px] font-black uppercase text-slate-500 text-center">Affordable</p>
              <p className="text-[9px] text-slate-400 text-center">Fixed pricing</p>
            </div>
          </div>

          {/* CTA Button */}
          <button 
            onClick={() => navigate('/request-rider')}
            style={signatureGradient}
            className="w-full max-w-sm py-4 px-8 rounded-2xl text-white text-base font-black uppercase tracking-widest shadow-xl active:scale-95 transition-transform mb-4"
          >
            Request a Ride
          </button>

          <button 
            type="button"
            onClick={() => navigate('/request-rider')}
            className="w-full max-w-sm py-3 px-8 rounded-2xl text-slate-900 text-sm font-bold uppercase tracking-widest border-2 border-slate-200 hover:bg-slate-50 active:scale-95 transition-transform mb-4"
          >
            Send Rider To Pick Item
          </button>

          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full max-w-sm py-3 px-8 rounded-2xl text-slate-900 text-sm font-bold uppercase tracking-widest border-2 border-slate-200 hover:bg-slate-50 active:scale-95 transition-transform"
          >
            Continue Shopping
          </button>
        </div>
      </main>

      {/* Persistent Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-8 pt-4 bg-white/95 backdrop-blur-2xl border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
        <Link to="/dashboard" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">home</span>
          <span className="text-[10px] font-black uppercase mt-1">Home</span>
        </Link>
        <Link to="/market" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">storefront</span>
          <span className="text-[10px] font-black uppercase mt-1">Market</span>
        </Link>
        <button disabled className="flex flex-col items-center text-rose-600 flex-1">
          <span className="material-symbols-outlined text-2xl" style={materialIconFill}>two_wheeler</span>
          <span className="text-[10px] font-black uppercase mt-1">Ride</span>
        </button>
        <Link to="/orders" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">receipt_long</span>
          <span className="text-[10px] font-black uppercase mt-1">Orders</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-slate-400 group flex-1">
          <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">person</span>
          <span className="text-[10px] font-black uppercase mt-1">Profile</span>
        </Link>
      </nav>
    </div>
  );
};
