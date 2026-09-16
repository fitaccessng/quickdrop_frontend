import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { completeVendorOnboarding } from "../api/auth";
import { fetchServiceCategories } from "../api/system";
import { useAuthStore } from "../store/authStore";
import quickdropLogo from "../styles/quickdrop.jpeg";
import { getApiErrorMessage } from "../lib/errorMessage";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SOUTH_AFRICAN_CITIES = [
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Soweto", "Sandton", "Centurion", 
  "Midrand", "Bloemfontein", "Port Elizabeth", "East London", "Polokwane", "Nelspruit", 
  "Kimberley", "Rustenburg", "Pietermaritzburg",
];

const buildDefaultHours = () => ({
  Monday: { open: "09:00", close: "18:00", closed: false },
  Tuesday: { open: "09:00", close: "18:00", closed: false },
  Wednesday: { open: "09:00", close: "18:00", closed: false },
  Thursday: { open: "09:00", close: "18:00", closed: false },
  Friday: { open: "09:00", close: "18:00", closed: false },
  Saturday: { open: "10:00", close: "20:00", closed: false },
  Sunday: { open: "10:00", close: "20:00", closed: false },
});

const STEP_DETAILS = {
  1: { title: "Store Information", subtitle: "Storefront, location & hours", icon: "storefront" },
  2: { title: "Business Compliance", subtitle: "Registration & tax IDs", icon: "verified" },
  3: { title: "Bank Payouts", subtitle: "Where sales get deposited", icon: "account_balance" },
  4: { title: "Operations & Rules", subtitle: "Radius & order rules", icon: "tune" },
};

