import React, { useState } from "react";
import { Bike, Car, IdCard, MapPin, Truck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { updateRiderProfile } from "../api/rider";
import { BottomSheetModal } from "../components/common/BottomSheetModal";
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
    <BottomSheetModal
      eyebrow="Rider Setup"
      title="Finish your rider profile"
      subtitle="This onboarding opens like a bottom sheet and keeps the whole form thumb-friendly on smaller screens."
      onClose={() => navigate(-1)}
      className="max-w-4xl"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.8rem] bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-300">Rider Access</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Get verified and start receiving delivery requests.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Dispatch uses your address, vehicle type, and license details to match you with the right orders and keep customers informed.
          </p>

          <div className="mt-8 grid gap-3">
            <VehicleHint icon={Bike} label="Bike" text="Fast inner-city pickups and handoffs" />
            <VehicleHint icon={Car} label="Car" text="Balanced option for larger orders and distance" />
            <VehicleHint icon={Truck} label="Van" text="Heavy or multi-order delivery capacity" />
          </div>
        </section>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setError("");
            mutation.mutate(form);
          }}
          className="space-y-5 rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-lg sm:p-7"
        >
          <div className="flex flex-col items-center gap-4 rounded-[1.6rem] bg-slate-50 p-5 text-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Rider profile preview" className="h-full w-full object-cover" />
              ) : (
                <IdCard className="text-slate-300" size={30} />
              )}
            </div>
            <label className="cursor-pointer rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-700 transition hover:bg-orange-100">
              Upload Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          <SheetInput label="Phone Number" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />

          <div className="grid gap-4 sm:grid-cols-2">
            <SheetInput label="City" value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
            <SheetInput label="State" value={form.state} onChange={(value) => setForm((current) => ({ ...current, state: value }))} />
          </div>

          <SheetInput
            label="Street Address"
            value={form.street}
            onChange={(value) => setForm((current) => ({ ...current, street: value }))}
          />
          <SheetInput
            label="PO Box"
            required={false}
            value={form.po_box}
            onChange={(value) => setForm((current) => ({ ...current, po_box: value }))}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Vehicle Type</label>
              <select
                value={form.vehicle_type}
                onChange={(event) => setForm((current) => ({ ...current, vehicle_type: event.target.value }))}
                className={baseInputClassName}
              >
                <option value="bike">Bike</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
              </select>
            </div>

            <SheetInput
              label="License Number"
              value={form.license_number}
              onChange={(value) => setForm((current) => ({ ...current, license_number: value }))}
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
          ) : null}

          <button
            disabled={mutation.isPending}
            className="w-full rounded-[1.4rem] bg-[#0A192F] px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-white transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-60"
          >
            {mutation.isPending ? "Saving Profile..." : "Complete Rider Setup"}
          </button>
        </form>
      </div>
    </BottomSheetModal>
  );
};

const baseInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white";

const SheetInput = ({ label, value, onChange, required = true }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</label>
    <input value={value} required={required} onChange={(event) => onChange(event.target.value)} className={baseInputClassName} />
  </div>
);

const VehicleHint = ({ icon: Icon, label, text }) => (
  <div className="rounded-2xl bg-white/5 px-4 py-3">
    <div className="flex items-center gap-2 text-sm font-bold text-white">
      <Icon size={16} className="text-orange-300" />
      {label}
    </div>
    <p className="mt-1 text-sm text-slate-300">{text}</p>
  </div>
);
