import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { completeVendorOnboarding } from "../api/auth";
import { fetchServiceCategories } from "../api/system";
import { useAuthStore } from "../store/authStore";
import { isFoodCategory } from "../lib/vendorPortal";
import quickdropLogo from "../styles/quickdrop.jpeg";

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
  const categoryLooksLikeFood = isFoodCategory(user?.category);

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
        setErrors({ general: errorData || "An error occurred" });
      }
    },
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      mutation.mutate(form);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body">
      {/* --- Branding & Progress Header --- */}
      <div className="pt-10 pb-8 px-6 flex flex-col items-center text-center">
        <img src={quickdropLogo} alt="QuickDrop" className="h-12 w-12 rounded-xl mb-4 border border-white/10" />
        <h1 className="text-white font-headline text-2xl font-black tracking-tight">
          {currentStep === 1 && "Store Info"}
          {currentStep === 2 && "Compliance"}
          {currentStep === 3 && "Bank Payouts"}
          {currentStep === 4 && "Operations"}
        </h1>
        
        {/* Progress Bar */}
        <div className="flex gap-2 mt-4 w-32">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${currentStep >= step ? "bg-[#ff9300]" : "bg-slate-800"}`} 
            />
          ))}
        </div>
      </div>

      {/* --- Main Sheet Container --- */}
      <div className="flex-1 bg-white rounded-t-[3.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-8 pb-12 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-8 -mt-2" />

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-bold border border-red-100">
              {errors.general}
            </div>
          )}

          <div className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                <Field label="Business Bio" error={errors.description}>
                  <textarea 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none h-28 resize-none"
                    placeholder="Tell customers about your store..."
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </Field>

                <Field label="Category" error={errors.category}>
                  <select 
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none appearance-none"
                    value={form.category}
                    onChange={e => setForm({...form, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="City">
                    <select 
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none"
                      value={form.city}
                      onChange={e => setForm({...form, city: e.target.value})}
                    >
                      {SOUTH_AFRICAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Country">
                    <input className="w-full bg-slate-100 border-none rounded-2xl py-4 px-4 text-sm font-bold text-slate-400" value="South Africa" readOnly />
                  </Field>
                </div>

                <Field label="Street Address">
                  <input 
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none"
                    placeholder="123 Precinct St."
                    value={form.street}
                    onChange={e => setForm({...form, street: e.target.value})}
                  />
                </Field>

                <div className="pt-2">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Opening Hours</p>
                  <div className="bg-slate-50 rounded-[2rem] p-4 space-y-3">
                    {daysOfWeek.slice(0, 7).map(day => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 w-16">{day.slice(0, 3)}</span>
                        <div className="flex items-center gap-2">
                           <input type="time" className="text-[10px] font-bold p-1 rounded bg-white border border-slate-100" value={form.opening_hours[day].open} />
                           <span className="text-slate-300">-</span>
                           <input type="time" className="text-[10px] font-bold p-1 rounded bg-white border border-slate-100" value={form.opening_hours[day].close} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                <Field label="SA ID Number">
                  <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none" value={form.south_african_id_number} onChange={e => setForm({...form, south_african_id_number: e.target.value})} placeholder="900101..." />
                </Field>
                <Field label="Business Reg. Number">
                  <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none" value={form.business_registration_number} onChange={e => setForm({...form, business_registration_number: e.target.value})} placeholder="2024/..." />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                   <Field label="TIN / Tax No.">
                     <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none" value={form.tin} onChange={e => setForm({...form, tin: e.target.value})} />
                   </Field>
                   <Field label="VAT (Optional)">
                     <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none" value={form.vat_number} onChange={e => setForm({...form, vat_number: e.target.value})} />
                   </Field>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                <Field label="Bank Name">
                  <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none" value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="e.g. FNB" />
                </Field>
                <Field label="Account Holder">
                  <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none" value={form.bank_account_name} onChange={e => setForm({...form, bank_account_name: e.target.value})} />
                </Field>
                <Field label="Account Number">
                  <input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none" value={form.bank_account} onChange={e => setForm({...form, bank_account: e.target.value})} />
                </Field>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Min Order (R)">
                    <input type="number" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none" value={form.minimum_order_amount} onChange={e => setForm({...form, minimum_order_amount: e.target.value})} />
                  </Field>
                  <Field label="Radius (KM)">
                    <input type="number" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 text-sm font-medium focus:ring-2 focus:ring-[#ff9300] outline-none" value={form.delivery_radius_km} onChange={e => setForm({...form, delivery_radius_km: e.target.value})} />
                  </Field>
                </div>
                
                <ToggleRow 
                  label="Auto-Accept Orders" 
                  checked={form.auto_accept_orders} 
                  onChange={v => setForm({...form, auto_accept_orders: v})} 
                />
                <ToggleRow 
                  label="Push Notifications" 
                  checked={form.notifications_enabled} 
                  onChange={v => setForm({...form, notifications_enabled: v})} 
                />
              </div>
            )}

            {/* Navigation Button */}
            <div className="pt-6">
              <button
                onClick={handleNext}
                disabled={mutation.isPending}
                className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2.5rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {mutation.isPending ? 'Launching...' : currentStep === 4 ? 'Launch Store' : 'Continue'}
                <span className="material-symbols-outlined font-bold">
                  {currentStep === 4 ? 'rocket_launch' : 'arrow_forward'}
                </span>
              </button>
              
              {currentStep > 1 && (
                <button 
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="w-full mt-4 text-[10px] font-black uppercase text-slate-300 tracking-widest hover:text-slate-500"
                >
                  Previous Step
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children, error }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    {children}
    {error && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
  </div>
);

const ToggleRow = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-[#ff9300]' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);