export const VendorOnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState({
    description: "",
    category: user?.category || "",
    street: "",
    po_box: "",
    city: user?.city || "",
    latitude: null,
    longitude: null,
    opening_hours: buildDefaultHours(),
    permit_url: null,
    tin: "",
    business_registration_number: "",
    vat_number: "",
    south_african_id_number: "",
    bank_name: "",
    bank_account_name: "",
    bank_account: "",
    prep_time_minutes: 20,
    minimum_order_amount: 0,
    delivery_radius_km: 5,
    auto_accept_orders: false,
    notifications_enabled: true,
    support_email: user?.email || "",
    support_phone: user?.phone || "",
  });

  useEffect(() => {
    if (!token && hasHydrated) {
      navigate("/vendor/login");
      return;
    }
    setIsHydrated(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => console.warn("Geolocation error:", error.message)
      );
    }
  }, [hasHydrated, token, navigate]);

  const categoriesQuery = useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchServiceCategories,
  });
  const categoryOptions = categoriesQuery.data?.map((item) => item.name) ?? [];

  const mutation = useMutation({
    mutationFn: completeVendorOnboarding,
    onSuccess: () => navigate("/vendor/dashboard"),
    onError: (error) => {
      const errorData = error.response?.data?.detail;
      if (Array.isArray(errorData)) {
        const errorMap = {};
        errorData.forEach((err) => {
          const field = err.loc?.[1] || "general";
          errorMap[field] = err.msg;
        });
        setErrors(errorMap);
      } else {
        setErrors({ general: getApiErrorMessage(error, "An error occurred") });
      }
    },
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      mutation.mutate(form);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    } else {
      navigate(-1);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="fixed inset-0 bg-slate-100 flex justify-center items-center font-sans overflow-hidden select-none sm:py-6">
      {/* Mobile Shell Frame */}
      <div className="w-full max-w-md h-full sm:h-[92vh] bg-white sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl sm:border sm:border-slate-200 relative">
        
        {/* Mobile Header with Arrow Back & Logo */}
        <header className="shrink-0 bg-white/90 backdrop-blur-md px-5 pt-4 pb-3 border-b border-slate-100 z-20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {/* Go Back Arrow Button */}
            <button 
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
              {Math.round((currentStep / 4) * 100)}%
            </span>
          </div>

          {/* Segmented Step Indicator */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[1, 2, 3, 4].map((step) => (
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
              <span className="material-symbols-outlined text-2xl">{STEP_DETAILS[currentStep].icon}</span>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#ff9300]">
                Step {currentStep} of 4
              </div>
              <h2 className="text-slate-900 font-bold text-base tracking-tight">
                {STEP_DETAILS[currentStep].title}
              </h2>
              <p className="text-slate-500 text-xs mt-0.5">
                {STEP_DETAILS[currentStep].subtitle}
              </p>
            </div>
          </div>

          {errors.general && (
            <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg shrink-0">error</span>
              <span>{errors.general}</span>
            </div>
          )}

          {/* Form Step Options */}
          <div>
            {currentStep === 1 && (
              <div className="space-y-4">
                <Field label="Business Bio" error={errors.description}>
                  <textarea 
                    className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] focus:ring-1 focus:ring-[#ff9300] transition-all h-24 resize-none placeholder:text-slate-400"
                    placeholder="Brief description of your store & offerings..."
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </Field>

                <Field label="Store Category" error={errors.category}>
                  <div className="relative">
                    <select 
                      className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 pr-10 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] appearance-none transition-all cursor-pointer"
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                    >
                      <option value="" className="text-slate-400">Select store category</option>
                      {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-3.5 top-3.5 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="City">
                    <div className="relative">
                      <select 
                        className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-3 pr-8 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] appearance-none transition-all cursor-pointer"
                        value={form.city}
                        onChange={e => setForm({...form, city: e.target.value})}
                      >
                        <option value="" className="text-slate-400">City</option>
                        {SOUTH_AFRICAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-slate-400 pointer-events-none text-lg">expand_more</span>
                    </div>
                  </Field>

                  <Field label="Country">
                    <input className="w-full text-slate-400 bg-slate-100 border border-slate-200 rounded-2xl py-3.5 px-3 text-xs sm:text-sm font-semibold cursor-not-allowed" value="South Africa" readOnly />
                  </Field>
                </div>

                <Field label="Street Address">
                  <input 
                    className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] focus:ring-1 focus:ring-[#ff9300] transition-all placeholder:text-slate-400"
                    placeholder="e.g. 123 Precinct Street"
                    value={form.street}
                    onChange={e => setForm({...form, street: e.target.value})}
                  />
                </Field>

                {/* Operating Hours Table */}
                <div className="pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Operating Hours</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                    {daysOfWeek.map(day => (
                      <div key={day} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-0">
                        <span className="text-xs font-semibold text-slate-700 w-20">{day.slice(0, 3)}</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="time"
                            className="text-xs text-slate-900 font-medium p-1.5 rounded-lg bg-white border border-slate-200 outline-none focus:border-[#ff9300]"
                            value={form.opening_hours[day].open}
                            onChange={e => setForm(prev => ({
                              ...prev,
                              opening_hours: {
                                ...prev.opening_hours,
                                [day]: { ...prev.opening_hours[day], open: e.target.value }
                              }
                            }))}
                          />
                          <span className="text-slate-400 text-[10px] uppercase font-bold">to</span>
                          <input
                            type="time"
                            className="text-xs text-slate-900 font-medium p-1.5 rounded-lg bg-white border border-slate-200 outline-none focus:border-[#ff9300]"
                            value={form.opening_hours[day].close}
                            onChange={e => setForm(prev => ({
                              ...prev,
                              opening_hours: {
                                ...prev.opening_hours,
                                [day]: { ...prev.opening_hours[day], close: e.target.value }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <Field label="SA ID Number">
                  <input className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400" value={form.south_african_id_number} onChange={e => setForm({...form, south_african_id_number: e.target.value})} placeholder="e.g. 9001015800088" />
                </Field>
                <Field label="Business Registration Number">
                  <input className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400" value={form.business_registration_number} onChange={e => setForm({...form, business_registration_number: e.target.value})} placeholder="e.g. 2024/123456/07" />
                </Field>
                <Field label="TIN / Tax Number">
                  <input className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400" value={form.tin} onChange={e => setForm({...form, tin: e.target.value})} placeholder="Tax Identification Number" />
                </Field>
                <Field label="VAT Number (Optional)">
                  <input className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400" value={form.vat_number} onChange={e => setForm({...form, vat_number: e.target.value})} placeholder="VAT registration number" />
                </Field>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <Field label="Bank Name">
                  <input className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400" value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="e.g. FNB, Capitec, Standard Bank" />
                </Field>
                <Field label="Account Holder Name">
                  <input className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400" value={form.bank_account_name} onChange={e => setForm({...form, bank_account_name: e.target.value})} placeholder="Registered business or legal name" />
                </Field>
                <Field label="Account Number">
                  <input className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all placeholder:text-slate-400" value={form.bank_account} onChange={e => setForm({...form, bank_account: e.target.value})} placeholder="Account number" />
                </Field>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Min Order (R)">
                    <input type="number" className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all" value={form.minimum_order_amount} onChange={e => setForm({...form, minimum_order_amount: e.target.value})} />
                  </Field>
                  <Field label="Radius (KM)">
                    <input type="number" className="w-full text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-medium focus:outline-none focus:bg-white focus:border-[#ff9300] transition-all" value={form.delivery_radius_km} onChange={e => setForm({...form, delivery_radius_km: e.target.value})} />
                  </Field>
                </div>
                
                <div className="space-y-3 pt-2">
                  <ToggleRow 
                    label="Auto-Accept Orders" 
                    description="Automatically accept orders when open"
                    checked={form.auto_accept_orders} 
                    onChange={v => setForm({...form, auto_accept_orders: v})} 
                  />
                  <ToggleRow 
                    label="Push Notifications" 
                    description="Real-time alerts for customer updates"
                    checked={form.notifications_enabled} 
                    onChange={v => setForm({...form, notifications_enabled: v})} 
                  />
                </div>
              </div>
            )}
          </div>
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
                <span>Launching Store...</span>
              </>
            ) : currentStep === 4 ? (
              <>
                <span>Launch Store</span>
                <span className="material-symbols-outlined text-xl">rocket_launch</span>
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

const ToggleRow = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
    <div className="pr-3">
      <p className="text-xs font-bold text-slate-800">{label}</p>
      {description && <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>}
    </div>
    <button 
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 focus:outline-none ${checked ? 'bg-[#ff9300]' : 'bg-slate-300'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  </div>
);