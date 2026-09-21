import { useMutation } from "@tanstack/react-query";
import { useState, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerVendor } from "../api/auth";
import { getApiErrorMessage } from "../lib/errorMessage";
import quickdropLogo from "../styles/quickdrop.jpeg";

const initialState = {
  business_name: "",
  email: "",
  phone: "",
  password: "",
  confirm_password: "",
  category: "",
  city: "",
  logo_url: "",
  cover_image_url: "",
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// --- Move FormInput OUTSIDE the main component to prevent focus loss ---
const FormInput = ({ label, icon, type = "text", showPasswordToggle, showPassword, onTogglePassword, ...props }) => (
  <div className="relative">
    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
      {icon}
    </span>
    <input
      type={showPasswordToggle && showPassword ? "text" : type}
      {...props}
      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-[#ff9300] focus:ring-2 focus:ring-[#ff9300]/20 outline-none transition-all font-medium text-sm"
    />
    {showPasswordToggle && (
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
      >
        <span className="material-symbols-outlined text-xl">
          {showPassword ? "visibility_off" : "visibility"}
        </span>
      </button>
    )}
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
  const [form, setForm] = useState(initialState);
  const [activeModal, setActiveModal] = useState(null);
  const [formError, setFormError] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const categories = ["Food & Beverages", "Retail", "Electronics", "Fashion", "Pharmacy", "Others"];
  const cities = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"];

  const mutation = useMutation({
    mutationFn: registerVendor,
    onSuccess: (data) => {
      navigate("/vendor/login");
    },
    onError: (err) => setFormError(getApiErrorMessage(err, "Registration failed"))
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) return setFormError("Passwords do not match");
    if (!form.logo_url || !form.cover_image_url) return setFormError("Upload both company logo and company profile image");
    mutation.mutate(form);
  };

  const handleImageSelect = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, [field]: dataUrl }));
      if (field === "logo_url") setLogoPreview(dataUrl);
      if (field === "cover_image_url") setCoverPreview(dataUrl);
    } catch {
      setFormError("Unable to read the selected image");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-body">
      {/* --- Branding Header --- */}
      <div className="pt-10 pb-8 px-6 flex flex-col items-center text-center">
        <img 
          src={quickdropLogo} 
          alt="QuickDrop" 
          className="h-14 w-14 rounded-2xl mb-4 shadow-2xl border border-white/10" 
        />
        <h1 className="text-white font-headline text-2xl font-black tracking-tight">Merchant Sign Up</h1>
        <p className="text-slate-400 text-xs mt-1 font-medium tracking-wide">Join the QuickDrop network and scale your business.</p>
      </div>

      {/* --- Bottom Sheet Container --- */}
      <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.4)] px-6 pt-8 pb-10 overflow-y-auto">
        <div className="max-w-md mx-auto">
          
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-8 -mt-2" />

          {/* Social Cluster - Google only */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            <button 
              type="button"
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm active:bg-slate-50 active:scale-[0.97] transition-all"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="G" />
              <span className="text-slate-700 font-bold text-sm">Continue with Google</span>
            </button>
          </div>

          <div className="relative flex py-3 items-center mb-6">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="mx-4 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Or use email</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {formError && (
            <div className="mb-6 p-4 rounded-2xl text-xs font-bold border animate-in fade-in zoom-in-95 bg-red-50 text-red-600 border-red-100 text-center">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <FormInput 
              icon="store" name="business_name" placeholder="Business Name"
              value={form.business_name} onChange={handleChange} required
            />

            <FormInput 
              icon="mail" name="email" type="email" placeholder="Email Address"
              value={form.email} onChange={handleChange} required
            />

            <FormInput 
              icon="phone" name="phone" type="tel" placeholder="Phone Number"
              value={form.phone} onChange={handleChange} required
            />

            {/* --- Selection Modals --- */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveModal('category')}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm font-medium active:scale-[0.98] transition-all"
              >
                <span className={form.category ? 'text-slate-900 font-bold' : 'text-slate-400'}>{form.category || "Category"}</span>
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('city')}
                className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 text-sm font-medium active:scale-[0.98] transition-all"
              >
                <span className={form.city ? 'text-slate-900 font-bold' : 'text-slate-400'}>{form.city || "City"}</span>
                <span className="material-symbols-outlined text-slate-400">expand_more</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <ImagePicker
                label="Company Logo"
                preview={logoPreview}
                onChange={(event) => handleImageSelect(event, "logo_url")}
              />
              <ImagePicker
                label="Cover Image"
                preview={coverPreview}
                onChange={(event) => handleImageSelect(event, "cover_image_url")}
              />
            </div>

            <FormInput 
              icon="lock" 
              name="password" 
              type="password" 
              placeholder="Password"
              value={form.password} 
              onChange={handleChange} 
              required
              showPasswordToggle={true}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(prev => !prev)}
            />

            <FormInput 
              icon="lock_reset" 
              name="confirm_password" 
              type="password" 
              placeholder="Confirm Password"
              value={form.confirm_password} 
              onChange={handleChange} 
              required
              showPasswordToggle={true}
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(prev => !prev)}
            />

            <button
              className="w-full bg-[#ff9300] text-white font-black py-5 rounded-[2rem] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Processing...' : 'Launch Merchant Account'}
              <span className="material-symbols-outlined font-bold">rocket_launch</span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-slate-400">
            Already a partner?{' '}
            <Link to="/vendor/login" className="text-[#ff9300] font-black underline underline-offset-4 ml-1">
              Sign In
            </Link>
          </p>
        </div>
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
    </div>
  );
};

const ImagePicker = ({ label, preview, onChange }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <label className="block cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div className="flex h-32 items-center justify-center">
        {preview ? (
          <img src={preview} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-slate-400">
            <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
            <p className="mt-1 text-[10px] font-bold uppercase">Upload</p>
          </div>
        )}
      </div>
      <input type="file" accept="image/*" className="hidden" onChange={onChange} />
    </label>
  </div>
);