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
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen pb-32 flex flex-col items-center">
      <div className="w-full max-w-4xl lg:max-w-6xl min-h-screen flex flex-col relative">
        
        {/* Fixed Header */}
        <header className="bg-white/90 backdrop-blur-xl fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl lg:max-w-6xl z-50 border-b border-slate-100">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-900 active:scale-90 transition-transform border border-slate-100"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back_ios_new</span>
            </button>
            
            <h1 className="text-sm sm:text-base font-black font-headline tracking-tight">Request a Ride</h1>
            
            <div className="w-9 sm:w-10"></div>
          </div>
        </header>

        <main className="pt-28 sm:pt-32 px-4 sm:px-6 flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-md flex flex-col items-center justify-center py-6">
            
            {/* Active Ride / Order Banners */}
            {activeOrder || currentRide ? (
              <div className="w-full mb-8 space-y-3">
                {activeOrder ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/tracking/${activeOrder.id}`)}
                    className="w-full rounded-[2rem] bg-white p-5 text-left shadow-sm border border-slate-100 hover:border-slate-300 transition-all"
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
                    className="w-full rounded-[2rem] bg-white p-5 text-left shadow-sm border border-slate-100 hover:border-slate-300 transition-all"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Current Ride</p>
                    <h3 className="mt-2 text-lg font-black text-slate-900">Track your rider in real time</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">{currentRide.status.replaceAll('_', ' ')} • {currentRide.vehicle_type}</p>
                  </button>
                ) : null}
              </div>
            ) : null}

            {/* Hero Section */}
            <div className="w-32 h-32 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-rose-100">
              <span className="material-symbols-outlined text-6xl text-rose-600" style={materialIconFill}>two_wheeler</span>
            </div>
            <h2 className="font-black text-3xl sm:text-4xl text-slate-900 mb-3 text-center tracking-tight">QuickDrop Rides</h2>
            <p className="text-sm sm:text-base text-slate-600 font-medium text-center mb-8 max-w-sm leading-relaxed">
              Fast, reliable, and affordable rides from trusted drivers. Get where you need to go.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-3 gap-3 w-full mb-10">
              <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-rose-600 text-lg">schedule</span>
                </div>
                <p className="text-[10px] font-black uppercase text-slate-700 text-center">Fast</p>
                <p className="text-[9px] text-slate-400 text-center">3-8 mins</p>
              </div>
              <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-rose-600 text-lg">verified</span>
                </div>
                <p className="text-[10px] font-black uppercase text-slate-700 text-center">Safe</p>
                <p className="text-[9px] text-slate-400 text-center">Trusted drivers</p>
              </div>
              <div className="flex flex-col items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-rose-600 text-lg">payments</span>
                </div>
                <p className="text-[10px] font-black uppercase text-slate-700 text-center">Affordable</p>
                <p className="text-[9px] text-slate-400 text-center">Fixed pricing</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={() => navigate('/request-rider')}
                style={signatureGradient}
                className="w-full py-4 px-8 rounded-2xl text-white text-sm sm:text-base font-black uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-95 transition-transform"
              >
                Request a Ride
              </button>

              <button 
                type="button"
                onClick={() => navigate('/request-rider')}
                className="w-full py-3.5 px-8 rounded-2xl text-slate-900 text-xs sm:text-sm font-black uppercase tracking-widest bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 transition-transform shadow-sm"
              >
                Send Rider To Pick Item
              </button>

              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full py-3.5 px-8 rounded-2xl text-slate-900 text-xs sm:text-sm font-black uppercase tracking-widest bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 transition-transform shadow-sm"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </main>

        {/* Persistent Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl lg:max-w-6xl z-50 flex justify-around items-center px-2 pb-8 pt-4 bg-white/95 backdrop-blur-2xl border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
          <Link to="/dashboard" className="flex flex-col items-center text-slate-400 group flex-1">
            <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">home</span>
            <span className="text-[10px] font-black uppercase mt-1">Home</span>
          </Link>
          <Link to="/market" className="flex flex-col items-center text-slate-400 group flex-1">
            <span className="material-symbols-outlined text-2xl group-hover:text-rose-600 transition-colors">storefront</span>
            <span className="text-[10px] font-black uppercase mt-1">Market</span>
          </Link>
          <button disabled className="flex flex-col items-center text-rose-600 flex-1 cursor-default">
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
    </div>
  );
};