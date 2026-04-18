import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PrivacySecurityPage = () => {
  const navigate = useNavigate();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = () => {
    if (passwords.new !== passwords.confirm) {
      alert('Passwords do not match');
      return;
    }
    // TODO: Call API to update password
    console.log('Password update:', passwords);
    setShowPasswordForm(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

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
          <h1 className="text-lg font-black text-slate-800">Privacy & Security</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* --- Content --- */}
      <main className="px-6 py-8 space-y-6">
        
        {/* Change Password Section */}
        <section className="space-y-3">
          <h3 className="px-4 text-xs font-black uppercase tracking-widest text-slate-400">Account Security</h3>
          <button 
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600" style={materialIconFill}>
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Change Password</p>
                <p className="text-xs text-slate-500">Update your account password</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
          </button>

          {showPasswordForm && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Current Password</label>
                <input 
                  type="password" 
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">New Password</label>
                <input 
                  type="password" 
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 bg-slate-50"
                />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 bg-slate-50"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowPasswordForm(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePassword}
                  className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#ff9300] to-[#ffb857] rounded-xl active:scale-95 transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </section>

        {/* 2FA Section */}
        <section className="space-y-3">
          <h3 className="px-4 text-xs font-black uppercase tracking-widest text-slate-400">Two-Factor Authentication</h3>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600" style={materialIconFill}>
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Enable 2FA</p>
                <p className="text-xs text-slate-500">Secure your account with two-factor auth</p>
              </div>
            </div>
            <button
              onClick={() => setTwoFAEnabled(!twoFAEnabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                twoFAEnabled ? 'bg-rose-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  twoFAEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="space-y-3">
          <h3 className="px-4 text-xs font-black uppercase tracking-widest text-slate-400">Privacy Controls</h3>
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm">
            <button className="w-full p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Profile Visibility</p>
                <p className="text-xs text-slate-500">Control who can see your profile</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
            <button className="w-full p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Data Sharing</p>
                <p className="text-xs text-slate-500">Manage how your data is shared</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
            <button className="w-full p-5 hover:bg-slate-50 transition-colors text-left flex items-center justify-between">
              <div className="flex-1">
                <p className="font-bold text-slate-800 text-sm">Activity Log</p>
                <p className="text-xs text-slate-500">View your recent account activity</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
