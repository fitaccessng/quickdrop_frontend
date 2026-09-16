import React, { useState } from "react";
import { Bike, Car, Truck, IdCard } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { updateRiderProfile } from "../api/rider";
import { useAuthStore } from "../store/authStore";
import quickdropLogo from "../styles/quickdrop.jpeg";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const SOUTH_AFRICAN_CITIES = [
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Soweto", "Sandton", "Centurion", 
  "Midrand", "Bloemfontein", "Port Elizabeth", "East London", "Polokwane", "Nelspruit", 
  "Kimberley", "Rustenburg", "Pietermaritzburg",
];

const STEP_DETAILS = {
  1: { title: "Rider Identity", subtitle: "Profile photo, name & bio", icon: "badge" },
  2: { title: "Contact & Location", subtitle: "Phone number & base address", icon: "location_on" },
  3: { title: "Vehicle & Logistics", subtitle: "Transport type & license details", icon: "two_wheeler" },
};

export const RiderOnboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((state) => state.setProfile);
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [form, setForm] = useState({
    full_name: user?.full_name || "",
    bio: user?.bio || "",
    date_of_birth: user?.date_of_birth || "",
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

  const handleNext = (e) => {
    if (e) e.preventDefault();
    setError("");
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      mutation.mutate(form);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-100 flex justify-center items-center font-sans overflow-hidden select-none sm:py-6">
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md h-full sm:h-[92vh] bg-white sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl sm:border sm:border-slate-200 relative">
        
        {/* Mobile Header with Arrow Back & Logo */}
        <header className="shrink-0 bg-white/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-slate-100 z-20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {/* Go Back Arrow Button */}
            <button 
              type="button"
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-800 transition-all cursor-pointer"
              aria-label="Go back"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
            </button>

            {/* QuickDrop Logo & App Title Center */}
            <div className="flex items-center gap-2">
              <img src={quickdropLogo} alt="QuickDrop Logo" className="w-7 h-7 rounded-lg object-cover shadow-sm border border-slate-200" />
              <span className="text-slate-900 font-extrabold text-base tracking-tight">QuickDrop</span>
            </div>

            {/* Progress Badge */}
            <span className="text-xs font-black text-[#ff9300] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>

          {/* Segmented Step Indicator */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= step ? "bg-[#ff9300]" : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </header>

        {/* Scrollable Form Content */}
        <main className="flex-1 overflow-y-auto px-5 py-6 space-y-6 text-slate-800 scrollbar-none pb-28">
          
          {/* Active Step Info Card */}
          <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#ff9300] flex items-center justify-center shrink-0 border border-orange-100">
              <span className="material-symbols-outlined text-2xl">
                {STEP_DETAILS[currentStep]?.icon || "badge"}
              </span>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#ff9300]">
                Step {currentStep} of {totalSteps}
              </div>
              <h2 className="text-slate-900 font-bold text-base tracking-tight">
                {STEP_DETAILS[currentStep]?.title}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {STEP_DETAILS[currentStep]?.subtitle}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleNext} id="rider-onboarding-form" className="space-y-4">
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Profile Photo Uploader */}
                <div className="flex flex-col items-center pt-2 pb-1">
                  <div className="relative mb-2">
                    <div className="h-24 w-24 rounded-[2rem] overflow-hidden border-4 border-slate-100 shadow-xl bg-slate-900 flex items-center justify-center">
                      {form.avatar_url ? (
                        <img src={form.avatar_url} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <IdCard className="text-slate-600" size={32} />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 h-9 w-9 bg-[#ff9300] rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-90 transition-all border-4 border-white">
                      <span className="material-symbols-outlined text-white text-xs">photo_camera</span>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Rider Profile Photo</span>
                </div>

                <Field label="Full Legal Name">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                    <input
                      className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400"
                      placeholder="e.g. John Doe"
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setForm({...form, full_name: e.target.value})}
                    />
                  </div>
                </Field>

                <Field label="Date of Birth">
                  <input
                    className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400"
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({...form, date_of_birth: e.target.value})}
                  />
                </Field>

                <Field label="Short Bio / Experience">
                  <textarea
                    className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all h-20 resize-none placeholder:text-slate-400"
                    placeholder="Briefly describe your delivery experience..."
                    value={form.bio}
                    onChange={(e) => setForm({...form, bio: e.target.value})}
                  />
                </Field>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <Field label="Phone Number">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">phone</span>
                    <input
                      className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400"
                      placeholder="Contact number"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({...form, phone: e.target.value})}
                    />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="City">
                    <div className="relative">
                      <select 
                        className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-3 pr-8 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] appearance-none transition-all cursor-pointer"
                        value={form.city}
                        onChange={(e) => setForm({...form, city: e.target.value})}
                      >
                        <option value="" className="text-slate-400">Select City</option>
                        {SOUTH_AFRICAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-slate-400 pointer-events-none text-lg">expand_more</span>
                    </div>
                  </Field>

                  <Field label="State / Area">
                    <input
                      className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-3 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400"
                      placeholder="State"
                      type="text"
                      value={form.state}
                      onChange={(e) => setForm({...form, state: e.target.value})}
                    />
                  </Field>
                </div>

                <Field label="Base Street Address">
                  <input
                    className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400"
                    placeholder="Where are you based?"
                    type="text"
                    value={form.street}
                    onChange={(e) => setForm({...form, street: e.target.value})}
                  />
                </Field>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <Field label="Vehicle Type">
                  <div className="relative">
                    <select
                      className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 pr-10 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] appearance-none transition-all cursor-pointer"
                      value={form.vehicle_type}
                      onChange={(e) => setForm({...form, vehicle_type: e.target.value})}
                    >
                      <option value="bike">Motorbike</option>
                      <option value="car">Car</option>
                      <option value="van">Delivery Van</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </Field>

                <Field label="License / ID Number">
                  <input
                    className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400"
                    placeholder="ID or Driver's License"
                    type="text"
                    value={form.license_number}
                    onChange={(e) => setForm({...form, license_number: e.target.value})}
                  />
                </Field>

                {/* Quick Visual Hints */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div onClick={() => setForm({...form, vehicle_type: 'bike'})} className="cursor-pointer">
                    <VehicleHint Icon={Bike} label="Bike" active={form.vehicle_type === 'bike'} />
                  </div>
                  <div onClick={() => setForm({...form, vehicle_type: 'car'})} className="cursor-pointer">
                    <VehicleHint Icon={Car} label="Car" active={form.vehicle_type === 'car'} />
                  </div>
                  <div onClick={() => setForm({...form, vehicle_type: 'van'})} className="cursor-pointer">
                    <VehicleHint Icon={Truck} label="Van" active={form.vehicle_type === 'van'} />
                  </div>
                </div>
              </div>
            )}
          </form>
        </main>

        {/* Mobile Sticky Bottom CTA */}
        <footer className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-100 z-20">
          <button
            type="button"
            onClick={handleNext}
            disabled={mutation.isPending}
            className="w-full bg-[#ff9300] active:bg-orange-600 text-white font-bold py-3.5 text-base rounded-2xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {mutation.isPending ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Completing Setup...</span>
              </>
            ) : currentStep === totalSteps ? (
              <>
                <span>Complete Rider Setup</span>
                <span className="material-symbols-outlined text-xl">verified_user</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </>
            )}
          </button>
        </footer>

      </div>
    </div>
  );
};

const Field = ({ label, children, error }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1 block">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 font-semibold ml-1">{error}</p>}
  </div>
);

const VehicleHint = ({ Icon, label, active }) => (
  <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1 ${active ? 'bg-orange-50 border-orange-200 text-[#ff9300]' : 'bg-slate-50 border-slate-200/80 text-slate-400'}`}>
    <Icon size={20} />
    <span className="text-[10px] font-bold tracking-wide">{label}</span>
  </div>
);