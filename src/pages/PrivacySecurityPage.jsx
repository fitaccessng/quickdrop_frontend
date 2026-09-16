import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PrivacySecurityPage = () => {
  const navigate = useNavigate();

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
            <h1 className="font-bold text-sm text-[#191c1e] uppercase tracking-wider">Privacy & Security</h1>
            <div className="w-10"></div> {/* Spacer for symmetry */}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full pt-20 px-4 space-y-5 flex-1">
          
          {/* Account Security Section */}
          <section className="space-y-2">
            <h3 className="px-1 text-[10px] font-bold uppercase tracking-wider text-[#565e74]">Account Security</h3>
            
            <button 
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="w-full bg-white rounded-2xl p-4 border border-[#e0e3e5]/60 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between group"
              type="button"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 transition-transform group-active:scale-95">
                  <span className="material-symbols-outlined text-lg">lock</span>
                </div>
                <div>
                  <p className="font-bold text-xs text-[#191c1e]">Change Password</p>
                  <p className="text-[10px] text-[#565e74] mt-0.5">Update your account access password</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#565e74] text-lg group-hover:translate-x-0.5 transition-transform">
                chevron_right
              </span>
            </button>

            {showPasswordForm && (
              <div className="bg-white rounded-2xl p-5 border border-[#e0e3e5]/60 shadow-sm space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#565e74] block">Current Password</label>
                  <input 
                    type="password" 
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 border border-[#e0e3e5] rounded-xl text-xs font-bold text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/50 bg-[#f7f9fb]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#565e74] block">New Password</label>
                  <input 
                    type="password" 
                    name="new"
                    value={passwords.new}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border border-[#e0e3e5] rounded-xl text-xs font-bold text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/50 bg-[#f7f9fb]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#565e74] block">Confirm Password</label>
                  <input 
                    type="password" 
                    name="confirm"
                    value={passwords.confirm}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 border border-[#e0e3e5] rounded-xl text-xs font-bold text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#e11d48]/50 bg-[#f7f9fb]"
                  />
                </div>
                <div className="flex gap-2.5 pt-1">
                  <button 
                    onClick={() => setShowPasswordForm(false)}
                    className="flex-1 h-11 text-xs font-bold uppercase tracking-wider text-[#191c1e] bg-[#f2f4f6] hover:bg-[#eceef0] border border-[#e0e3e5] rounded-xl active:scale-[0.98] transition-all"
                    type="button"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSavePassword}
                    className="flex-1 h-11 text-xs font-bold uppercase tracking-widest text-white bg-[#e11d48] hover:bg-[#b80035] rounded-xl active:scale-[0.98] transition-all shadow-sm"
                    type="button"
                  >
                    Save Password
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Two-Factor Authentication Section */}
          <section className="space-y-2">
            <h3 className="px-1 text-[10px] font-bold uppercase tracking-wider text-[#565e74]">Two-Factor Authentication</h3>
            
            <div className="bg-white rounded-2xl p-4 border border-[#e0e3e5]/60 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </div>
                <div>
                  <p className="font-bold text-xs text-[#191c1e]">Enable 2FA</p>
                  <p className="text-[10px] text-[#565e74] mt-0.5">Secure your account with multi-factor verification</p>
                </div>
              </div>
              
              <button
                onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFAEnabled ? 'bg-[#e11d48]' : 'bg-[#e0e3e5]'
                }`}
                type="button"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFAEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Privacy Controls Section */}
          <section className="space-y-2">
            <h3 className="px-1 text-[10px] font-bold uppercase tracking-wider text-[#565e74]">Privacy Controls</h3>
            
            <div className="bg-white rounded-2xl overflow-hidden border border-[#e0e3e5]/60 shadow-sm divide-y divide-[#eceef0]/60">
              <button 
                className="w-full p-4 hover:bg-[#f2f4f6]/60 transition-colors text-left flex items-center justify-between group"
                type="button"
              >
                <div className="flex-1">
                  <p className="font-bold text-xs text-[#191c1e]">Profile Visibility</p>
                  <p className="text-[10px] text-[#565e74] mt-0.5">Control who can discover or view your profile</p>
                </div>
                <span className="material-symbols-outlined text-[#565e74] text-lg group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </button>

              <button 
                className="w-full p-4 hover:bg-[#f2f4f6]/60 transition-colors text-left flex items-center justify-between group"
                type="button"
              >
                <div className="flex-1">
                  <p className="font-bold text-xs text-[#191c1e]">Data Sharing</p>
                  <p className="text-[10px] text-[#565e74] mt-0.5">Manage preference cookies and analytical data sharing</p>
                </div>
                <span className="material-symbols-outlined text-[#565e74] text-lg group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </button>

              <button 
                className="w-full p-4 hover:bg-[#f2f4f6]/60 transition-colors text-left flex items-center justify-between group"
                type="button"
              >
                <div className="flex-1">
                  <p className="font-bold text-xs text-[#191c1e]">Activity Log</p>
                  <p className="text-[10px] text-[#565e74] mt-0.5">Review your recent session logins and activities</p>
                </div>
                <span className="material-symbols-outlined text-[#565e74] text-lg group-hover:translate-x-0.5 transition-transform">
                  chevron_right
                </span>
              </button>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
};