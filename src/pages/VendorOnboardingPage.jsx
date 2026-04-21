import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import { completeVendorOnboarding } from "../api/auth";
import { fetchServiceCategories } from "../api/system";
import { useAuthStore } from "../store/authStore";
import { isFoodCategory } from "../lib/vendorPortal";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SOUTH_AFRICAN_CITIES = [
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Pretoria",
  "Soweto",
  "Sandton",
  "Centurion",
  "Midrand",
  "Bloemfontein",
  "Port Elizabeth",
  "East London",
  "Polokwane",
  "Nelspruit",
  "Kimberley",
  "Rustenburg",
  "Pietermaritzburg",
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

  useEffect(() => {
    if (!token && hasHydrated) {
      navigate("/vendor/login");
      return;
    }
    setIsHydrated(true);
    
    // Get user's location on component mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
        }
      );
    }
  }, [hasHydrated, token, navigate]);

  const signatureGradient = "linear-gradient(135deg, #ff9300 0%, #ffb857 100%)";
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };
  const categoryLooksLikeFood = isFoodCategory(user?.category);
  const categoriesQuery = useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchServiceCategories,
  });
  const categoryOptions = categoriesQuery.data?.map((item) => item.name) ?? [];

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

  const mutation = useMutation({
    mutationFn: completeVendorOnboarding,
    onSuccess: () => {
      navigate("/vendor/dashboard");
    },
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

  const handleHourChange = (day, field, value) => {
    setForm((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value,
        },
      },
    }));
  };

  const toggleDayOff = (day) => {
    setForm((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          closed: !prev.opening_hours[day].closed,
        },
      },
    }));
  };

  const handlePermitChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, permit_url: file.name }));
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!form.description.trim() || form.description.length < 10) {
        setErrors({ description: "Description must be at least 10 characters" });
        return false;
      }
      if (!form.category.trim()) {
        setErrors({ category: "Business category is required" });
        return false;
      }
      if (!form.street.trim()) {
        setErrors({ street: "Street address is required" });
        return false;
      }
      if (!form.city.trim()) {
        setErrors({ city: "City is required" });
        return false;
      }
    }

    if (currentStep === 2) {
      if (!form.south_african_id_number.trim() || !form.business_registration_number.trim() || !form.tin.trim()) {
        setErrors({ general: "South African ID, business registration, and tax/VAT details are required." });
        return false;
      }
    }

    if (currentStep === 3) {
      if (!form.bank_name.trim() || !form.bank_account_name.trim() || !form.bank_account.trim()) {
        setErrors({ general: "Complete bank payout details before continuing." });
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    setErrors({});
    if (!validateStep()) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    const currentToken = useAuthStore.getState().token;
    if (!currentToken) {
      setErrors({ general: "Authentication lost. Please log in again." });
      navigate("/vendor/login");
      return;
    }

    const payload = {
      description: form.description,
      category: form.category,
      street: form.street,
      po_box: form.po_box || null,
      city: form.city,
      latitude: form.latitude,
      longitude: form.longitude,
      opening_hours: form.opening_hours,
      permit_url: form.permit_url,
      tin: form.tin,
      business_registration_number: form.business_registration_number,
      vat_number: form.vat_number,
      south_african_id_number: form.south_african_id_number,
      bank_name: form.bank_name,
      bank_account_name: form.bank_account_name,
      bank_account: form.bank_account,
      prep_time_minutes: Number(form.prep_time_minutes),
      minimum_order_amount: parseFloat(form.minimum_order_amount),
      delivery_radius_km: parseFloat(form.delivery_radius_km),
      auto_accept_orders: form.auto_accept_orders,
      notifications_enabled: form.notifications_enabled,
      support_email: form.support_email,
      support_phone: form.support_phone,
    };

    mutation.mutate(payload);
  };

  if (!isHydrated) {
    return (
      <div className="bg-[#f5f6f7] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-[#ff9300] mx-auto mb-4"></div>
          <p className="text-sm font-bold text-slate-600">Loading your store setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f5f6f7] min-h-screen font-body text-slate-900 antialiased">
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm border-b border-slate-200">
        <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
          <button
            onClick={() => (currentStep > 1 ? setCurrentStep((prev) => prev - 1) : navigate(-1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-slate-400">arrow_back</span>
          </button>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-500 ${currentStep >= step ? "w-8" : "w-2 bg-slate-100"}`}
                style={{ background: currentStep >= step ? signatureGradient : "" }}
              />
            ))}
          </div>

          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            {currentStep}/4
          </span>
        </div>

        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-2xl font-black tracking-tight">
            {currentStep === 1 && "Store Setup"}
            {currentStep === 2 && "Compliance Upload"}
            {currentStep === 3 && "Bank Details"}
            {currentStep === 4 && "Store Settings"}
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1">
            {currentStep === 1 && "Set up your store information and operating hours."}
            {currentStep === 2 && "Add South Africa specific KYC, business registration, and VAT details."}
            {currentStep === 3 && "Tell us where payouts should be sent."}
            {currentStep === 4 && "Finish support, delivery, and operational preferences."}
          </p>
        </div>
      </div>

      <main className="p-6 mt-4 space-y-6 max-w-2xl mx-auto pb-20">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white space-y-8">
          {currentStep === 1 && (
            <>
              <IconBlock icon="storefront" materialIconFill={materialIconFill} />

              <Field label="Store Description" error={errors.description}>
                <textarea
                  value={form.description}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, description: e.target.value }));
                    setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                  className={`w-full bg-slate-50 border rounded-2xl p-4 text-sm font-bold focus:outline-none h-32 resize-none transition-all placeholder:text-slate-300 ${
                    errors.description ? "border-red-400 focus:ring-2 focus:ring-red-400" : "border-slate-100 focus:border-[#ff9300]"
                  }`}
                  placeholder="What do you sell? Describe your store..."
                />
              </Field>

              <Field label="Business Category" error={errors.category}>
                <select
                  value={form.category}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, category: e.target.value }));
                    setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                  className={`w-full bg-slate-50 border rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all placeholder:text-slate-300 ${
                    errors.category ? "border-red-400 focus:ring-2 focus:ring-red-400" : "border-slate-100 focus:border-[#ff9300]"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800">📍 Business Location</h3>
                
                <Field label="Street Address" error={errors.street}>
                  <input
                    type="text"
                    value={form.street}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, street: e.target.value }));
                      setErrors((prev) => ({ ...prev, street: "" }));
                    }}
                    className={`w-full bg-slate-50 border rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all placeholder:text-slate-300 ${
                      errors.street ? "border-red-400 focus:ring-2 focus:ring-red-400" : "border-slate-100 focus:border-[#ff9300]"
                    }`}
                    placeholder="123 Main Street..."
                  />
                </Field>

                <Field label="PO Box (Optional)" error={errors.po_box}>
                  <input
                    type="text"
                    value={form.po_box}
                    onChange={(e) => setForm((prev) => ({ ...prev, po_box: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-[#ff9300] transition-all placeholder:text-slate-300"
                    placeholder="PO Box 123..."
                  />
                </Field>

                <Field label="Country">
                  <input
                    type="text"
                    value="South Africa"
                    readOnly
                    className="w-full bg-slate-100 border border-slate-100 rounded-2xl p-4 text-sm font-bold text-slate-500"
                  />
                </Field>

                <Field label="City" error={errors.city}>
                  <select
                    value={form.city}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, city: e.target.value }));
                      setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    className={`w-full bg-slate-50 border rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all placeholder:text-slate-300 ${
                      errors.city ? "border-red-400 focus:ring-2 focus:ring-red-400" : "border-slate-100 focus:border-[#ff9300]"
                    }`}
                  >
                    <option value="">Select a city</option>
                    {SOUTH_AFRICAN_CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </Field>

                {form.latitude && form.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                    <p className="text-xs font-bold text-green-700">✓ Location captured: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800">Operating Hours</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-600">{day}</p>
                      </div>

                      {form.opening_hours[day].closed ? (
                        <span className="text-xs font-bold text-red-500">Closed</span>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <input
                            type="time"
                            value={form.opening_hours[day].open}
                            onChange={(e) => handleHourChange(day, "open", e.target.value)}
                            className="bg-white px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff9300]"
                          />
                          <span className="text-xs text-slate-400">-</span>
                          <input
                            type="time"
                            value={form.opening_hours[day].close}
                            onChange={(e) => handleHourChange(day, "close", e.target.value)}
                            className="bg-white px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff9300]"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleDayOff(day)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          form.opening_hours[day].closed ? "bg-red-100 text-red-600" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        {form.opening_hours[day].closed ? "Off" : "On"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <IconBlock icon="verified_user" materialIconFill={materialIconFill} />

              <Field label="Business ID / Permit">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 bg-slate-50 hover:bg-orange-50/50 hover:border-[#ff9300]/30 transition-all cursor-pointer group">
                  <input
                    type="file"
                    onChange={handlePermitChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                    id="permit-upload"
                  />
                  <label htmlFor="permit-upload" className="flex flex-col items-center justify-center gap-3 w-full cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-[#ff9300] transition-colors">
                      <span className="material-symbols-outlined">cloud_upload</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {form.permit_url ? form.permit_url : "Click to upload document"}
                    </span>
                  </label>
                </div>
              </Field>

              <div className="grid grid-cols-1 gap-4">
                <Field label="South African ID Number">
                  <input
                    type="text"
                    value={form.south_african_id_number}
                    onChange={(e) => setForm((prev) => ({ ...prev, south_african_id_number: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all placeholder:text-slate-300"
                    placeholder="e.g. 9001015800088"
                  />
                </Field>

                <Field label="Business Registration Number">
                  <input
                    type="text"
                    value={form.business_registration_number}
                    onChange={(e) => setForm((prev) => ({ ...prev, business_registration_number: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all placeholder:text-slate-300"
                    placeholder="e.g. 2024/123456/07"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tax Number / TIN">
                    <input
                      type="text"
                      value={form.tin}
                      onChange={(e) => setForm((prev) => ({ ...prev, tin: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all placeholder:text-slate-300"
                      placeholder="Tax number"
                    />
                  </Field>

                  <Field label="VAT Number">
                    <input
                      type="text"
                      value={form.vat_number}
                      onChange={(e) => setForm((prev) => ({ ...prev, vat_number: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all placeholder:text-slate-300"
                      placeholder="VAT"
                    />
                  </Field>
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <IconBlock icon="account_balance" materialIconFill={materialIconFill} />

              <div className="grid grid-cols-1 gap-4">
                <Field label="Bank Name">
                  <input
                    type="text"
                    value={form.bank_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, bank_name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all placeholder:text-slate-300"
                    placeholder="e.g. Standard Bank"
                  />
                </Field>

                <Field label="Account Name">
                  <input
                    type="text"
                    value={form.bank_account_name}
                    onChange={(e) => setForm((prev) => ({ ...prev, bank_account_name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all placeholder:text-slate-300"
                    placeholder="Registered business account name"
                  />
                </Field>

                <Field label="Account Number">
                  <input
                    type="text"
                    value={form.bank_account}
                    onChange={(e) => setForm((prev) => ({ ...prev, bank_account: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all placeholder:text-slate-300"
                    placeholder="0000000000"
                  />
                </Field>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <IconBlock icon="tune" materialIconFill={materialIconFill} />

              <div className="grid grid-cols-2 gap-4">
                {categoryLooksLikeFood && (
                  <Field label="Prep Time (min)">
                    <input
                      type="number"
                      value={form.prep_time_minutes}
                      onChange={(e) => setForm((prev) => ({ ...prev, prep_time_minutes: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all"
                      min="1"
                      max="240"
                    />
                  </Field>
                )}

                <Field label="Min Order (R)">
                  <input
                    type="number"
                    value={form.minimum_order_amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, minimum_order_amount: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all"
                    min="0"
                    step="50"
                  />
                </Field>

                <Field label="Delivery Radius (km)">
                  <input
                    type="number"
                    value={form.delivery_radius_km}
                    onChange={(e) => setForm((prev) => ({ ...prev, delivery_radius_km: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all"
                    min="0"
                    step="1"
                  />
                </Field>

                <Field label="Support Email">
                  <input
                    type="email"
                    value={form.support_email}
                    onChange={(e) => setForm((prev) => ({ ...prev, support_email: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all"
                    placeholder="support@yourstore.co.za"
                  />
                </Field>

                <Field label="Support Phone">
                  <input
                    type="text"
                    value={form.support_phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, support_phone: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all"
                    placeholder="+27..."
                  />
                </Field>
              </div>

              <ToggleRow
                label="Auto-accept incoming orders"
                checked={form.auto_accept_orders}
                onChange={(checked) => setForm((prev) => ({ ...prev, auto_accept_orders: checked }))}
              />
              <ToggleRow
                label="Enable vendor notifications"
                checked={form.notifications_enabled}
                onChange={(checked) => setForm((prev) => ({ ...prev, notifications_enabled: checked }))}
              />
            </>
          )}
        </div>

        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600 font-medium">{errors.general}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleNext}
            disabled={mutation.isPending || !isHydrated}
            className="w-full py-5 rounded-[2rem] text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-200/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: signatureGradient }}
          >
            {mutation.isPending ? "Processing..." : !isHydrated ? "Loading..." : (currentStep === 4 ? "Launch Store" : "Next Step")}
            <span className="material-symbols-outlined">
              {mutation.isPending || !isHydrated ? "hourglass_empty" : (currentStep === 4 ? "rocket_launch" : "chevron_right")}
            </span>
          </button>

          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="w-full py-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-500 transition-colors"
            >
              Back to Previous
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

const IconBlock = ({ icon, materialIconFill }) => (
  <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff9300]">
    <span className="material-symbols-outlined text-3xl" style={materialIconFill}>
      {icon}
    </span>
  </div>
);

const Field = ({ label, children, error }) => (
  <div className="space-y-2">
    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
      {label}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
  </div>
);

const ToggleRow = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between bg-slate-50 border border-slate-100 p-4 rounded-2xl cursor-pointer">
    <span className="text-sm font-bold text-slate-700">{label}</span>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5 rounded border-slate-300 text-[#ff9300] focus:ring-[#ff9300]"
    />
  </label>
);
