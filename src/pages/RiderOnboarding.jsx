import React, { useState } from "react";
import { Bike, Car, IdCard, Truck, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { updateRiderProfile } from "../api/rider";
import { useAuthStore } from "../store/authStore";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const RiderOnboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((state) => state.setProfile);
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState({
    phone: user?.phone || "",
    city: user?.city || "",
    state: user?.state || "",
    street: user?.street || "",
    po_box: user?.po_box || "",
    vehicle_type: user?.vehicle_type || "bike",
    license_number: user?.license_number || "",
    rider_status: "available",
    avatar_url: user?.avatar_url || "",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: updateRiderProfile,
    onSuccess: (data) => {
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: ["rider-profile"] });
      navigate("/rider/dashboard");
    },
    onError: (err) => {
      const statusCode = err.response?.status;
      const detail = err.response?.data?.detail;

      if (statusCode === 401) {
        clearSession();
        navigate("/rider/login", {
          replace: true,
          state: { message: "Your session expired. Please log in again." },
        });
        return;
      }

      if (Array.isArray(detail)) {
        const message = detail
          .map((item) => {
            if (typeof item === "string") return item;
            if (item?.msg) {
              const field = Array.isArray(item.loc) ? item.loc[item.loc.length - 1] : "field";
              return `${field}: ${item.msg}`;
            }
            return "Invalid input";
          })
          .join(", ");
        setError(message || "Unable to complete onboarding.");
        return;
      }
      setError(typeof detail === "string" ? detail : "Unable to complete onboarding.");
    },
  });

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const avatarUrl = await readFileAsDataUrl(file);
      setForm((current) => ({ ...current, avatar_url: avatarUrl }));
      setError("");
    } catch {
      setError("Unable to read the selected image.");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body">
      {/* --- Header & Rider Identity --- */}
      <div className="pt-10 pb-8 px-6 flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="h-24 w-24 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-900 flex items-center justify-center">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <IdCard className="text-slate-700" size={32} />
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#ff9300] rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-all border-4 border-slate-950">
            <span className="material-symbols-outlined text-white text-sm">photo_camera</span>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>
        
        <h1 className="text-white font-headline text-2xl font-black tracking-tight">Rider Verification</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium">Complete setup to start receiving orders</p>
      </div>

      {/* --- Bottom Sheet Container --- */}
      <div className="flex-1 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-8 pb-12 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 -mt-2" />

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact Details */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">phone</span>
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                  placeholder="Contact number"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                />
              </div>
            </div>

            {/* Logistics Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vehicle Type</label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm appearance-none"
                    value={form.vehicle_type}
                    onChange={(e) => setForm({...form, vehicle_type: e.target.value})}
                  >
                    <option value="bike">Motorbike</option>
                    <option value="car">Car</option>
                    <option value="van">Delivery Van</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">License No.</label>
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                  placeholder="ID / License"
                  type="text"
                  required
                  value={form.license_number}
                  onChange={(e) => setForm({...form, license_number: e.target.value})}
                />
              </div>
            </div>

            {/* Address Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                  placeholder="City"
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({...form, city: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State / Area</label>
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                  placeholder="State"
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm({...form, state: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Street Address</label>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                placeholder="Where are you based?"
                type="text"
                required
                value={form.street}
                onChange={(e) => setForm({...form, street: e.target.value})}
              />
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-slate-900 text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-slate-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Validating...' : 'Complete Rider Setup'}
              <span className="material-symbols-outlined font-bold">verified_user</span>
            </button>
          </form>

          {/* Quick Hints */}
          <div className="mt-8 grid grid-cols-3 gap-2">
            <VehicleHint Icon={Bike} active={form.vehicle_type === 'bike'} />
            <VehicleHint Icon={Car} active={form.vehicle_type === 'car'} />
            <VehicleHint Icon={Truck} active={form.vehicle_type === 'van'} />
          </div>
        </div>
      </div>
    </div>
  );
};

const VehicleHint = ({ Icon, active }) => (
  <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${active ? 'bg-orange-50 border-orange-200 text-[#ff9300]' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>
    <Icon size={20} />
  </div>
);