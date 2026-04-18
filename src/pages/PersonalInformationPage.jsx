import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";

const fetchUserProfile = async () => ({
  name: "Julian Curator",
  email: "julian@kinetic.io",
  phone: "+254798765432",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
});

export const PersonalInformationPage = () => {
  const navigate = useNavigate();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: Call API to update profile
    console.log('Saving:', formData);
    navigate(-1);
  };

  if (isLoading) return <div className="min-h-screen bg-[#f5f6f7] flex items-center justify-center font-black text-[#ff9300] animate-pulse">LOADING...</div>;

  return (
    <div className="bg-[#f5f6f7] font-body text-slate-900 min-h-screen pb-24 antialiased">
      {/* --- Header --- */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-slate-600">arrow_back</span>
          </button>
          <h1 className="text-lg font-black text-slate-800">Personal Information</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* --- Content --- */}
      <main className="px-6 py-8 space-y-6">
        {/* Avatar Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-blue-100">
            <img 
              src={user?.avatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <button className="px-6 py-3 bg-blue-50 text-blue-600 font-bold text-sm rounded-2xl border border-blue-200 active:scale-95 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg" style={materialIconFill}>edit</span>
            Change Avatar
          </button>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 space-y-5">
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
            />
          </div>
        </div>

        {/* Save Button */}
        <button 
          onClick={handleSave}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#ff9300] to-[#ffb857] text-white font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all shadow-lg"
        >
          Save Changes
        </button>
      </main>
    </div>
  );
};
