import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
      setError("Unable to read the selected image. Please try another file.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f6f7] px-6 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2.5rem] bg-slate-900 p-8 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">Rider Setup</p>
          <h1 className="mt-4 font-headline text-4xl font-extrabold leading-tight">Finish your delivery profile.</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Add your service area, delivery vehicle, and rider identity so dispatch can send you live orders.
          </p>
        </section>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            mutation.mutate(form);
          }}
          className="space-y-6 rounded-[3rem] border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200/50"
        >
          <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-slate-50 p-6">
            <div className="h-28 w-28 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Rider profile preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <span className="material-symbols-outlined text-5xl">person</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer rounded-2xl bg-[#0A192F] px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-orange-600">
              Upload Profile Picture
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
            <p className="text-center text-xs text-slate-500">Choose a clear photo from your device.</p>
          </div>

          <div className="mb-4">
            <h3 className="text-xl font-bold text-[#0A192F]">Rider Details</h3>
            <p className="text-sm text-slate-500 font-light">Fill in your information to start your journey.</p>
          </div>

          <GridInput 
            label="Phone Number" 
            value={form.phone} 
            onChange={(value) => setForm((current) => ({ ...current, phone: value }))} 
          />

          <div className="grid gap-6 md:grid-cols-2">
            <GridInput 
              label="City" 
              value={form.city} 
              onChange={(value) => setForm((current) => ({ ...current, city: value }))} 
            />
            <GridInput 
              label="State" 
              value={form.state} 
              onChange={(value) => setForm((current) => ({ ...current, state: value }))} 
            />
          </div>

          <GridInput 
            label="Street Address" 
            value={form.street} 
            onChange={(value) => setForm((current) => ({ ...current, street: value }))} 
          />

          <GridInput 
            label="PO Box" 
            required={false} 
            value={form.po_box} 
            onChange={(value) => setForm((current) => ({ ...current, po_box: value }))} 
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Vehicle Type</label>
              <select 
                value={form.vehicle_type} 
                onChange={(event) => setForm((current) => ({ ...current, vehicle_type: event.target.value }))} 
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-black font-medium focus:border-orange-500 focus:bg-white focus:outline-none transition-all appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23000000'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1.2rem' }}
              >
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
              </select>
            </div>
            <GridInput 
              label="License Number" 
              value={form.license_number} 
              onChange={(value) => setForm((current) => ({ ...current, license_number: value }))} 
            />
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
              <span>⚠️</span> {error}
            </div>
          )}

          <button 
            disabled={mutation.isPending} 
            className="group relative w-full overflow-hidden rounded-[1.5rem] bg-[#0A192F] py-5 font-bold uppercase tracking-widest text-white transition-all hover:bg-orange-600 active:scale-[0.98] disabled:opacity-70"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {mutation.isPending ? "Saving Profile..." : "Complete Rider Setup"}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
};

// UPDATED: GridInput now correctly applies text-black and accepts className
const GridInput = ({ label, value, onChange, required = true, className = "" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">{label}</label>
    <input
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      // Added text-black here. It also merges any className passed from the parent.
      className={`w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-black font-medium focus:border-orange-500 focus:bg-white focus:outline-none transition-all ${className}`}
    />
  </div>
);
