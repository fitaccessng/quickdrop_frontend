import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { requestRide } from '../api/rides';

const VEHICLE_TYPES = [
  { id: 'bike', label: 'Kinetic Bike', icon: 'pedal_bike', eta: '3 mins', price: 1200, desc: 'Fastest for city traffic' },
  { id: 'car', label: 'Standard', icon: 'directions_car', eta: '6 mins', price: 2500, desc: 'Comfortable 4-seater' },
  { id: 'xl', label: 'Premium XL', icon: 'local_taxi', eta: '8 mins', price: 4200, desc: 'Luxury SUV for groups' },
];

const formatMoney = (amount) => {
  return `R ${amount.toLocaleString()}`;
};

export const RequestRiderPage = () => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_TYPES[0]);
  
  const [formData, setFormData] = useState({
    phone_number: "",
    receiver_name: "",
    receiver_phone: "",
    pickup: "",
    destination: "",
    delivery_note: ""
  });

  const signatureGradient = "linear-gradient(135deg, #ff9300 0%, #ffb857 100%)";
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const riderMutation = useMutation({
    mutationFn: (payload) => requestRide(payload),
    onSuccess: (data) => {
      navigate(`/tracking/${data.ride_id}`, { state: { rideData: data } });
    },
    onError: (error) => {
      alert(error.response?.data?.detail || 'Failed to request rider. Please try again.');
    },
  });

  const handleRequest = () => {
    if (!formData.destination || !formData.receiver_name) {
      alert("Please fill in the destination and receiver name.");
      return;
    }

    riderMutation.mutate({
      ...formData,
      vehicle_type: selectedVehicle.id,
      price: selectedVehicle.price,
      pickup_location: formData.pickup,
      dropoff_location: formData.destination,
    });
  };

  // Reusable input class with visible borders
  const inputClass = "w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-[#ff9300] focus:ring-1 focus:ring-[#ff9300] outline-none transition-all placeholder:text-slate-300 placeholder:font-normal";

  return (
    <div className="bg-[#f5f6f7] font-body text-slate-900 min-h-screen flex flex-col antialiased">
      
      {/* --- Top Navigation --- */}
      <header className="fixed top-0 w-full z-50 p-6 flex justify-between items-center bg-[#f5f6f7]/80 backdrop-blur-xl border-b border-slate-200/50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-slate-600">arrow_back</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff9300]">Request</h1>
          <p className="text-xs font-bold text-slate-400">Logistics Curator</p>
        </div>
        <div className="w-10" />
      </header>

      {/* --- Main Form Content --- */}
      <main className="flex-1 pt-24 pb-80 px-6 overflow-y-auto space-y-8">
        
        {/* Section: Sender Info */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-sm text-[#ff9300]" style={materialIconFill}>person</span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sender Identity</h2>
          </div>
          
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase">Your Phone Number</label>
              <input 
                type="tel"
                placeholder="+254 700 000 000"
                className={inputClass}
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              />
            </div>
          </div>
        </section>

        {/* Section: Delivery Details */}
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-sm text-[#ff9300]" style={materialIconFill}>near_me</span>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logistics Route</h2>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/60 space-y-6">
            
            {/* Receiver Sub-form */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase">Receiver Name</label>
                <input 
                  type="text"
                  className={inputClass}
                  placeholder="Full name"
                  onChange={(e) => setFormData({...formData, receiver_name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase">Receiver Phone</label>
                <input 
                  type="tel"
                  className={inputClass}
                  placeholder="+234..."
                  onChange={(e) => setFormData({...formData, receiver_phone: e.target.value})}
                />
              </div>
            </div>

            {/* Pickup & Destination */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-emerald-600 uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">location_on</span> Pick up
                </label>
                <input 
                  className={inputClass}
                  placeholder="Where are we picking from?" 
                  onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#ff9300] uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">flag</span> Destination
                </label>
                <input 
                  className={inputClass}
                  placeholder="Set drop-off location" 
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                />
              </div>
            </div>

            {/* Note */}
            <div className="pt-2">
               <label className="text-[9px] font-black text-slate-400 uppercase block mb-2">Delivery Note</label>
               <textarea 
                rows="2"
                className={`${inputClass} resize-none font-medium`}
                placeholder="Ex: Leave at the gate, call on arrival..."
                onChange={(e) => setFormData({...formData, delivery_note: e.target.value})}
               />
            </div>
          </div>
        </section>
      </main>

      {/* --- Persistent Bottom Action Sheet --- */}
      <section className="fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-2xl rounded-t-[3rem] shadow-[0_-15px_50px_rgba(0,0,0,0.1)] border-t border-slate-100 p-8 pb-10">
        <div className="max-w-xl mx-auto">
          
          <div className="grid grid-cols-3 gap-3 mb-8">
            {VEHICLE_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedVehicle(type)}
                className={`p-3 rounded-2xl flex flex-col items-center transition-all border-2 ${
                  selectedVehicle.id === type.id 
                  ? 'border-[#ff9300] bg-orange-50 shadow-sm' 
                  : 'border-transparent bg-slate-50 opacity-60'
                }`}
              >
                <span className="material-symbols-outlined text-2xl mb-1" style={{ color: selectedVehicle.id === type.id ? '#ff9300' : '#64748b' }}>
                  {type.icon}
                </span>
                <span className={`text-[8px] font-black uppercase tracking-tighter ${selectedVehicle.id === type.id ? 'text-[#ff9300]' : 'text-slate-400'}`}>
                  {type.label}
                </span>
                <span className="text-[10px] font-bold text-slate-900">{type.eta}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-end mb-6">
            <div>
               <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff9300] mb-1">Estimated Cost</p>
               <p className="text-3xl font-black text-slate-900 tracking-tighter">
                {formatMoney(selectedVehicle.price)}
               </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="flex items-center gap-1 text-emerald-600 text-[10px] font-black uppercase mb-1">
                <span className="material-symbols-outlined text-sm">verified</span> Wallet Active
              </span>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Inclusive of VAT</p>
            </div>
          </div>

          <button
            disabled={riderMutation.isPending}
            onClick={handleRequest}
            className="w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-200 active:scale-95 transition-all flex items-center justify-center gap-3"
            style={{ background: signatureGradient }}
          >
            {riderMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Confirm Delivery 
                <span className="material-symbols-outlined text-lg">rocket_launch</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
