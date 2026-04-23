import React, { useState } from "react";
import { Camera, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import quickdropLogo from "../styles/quickdrop.jpeg";

const SA_CITIES = [
  "Johannesburg", "Pretoria", "Sandton", "Soweto", "Centurion", 
  "Cape Town", "Stellenbosch", "Paarl", "George", "Somerset West", 
  "Durban", "Umhlanga", "Pietermaritzburg", "Ballito", "Gqeberha", 
  "East London", "Makhanda", "Bloemfontein", "Welkom", "Sasolburg", 
  "Polokwane", "Mbombela", "Rustenburg",
];

export const CustomerOnboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setProfile = useAuthStore((state) => state.setProfile);

  const [form, setForm] = useState({
    city: user?.city || "",
    state: user?.state || "",
    street: user?.street || "",
    pobox: user?.po_box || "",
    avatar_url: user?.avatar_url || "",
    phone: user?.phone || "",
  });
  const [previewImage, setPreviewImage] = useState(user?.avatar_url || "");

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      navigate("/dashboard");
    },
  });

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
      setForm((prev) => ({ ...prev, avatar_url: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({
      phone: form.phone,
      city: form.city,
      state: form.state,
      street: form.street,
      po_box: form.pobox || null,
      avatar_url: form.avatar_url || null,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body">
      {/* --- Header & Profile Upload --- */}
      <div className="pt-10 pb-8 px-6 flex flex-col items-center text-center">
        <div className="relative group mb-4">
          <div className="h-24 w-24 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-900 flex items-center justify-center">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <Camera className="text-slate-700" size={32} />
            )}
          </div>
          <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#ff9300] rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-all border-4 border-slate-950">
            <span className="material-symbols-outlined text-white text-sm">add_a_photo</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
        
        <h1 className="text-white font-headline text-2xl font-black tracking-tight">Setup Profile</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium">Complete your details for faster drops</p>
      </div>

      {/* --- Bottom Sheet Container --- */}
      <div className="flex-1 bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-8 pb-12 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 -mt-2" />

          {mutation.error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">
              Update failed. Please check your connection.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">phone</span>
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                  placeholder="+27 00 000 0000"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                />
              </div>
            </div>

            {/* City & Area Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm appearance-none"
                    value={form.city}
                    required
                    onChange={(e) => setForm({...form, city: e.target.value})}
                  >
                    <option value="">Select City</option>
                    {SA_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Area / State</label>
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                  placeholder="e.g. Sandton"
                  type="text"
                  required
                  value={form.state}
                  onChange={(e) => setForm({...form, state: e.target.value})}
                />
              </div>
            </div>

            {/* Street Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Street Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">map</span>
                <input
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                  placeholder="Street name and number"
                  type="text"
                  required
                  value={form.street}
                  onChange={(e) => setForm({...form, street: e.target.value})}
                />
              </div>
            </div>

            {/* PO Box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">P.O. Box (Optional)</label>
              <input
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#ff9300] outline-none transition-all font-medium text-sm"
                placeholder="Box Number"
                type="text"
                value={form.pobox}
                onChange={(e) => setForm({...form, pobox: e.target.value})}
              />
            </div>

            {/* Submit Button */}
            <button
              className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Complete Setup'}
              <span className="material-symbols-outlined font-bold">check_circle</span>
            </button>
          </form>

          <div className="mt-8 space-y-3">
             <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle2 size={18} className="text-green-500" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">Unlocks Customer Dashboard</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};