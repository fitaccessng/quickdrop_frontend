import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { PageContainer } from '../components/common/PageContainer';
import { SectionHeading } from '../components/common/SectionHeading';
import { useAuthStore } from '../store/authStore';

const SA_CITIES = [
  'Johannesburg',
  'Pretoria',
  'Sandton',
  'Soweto',
  'Centurion',
  'Cape Town',
  'Stellenbosch',
  'Paarl',
  'George',
  'Somerset West',
  'Durban',
  'Umhlanga',
  'Pietermaritzburg',
  'Ballito',
  'Gqeberha',
  'East London',
  'Makhanda',
  'Bloemfontein',
  'Welkom',
  'Sasolburg',
  'Polokwane',
  'Thohoyandou',
  'Phalaborwa',
  'Mbombela',
  'Secunda',
  'Emalahleni',
  'Mahikeng',
  'Potchefstroom',
  'Rustenburg',
  'Kimberley',
  'Upington',
  'Kuruman',
];

export const CustomerOnboarding = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [form, setForm] = useState({
    country: 'SA',
    city: '',
    state: '',
    street: '',
    pobox: '',
    profilePicture: null,
    phone: user?.phone || '',
  });

  const [previewImage, setPreviewImage] = useState(user?.avatar || null);

  const mutation = useMutation({
    mutationFn: async (data) => {
      // TODO: Call API to update customer profile
      console.log('Updating customer profile:', data);
      return data;
    },
    onSuccess: () => {
      navigate('/dashboard');
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setForm((prev) => ({ ...prev, profilePicture: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.city || !form.state || !form.street) {
      alert('Please fill in all required fields');
      return;
    }

    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f7] py-12 px-6">
      <PageContainer className="grid text-black gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <SectionHeading
          eyebrow="Customer Onboarding"
          title="Complete Your Profile"
          description="Help us personalize your experience by adding your delivery address and profile information."
        />
        
        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-200/60 space-y-6">
          
          {/* Profile Picture */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-blue-100 flex items-center justify-center bg-slate-100">
              {previewImage ? (
                <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
              )}
            </div>
            <label className="px-6 py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl border border-blue-200 cursor-pointer hover:bg-blue-100 transition-all inline-block">
              Upload Picture
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Phone Number</label>
            <input 
              type="tel" 
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full text-black px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
              placeholder="+27 82 123 4567"
              required
            />
          </div>

          {/* Delivery Address */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-800 text-sm">Delivery Address</h3>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Country</label>
              <input
                type="text"
                value="South Africa (SA)"
                readOnly
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-100 text-slate-600 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">City</label>
                <select 
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
                  required
                >
                  <option value="">Select City</option>
                  {SA_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Province/Area</label>
                <input 
                  type="text" 
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
                  placeholder="e.g., Gauteng or Sandton"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Street Address</label>
              <input 
                type="text" 
                value={form.street}
                onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
                placeholder="e.g., 123 Main Street"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">P.O. Box (Optional)</label>
              <input 
                type="text" 
                value={form.pobox}
                onChange={(e) => setForm((prev) => ({ ...prev, pobox: e.target.value }))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-slate-50"
                placeholder="P.O. Box (optional)"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#ff9300] to-[#ffb857] text-white font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
          >
            {mutation.isPending ? 'Saving...' : 'Complete Setup'}
          </button>

          {mutation.error && (
            <div className="p-4 bg-error/10 border border-error rounded-xl">
              <p className="text-sm text-error font-medium">An error occurred. Please try again.</p>
            </div>
          )}
        </form>
      </PageContainer>
    </div>
  );
};
