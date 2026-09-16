import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchProfile, updateProfile } from "../api/auth";
import { useAuthStore } from "../store/authStore";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const PersonalInformationPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setProfile = useAuthStore((state) => state.setProfile);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
  });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: '',
  });
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
      });
      setPreviewImage(user.avatar_url || "");
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      navigate(-1);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const avatarUrl = await readFileAsDataUrl(file);
    setPreviewImage(avatarUrl);
    setFormData((prev) => ({ ...prev, avatar_url: avatarUrl }));
  };

  const handleSave = () => {
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="bg-[#f7f9fb] font-sans text-[#191c1e] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#e0e3e5] border-t-[#e11d48] rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#565e74]">Loading details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f9fb] font-sans text-[#191c1e] min-h-screen antialiased flex flex-col items-center">
      <div className="w-full max-w-xl min-h-screen flex flex-col bg-[#f7f9fb] relative pb-32">

        {/* Fixed Header */}
        <header className="fixed top-0 w-full max-w-xl z-50 bg-white/90 backdrop-blur-xl border-b border-[#e0e3e5]/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="h-16 px-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="font-bold text-sm text-[#191c1e] uppercase tracking-wider">Personal Information</h1>
            <div className="w-10"></div> {/* Spacer for symmetry */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full pt-20 px-4 space-y-4 flex-1">
          
          {/* Avatar Edit Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e0e3e5]/60 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#f2f4f6] border border-[#e0e3e5] shadow-sm">
                <img
                  src={previewImage || user?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#006847] border-2 border-white rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]">check</span>
              </div>
            </div>

            <label className="px-4 py-2 bg-[#f2f4f6] hover:bg-[#eceef0] text-[#191c1e] font-bold text-xs rounded-xl border border-[#e0e3e5] transition-all active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm">
              <span className="material-symbols-outlined text-[16px]">edit</span>
              Change Profile Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>

          {/* Form Fields Container */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e0e3e5]/60 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#565e74] block">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-[#e0e3e5] rounded-xl text-xs font-bold text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/50 bg-[#f7f9fb]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#565e74] block">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-[#e0e3e5] rounded-xl text-xs font-bold text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/50 bg-[#f7f9fb]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#565e74] block">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-[#e0e3e5] rounded-xl text-xs font-bold text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/50 bg-[#f7f9fb]"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="w-full h-12 rounded-xl bg-[#e11d48] hover:bg-[#b80035] text-white font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all shadow-sm flex items-center justify-center"
              type="button"
            >
              {mutation.isPending ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};