import { useMutation } from "@tanstack/react-query";
import { useState, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/auth/AuthLayout";
import { registerVendor } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { FaApple } from "react-icons/fa";

const initialState = {
  business_name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
  category: "",
  city: "",
};

// --- Move FormInput OUTSIDE the main component to prevent focus loss ---
const FormInput = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
      {label}
    </label>
    <div className="relative">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
        {icon}
      </span>
      <input
        {...props}
        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-[#ff9300] focus:ring-1 focus:ring-[#ff9300] outline-none transition-all placeholder:text-slate-300 text-slate-700"
      />
    </div>
  </div>
);

// --- Bottom Modal Component ---
const BottomModal = ({ isOpen, onClose, title, options, onSelect, selectedValue }) => {
  if (!isOpen) return null;
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity" 
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-t-[2.5rem] p-8 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />
        <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight text-center">{title}</h3>
        <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto no-scrollbar pb-10">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onSelect(opt); onClose(); }}
              className={`w-full p-5 rounded-2xl text-left font-bold transition-all border-2 ${
                selectedValue === opt ? 'border-[#ff9300] bg-orange-50 text-[#ff9300]' : 'border-slate-50 bg-slate-50 text-slate-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const VendorSignupPage = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState(initialState);
  const [activeModal, setActiveModal] = useState(null);
  const [formError, setFormError] = useState("");

  const categories = ["Food & Beverages", "Retail", "Electronics", "Fashion", "Pharmacy", "Others"];
  const cities = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"];

  const mutation = useMutation({
    mutationFn: registerVendor,
    onSuccess: (data) => {
      // Don't auto-login, let them log in to trigger onboarding check
      navigate("/vendor/login");
    },
    onError: (err) => setFormError(err.response?.data?.detail || "Registration failed")
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) return setFormError("Passwords do not match");
    mutation.mutate(form);
  };

  return (
    <AuthLayout
      title="Merchant Sign Up"
      subtitle="Join the Kinetic network and scale your business."
      variant="vendor"
    >
      <div className="max-w-xl mx-auto w-full px-2">
        {/* Social Buttons - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <button type="button" className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-slate-200 font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all">
            <img alt="Google" className="w-5 h-5" src="https://www.svgrepo.com/show/475656/google-color.svg" />
            Google
          </button>
          <button type="button" className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-black active:scale-95 transition-all">
            <FaApple className="text-xl" />
            Apple
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {formError && <p className="text-rose-500 text-[10px] font-black uppercase text-center bg-rose-50 py-3 rounded-xl border border-rose-100">{formError}</p>}

          <FormInput 
            label="Business Name" icon="store" name="business_name" placeholder="Ex: Kinetic Electronics"
            value={form.business_name} onChange={handleChange} required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Email" icon="mail" name="email" type="email" placeholder="vendor@kinetic.io"
              value={form.email} onChange={handleChange} required
            />
            <FormInput 
              label="Phone" icon="phone" name="phone" type="tel" placeholder="+254..."
              value={form.phone} onChange={handleChange} required
            />
          </div>

          {/* --- Responsive Selection Grid --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
              <button
                type="button"
                onClick={() => setActiveModal('category')}
                className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl py-4 px-4 text-sm font-bold active:scale-[0.98] transition-all"
              >
                <span className={form.category ? 'text-slate-800' : 'text-slate-300'}>{form.category || "Select..."}</span>
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
              <button
                type="button"
                onClick={() => setActiveModal('city')}
                className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl py-4 px-4 text-sm font-bold active:scale-[0.98] transition-all"
              >
                <span className={form.city ? 'text-slate-800' : 'text-slate-300'}>{form.city || "Select..."}</span>
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput 
              label="Password" icon="lock" name="password" type="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required
            />
            <FormInput 
              label="Confirm Password" icon="lock_reset" name="confirm_password" type="password" placeholder="••••••••"
              value={form.confirm_password} onChange={handleChange} required
            />
          </div>

          <button
            className="w-full py-5 rounded-[2rem] text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-200/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
            style={{ background: "linear-gradient(135deg, #ff9300 0%, #ffb857 100%)" }}
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Syncing...' : 'Launch Merchant Account'}
            <span className="material-symbols-outlined">rocket_launch</span>
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Already a partner? <Link to="/vendor/login" className="text-[#ff9300] hover:underline ml-1">Sign In</Link>
        </p>
      </div>

      <BottomModal 
        isOpen={activeModal === 'category'} 
        onClose={() => setActiveModal(null)}
        title="Business Category"
        options={categories}
        selectedValue={form.category}
        onSelect={(val) => setForm(prev => ({...prev, category: val}))}
      />
      <BottomModal 
        isOpen={activeModal === 'city'} 
        onClose={() => setActiveModal(null)}
        title="Operation City"
        options={cities}
        selectedValue={form.city}
        onSelect={(val) => setForm(prev => ({...prev, city: val}))}
      />
    </AuthLayout>
  );
};