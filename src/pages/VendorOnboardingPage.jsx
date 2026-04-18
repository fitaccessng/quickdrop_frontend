import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { completeVendorOnboarding } from '../api/auth';
import { PageContainer } from '../components/common/PageContainer';
import { useAuthStore } from '../store/authStore';

export const VendorOnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token && hasHydrated) {
      navigate('/vendor/login');
      return;
    }
    setIsHydrated(true);
  }, [hasHydrated, token, navigate]);
  
  const signatureGradient = "linear-gradient(135deg, #ff9300 0%, #ffb857 100%)";
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [form, setForm] = useState({
    // Step 1: Store Setup
    description: '',
    opening_hours: {
      Monday: { open: '09:00', close: '18:00', closed: false },
      Tuesday: { open: '09:00', close: '18:00', closed: false },
      Wednesday: { open: '09:00', close: '18:00', closed: false },
      Thursday: { open: '09:00', close: '18:00', closed: false },
      Friday: { open: '09:00', close: '18:00', closed: false },
      Saturday: { open: '10:00', close: '20:00', closed: false },
      Sunday: { open: '10:00', close: '20:00', closed: false },
    },
    // Step 2: Verification
    permit_url: null,
    tin: '',
    // Step 3: Payout Details
    bank_name: '',
    bank_account: '',
    prep_time_minutes: 20,
    minimum_order_amount: 0,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      return await completeVendorOnboarding(data);
    },
    onSuccess: () => {
      navigate('/vendor/dashboard');
    },
    onError: (error) => {
      const errorData = error.response?.data?.detail;
      if (Array.isArray(errorData)) {
        const errorMap = {};
        errorData.forEach(err => {
          const field = err.loc?.[1] || 'general';
          errorMap[field] = err.msg;
        });
        setErrors(errorMap);
      } else {
        setErrors({ general: errorData || 'An error occurred' });
      }
    }
  });

  const handleNext = () => {
    setErrors({});
    
    if (currentStep === 1) {
      if (!form.description.trim() || form.description.length < 10) {
        setErrors({ description: 'Description must be at least 10 characters' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!form.tin.trim()) {
        setErrors({ tin: 'TIN is required' });
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!form.bank_name.trim() || !form.bank_account.trim()) {
        setErrors({ general: 'Bank details are required' });
        return;
      }
      
      const payload = {
        description: form.description,
        opening_hours: form.opening_hours,
        permit_url: form.permit_url,
        tin: form.tin,
        bank_name: form.bank_name,
        bank_account: form.bank_account,
        prep_time_minutes: parseInt(form.prep_time_minutes),
        minimum_order_amount: parseFloat(form.minimum_order_amount),
      };
      
      mutation.mutate(payload);
    }
  };

  const handleHourChange = (day, field, value) => {
    setForm(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }));
  };

  const toggleDayOff = (day) => {
    setForm(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          closed: !prev.opening_hours[day].closed
        }
      }
    }));
  };

  const handlePermitChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, permit_url: file.name }));
    }
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
      {/* --- Progress Header --- */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[3rem] shadow-sm border-b border-slate-200">
        <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto">
          <button 
            onClick={() => currentStep > 1 ? setCurrentStep(prev => prev - 1) : navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-slate-400">arrow_back</span>
          </button>
          
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  currentStep >= s ? 'w-8' : 'w-2 bg-slate-100'
                }`}
                style={{ background: currentStep >= s ? signatureGradient : '' }}
              />
            ))}
          </div>
          
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            {currentStep}/3
          </span>
        </div>

        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-2xl font-black tracking-tight">
            {currentStep === 1 && "Store Setup"}
            {currentStep === 2 && "Verification"}
            {currentStep === 3 && "Payout Details"}
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1">
            {currentStep === 1 && "Tell us about your brand identity."}
            {currentStep === 2 && "Upload business documents."}
            {currentStep === 3 && "Where should we send your earnings?"}
          </p>
        </div>
      </div>

      {/* --- Form Body --- */}
      <main className="p-6 mt-4 space-y-6 max-w-2xl mx-auto pb-20">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white space-y-8">
          
          {/* Step 1: Store Setup */}
          {currentStep === 1 && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff9300]">
                <span className="material-symbols-outlined text-3xl" style={materialIconFill}>
                  storefront
                </span>
              </div>

              {/* Store Description */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Store Description
                </label>
                <textarea 
                  value={form.description}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, description: e.target.value }));
                    setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  className={`w-full bg-slate-50 border rounded-2xl p-4 text-sm font-bold focus:outline-none h-32 resize-none transition-all placeholder:text-slate-300 ${
                    errors.description ? 'border-red-400 focus:ring-2 focus:ring-red-400' : 'border-slate-100 focus:border-[#ff9300]'
                  }`}
                  placeholder="What do you sell? Describe your store..."
                />
                {errors.description && <p className="text-xs text-red-500 ml-1">{errors.description}</p>}
              </div>

              {/* Opening Hours by Day */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-800">Operating Hours</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {daysOfWeek.map(day => (
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
                            onChange={(e) => handleHourChange(day, 'open', e.target.value)}
                            className="bg-white px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff9300]"
                          />
                          <span className="text-xs text-slate-400">-</span>
                          <input 
                            type="time" 
                            value={form.opening_hours[day].close}
                            onChange={(e) => handleHourChange(day, 'close', e.target.value)}
                            className="bg-white px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff9300]"
                          />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleDayOff(day)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          form.opening_hours[day].closed
                            ? 'bg-red-100 text-red-600'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {form.opening_hours[day].closed ? 'Off' : 'On'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Verification */}
          {currentStep === 2 && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff9300]">
                <span className="material-symbols-outlined text-3xl" style={materialIconFill}>
                  verified_user
                </span>
              </div>

              {/* Business Permit Upload */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Business ID / Permit
                </label>
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
                      {form.permit_url ? form.permit_url : 'Click to upload document'}
                    </span>
                  </label>
                </div>
              </div>

              {/* TIN */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Tax Identification Number (TIN)
                </label>
                <input 
                  type="text" 
                  value={form.tin}
                  onChange={(e) => {
                    setForm(prev => ({ ...prev, tin: e.target.value }));
                    setErrors(prev => ({ ...prev, tin: '' }));
                  }}
                  className={`w-full bg-slate-50 border rounded-2xl p-4 text-sm font-bold focus:outline-none transition-all placeholder:text-slate-300 ${
                    errors.tin ? 'border-red-400 focus:ring-2 focus:ring-red-400' : 'border-slate-100 focus:border-[#ff9300]'
                  }`}
                  placeholder="e.g., A001234567"
                />
                {errors.tin && <p className="text-xs text-red-500 ml-1">{errors.tin}</p>}
              </div>
            </>
          )}

          {/* Step 3: Payout Details */}
          {currentStep === 3 && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff9300]">
                <span className="material-symbols-outlined text-3xl" style={materialIconFill}>
                  account_balance
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    Bank Name
                  </label>
                  <input 
                    type="text" 
                    value={form.bank_name}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, bank_name: e.target.value }));
                      setErrors(prev => ({ ...prev, bank_name: '' }));
                    }}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all placeholder:text-slate-300"
                    placeholder="e.g., KCB Bank"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                    Account Number
                  </label>
                  <input 
                    type="text" 
                    value={form.bank_account}
                    onChange={(e) => {
                      setForm(prev => ({ ...prev, bank_account: e.target.value }));
                      setErrors(prev => ({ ...prev, bank_account: '' }));
                    }}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all placeholder:text-slate-300"
                    placeholder="0000000000"
                  />
                </div>
              </div>

              {/* Delivery Configuration */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="text-sm font-black text-slate-800">Delivery Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      Prep Time (min)
                    </label>
                    <input 
                      type="number" 
                      value={form.prep_time_minutes}
                      onChange={(e) => setForm(prev => ({ ...prev, prep_time_minutes: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all"
                      min="1"
                      max="240"
                      step="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      Min Order (R)
                    </label>
                    <input 
                      type="number" 
                      value={form.minimum_order_amount}
                      onChange={(e) => setForm(prev => ({ ...prev, minimum_order_amount: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-bold focus:border-[#ff9300] outline-none transition-all"
                      min="0"
                      step="50"
                    />
                  </div>
                </div>
              </div>

              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{errors.general}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* --- Navigation Actions --- */}
        <div className="space-y-4">
          <button 
            onClick={handleNext}
            disabled={mutation.isPending}
            className="w-full py-5 rounded-[2rem] text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-200/50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            style={{ background: signatureGradient }}
          >
            {mutation.isPending ? 'Processing...' : (currentStep === 3 ? 'Launch Store' : 'Next Step')}
            <span className="material-symbols-outlined">
              {mutation.isPending ? 'hourglass_empty' : (currentStep === 3 ? 'rocket_launch' : 'chevron_right')}
            </span>
          </button>

          {currentStep > 1 && (
            <button 
              onClick={() => setCurrentStep(prev => prev - 1)}
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