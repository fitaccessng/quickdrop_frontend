import React, { useState } from "react";
import { Camera, CheckCircle2, MapPin, Phone } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { updateProfile } from "../api/auth";
import { BottomSheetModal } from "../components/common/BottomSheetModal";
import { useAuthStore } from "../store/authStore";

const SA_CITIES = [
  "Johannesburg",
  "Pretoria",
  "Sandton",
  "Soweto",
  "Centurion",
  "Cape Town",
  "Stellenbosch",
  "Paarl",
  "George",
  "Somerset West",
  "Durban",
  "Umhlanga",
  "Pietermaritzburg",
  "Ballito",
  "Gqeberha",
  "East London",
  "Makhanda",
  "Bloemfontein",
  "Welkom",
  "Sasolburg",
  "Polokwane",
  "Mbombela",
  "Rustenburg",
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
    <BottomSheetModal
      eyebrow="Customer Setup"
      title="Set up your delivery profile"
      subtitle="Everything here lives in a mobile-first bottom sheet so the form feels native on phones and still stays elegant on larger screens."
      onClose={() => navigate(-1)}
      className="max-w-4xl"
    >
      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[1.8rem] bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-300">Ready To Deliver</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">A complete address makes every drop faster.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            Add your contact details, street location, and profile photo so orders and support updates always reach the right person.
          </p>

          <div className="mt-8 space-y-3">
            <FeatureRow icon={Phone} text="Realtime order and support updates" />
            <FeatureRow icon={MapPin} text="Cleaner delivery handoff for riders" />
            <FeatureRow icon={CheckCircle2} text="Onboarding unlocks your customer dashboard" />
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.8rem] border border-slate-100 bg-white p-5 shadow-lg sm:p-7">
          <div className="flex flex-col items-center rounded-[1.6rem] bg-slate-50 p-5 text-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
              {previewImage ? (
                <img src={previewImage} alt="Customer profile preview" className="h-full w-full object-cover" />
              ) : (
                <Camera className="text-slate-300" size={28} />
              )}
            </div>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-orange-700 transition hover:bg-orange-100">
              Upload Photo
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <SheetInput
            label="Phone Number"
            value={form.phone}
            onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
            placeholder="+234 800 000 0000"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SheetSelect
              label="City"
              value={form.city}
              onChange={(value) => setForm((prev) => ({ ...prev, city: value }))}
            >
              <option value="">Select city</option>
              {SA_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </SheetSelect>

            <SheetInput
              label="State / Area"
              value={form.state}
              onChange={(value) => setForm((prev) => ({ ...prev, state: value }))}
              placeholder="Lagos Island"
            />
          </div>

          <SheetInput
            label="Street Address"
            value={form.street}
            onChange={(value) => setForm((prev) => ({ ...prev, street: value }))}
            placeholder="12 Admiralty Way"
          />

          <SheetInput
            label="PO Box"
            required={false}
            value={form.pobox}
            onChange={(value) => setForm((prev) => ({ ...prev, pobox: value }))}
            placeholder="Optional"
          />

          {mutation.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              We could not save your profile right now. Please try again.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-[1.4rem] bg-[linear-gradient(135deg,#ff9300_0%,#ffb857_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-white shadow-[0_22px_40px_-24px_rgba(255,147,0,0.9)] transition active:scale-[0.99] disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : "Complete Setup"}
          </button>
        </form>
      </div>
    </BottomSheetModal>
  );
};

const FeatureRow = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200">
    <Icon size={16} className="text-orange-300" />
    <span>{text}</span>
  </div>
);

const baseInputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white";

const SheetInput = ({ label, value, onChange, placeholder, required = true }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</label>
    <input
      value={value}
      required={required}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={baseInputClassName}
    />
  </div>
);

const SheetSelect = ({ label, value, onChange, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</label>
    <select value={value} onChange={(event) => onChange(event.target.value)} className={baseInputClassName}>
      {children}
    </select>
  </div>
);
