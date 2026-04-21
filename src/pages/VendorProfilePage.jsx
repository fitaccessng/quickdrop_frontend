import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { fetchVendorProfile, updateVendorProfile } from "../api/vendorPortal";
import { maskAccountNumber } from "../lib/vendorPortal";

export const VendorProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", type: null });
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const profileQuery = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: fetchVendorProfile,
  });

  const profile = profileQuery.data;

  const updateMutation = useMutation({
    mutationFn: updateVendorProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile"] });
      setModalConfig({ ...modalConfig, isOpen: false });
    },
  });

  const toggleSetting = (field, value) => {
    updateMutation.mutate({ [field]: value });
  };

  const openDetails = (title, type) => {
    setModalConfig({ isOpen: true, title, type });
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-20 font-body antialiased text-slate-900 pb-32">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-white/80 backdrop-blur-xl px-6 py-4 border-b border-slate-50">
        <h1 className="font-headline text-xl font-extrabold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <button className="text-slate-400 hover:text-slate-900 transition-colors">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <main className="mx-auto max-w-md px-5 mt-6 space-y-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white/10 bg-slate-800">
                <img
                  alt="Store Logo"
                  src={profile?.logo_url || "https://ui-avatars.com/api/?name=Vendor&background=ff9300&color=fff"}
                  className="h-full w-full object-cover"
                />
              </div>
              <button 
                onClick={() => openDetails("Edit Profile Image", "avatar")}
                className="absolute bottom-0 right-0 rounded-full bg-[#ff9300] p-2 text-white shadow-lg active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-sm" style={materialIconFill}>edit</span>
              </button>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-black tracking-tight">
                {profileQuery.isLoading ? "Loading..." : (profile?.name || "Store Name")}
              </h2>
              <p className="text-sm font-medium text-slate-400">
                {profile?.category || "Vendor"} • {profile?.city || "Premium Merchant"}
              </p>
            </div>
          </div>
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[#ff9300]/10 blur-3xl" />
        </section>

        <div className="grid grid-cols-3 gap-3">
          <MiniCard label="Approval" value={profile?.is_approved ? "Live" : "Review"} />
          <MiniCard label="Rating" value={`${(profile?.rating ?? 0).toFixed(1)}`} />
          <MiniCard label="Radius" value={`${profile?.delivery_radius_km ?? 5}km`} />
        </div>

        <SectionTitle title="Onboarding & Setup" />
        <div className="grid gap-3">
          <SettingsItem 
            icon="storefront" 
            title="Store Setup" 
            description="Manage name, category and city"
            onClick={() => openDetails("Store Setup", "store")}
          />
          <SettingsItem 
            icon="badge" 
            title="Vendor Registration" 
            description="Business registration and KYC"
            onClick={() => openDetails("Vendor Registration", "kyc")}
          />
          <SettingsItem 
            icon="payments" 
            title="Bank Details" 
            description={profile?.bank_name ? `${profile.bank_name} • ${maskAccountNumber(profile.bank_account)}` : "Configure payouts"} 
            onClick={() => openDetails("Bank Details", "bank")}
          />
        </div>

        <SectionTitle title="Store Operations" />
        <div className="grid gap-3">
          <SettingsItem 
            icon="schedule" 
            title="Opening Hours" 
            description="Set your weekly operating hours" 
            onClick={() => openDetails("Opening Hours", "hours")}
          />
          <SettingsItem
            icon="local_shipping"
            title="Delivery Radius"
            description={`${profile?.delivery_radius_km ?? 5} km operating radius`}
            onClick={() => openDetails("Delivery Radius", "radius")}
          />
          <SettingsItem
            icon="offline_bolt"
            title="Auto-Accept Orders"
            description="Instantly confirm incoming orders"
            toggle
            isOn={Boolean(profile?.auto_accept_orders)}
            onToggle={(value) => toggleSetting("auto_accept_orders", value)}
          />
        </div>

        <SectionTitle title="Earnings & Payouts" />
        <div className="grid gap-3">
          <SettingsItem 
            icon="account_balance_wallet" 
            title="Wallet Balance" 
            description="View breakdown of your earnings" 
            onClick={() => openDetails("Wallet Balance", "wallet")}
          />
          <SettingsItem 
            icon="request_quote" 
            title="Payout Requests" 
            description="Withdraw funds to your bank account" 
            onClick={() => openDetails("Payout Request", "payout")}
          />
        </div>

        <button className="w-full rounded-[1.5rem] bg-red-50 p-4 text-center text-sm font-bold text-red-500 active:scale-95 transition-all mt-4">
          Deactivate Store
        </button>
      </main>

      <AnimatePresence>
        {modalConfig.isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[3rem] max-h-[92vh] overflow-y-auto px-7 pt-4 pb-12 shadow-2xl"
            >
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mb-4" />
              
              <div className="absolute top-6 right-6">
                <button 
                  onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-400 active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="mb-10 text-center pt-4 px-8">
                <h2 className="text-2xl font-headline font-extrabold text-slate-900">{modalConfig.title}</h2>
                <p className="text-sm text-slate-400 font-medium mt-1">Manage your {modalConfig.title.toLowerCase()} settings</p>
              </div>

              <div className="space-y-6">
                {/* STORE SETUP */}
                {modalConfig.type === 'store' && (
                  <div className="space-y-4">
                    <InputGroup label="Official Store Name" placeholder="e.g. The South African Grill" value={profile?.name} />
                    <SelectGroup 
                      label="Store Category" 
                      options={['Restaurant', 'Grocery', 'Pharmacy', 'Retail']} 
                      value={profile?.category} 
                    />
                    <InputGroup label="Operating City" placeholder="e.g. Johannesburg" value={profile?.city} />
                    <TextAreaGroup label="Store Description" placeholder="Describe your store to customers..." value={profile?.description} />
                  </div>
                )}

                {/* VENDOR REGISTRATION / KYC */}
                {modalConfig.type === 'kyc' && (
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100 uppercase tracking-tight">
                       Regulatory documents are required for South African merchant compliance.
                     </p>
                     <InputGroup label="Business Reg. Number (CIPC)" placeholder="K2021XXXXXX" value={profile?.business_registration_number} />
                     <InputGroup label="VAT Number (Optional)" placeholder="4XXXXXXXXX" value={profile?.vat_number} />
                     <div className="p-6 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center bg-slate-50">
                        <span className="material-symbols-outlined text-slate-300 mb-2">upload_file</span>
                        <p className="text-[10px] font-black uppercase text-slate-400">Upload ID or Permit (PDF/JPG)</p>
                     </div>
                  </div>
                )}

                {/* BANK DETAILS */}
                {modalConfig.type === 'bank' && (
                  <div className="space-y-4">
                     <p className="text-[10px] font-bold text-slate-500 bg-slate-50 p-4 rounded-2xl uppercase">
                       Ensure details match your business registration to avoid payout failure.
                     </p>
                     <InputGroup label="Bank Name" placeholder="e.g. FNB, Capitec, Nedbank" value={profile?.bank_name} />
                     <InputGroup label="Account Holder" placeholder="Legal Name" value={profile?.bank_account_name} />
                     <InputGroup label="Account Number" placeholder="000 000 000" value={profile?.bank_account} />
                  </div>
                )}

                {/* OPENING HOURS */}
                {modalConfig.type === 'hours' && (
                  <div className="space-y-3">
                     {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                       <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                          <span className="text-sm font-bold text-slate-700">{day}</span>
                          <div className="flex items-center gap-2">
                             <input type="time" className="bg-transparent text-xs font-black" defaultValue="08:00" />
                             <span className="text-slate-300">-</span>
                             <input type="time" className="bg-transparent text-xs font-black" defaultValue="20:00" />
                          </div>
                       </div>
                     ))}
                  </div>
                )}

                {/* DELIVERY RADIUS */}
                {modalConfig.type === 'radius' && (
                  <div className="space-y-6 py-4">
                     <div className="text-center">
                        <p className="text-4xl font-black font-headline text-slate-900">{profile?.delivery_radius_km || 5} <span className="text-lg">km</span></p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Current Coverage Area</p>
                     </div>
                     <input 
                       type="range" min="1" max="50" step="1" 
                       className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#ff9300]" 
                       defaultValue={profile?.delivery_radius_km || 5}
                     />
                     <p className="text-[10px] font-medium text-slate-400 leading-relaxed text-center">
                       Adjusting your radius affects which customers can see your store. Larger radii may increase delivery times.
                     </p>
                  </div>
                )}

                {/* WALLET / EARNINGS */}
                {modalConfig.type === 'wallet' && (
                  <div className="space-y-6">
                    <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#ff9300] mb-1">Available Funds</p>
                      <h3 className="text-4xl font-black font-headline tracking-tighter">R 12,450.00</h3>
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ff9300] rounded-full blur-[50px] opacity-20"></div>
                    </div>
                    <div className="space-y-3">
                       <WalletRow label="Pending Settlement" value="R 2,100.00" />
                       <WalletRow label="Total Withdrawn" value="R 45,000.00" />
                       <WalletRow label="Platform Commission (15%)" value="R 1,867.50" color="text-red-400" />
                    </div>
                  </div>
                )}

                {/* PAYOUT REQUEST */}
                {modalConfig.type === 'payout' && (
                  <div className="space-y-6">
                     <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100 text-center">
                        <p className="text-[10px] font-black text-[#ff9300] uppercase tracking-widest mb-1">Max Withdrawal</p>
                        <p className="text-2xl font-black text-slate-900">R 12,450.00</p>
                     </div>
                     <InputGroup label="Amount to Withdraw (ZAR)" placeholder="0.00" />
                     <p className="text-[10px] font-bold text-slate-400 text-center px-4">
                       Payouts are processed within 24-48 hours to your linked bank account.
                     </p>
                  </div>
                )}

                <button 
                  onClick={() => updateMutation.mutate({})} 
                  className="w-full py-5 bg-slate-950 text-white font-headline font-extrabold text-lg rounded-[2.5rem] shadow-xl active:scale-95 transition-all mt-4"
                >
                  {updateMutation.isPending ? "Updating..." : "Save Settings"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around rounded-t-[2.5rem] bg-white/90 px-4 pb-8 pt-2 shadow-[0_-8px_32px_rgba(0,0,0,0.05)] backdrop-blur-2xl border-t border-slate-50">
        <NavButton icon="storefront" label="Shop" onClick={() => navigate("/vendor/dashboard")} />
        <NavButton icon="shopping_bag" label="Orders" onClick={() => navigate("/vendor/orders")} />
        <button onClick={() => navigate("/vendor/upload-product")} className="scale-110 -translate-y-4 rounded-full border-4 border-[#fcfcfc] bg-slate-900 p-3 text-white shadow-xl transition-all active:scale-90">
          <span className="material-symbols-outlined text-[28px]" style={materialIconFill}>add_circle</span>
        </button>
        <NavButton icon="analytics" label="Insights" onClick={() => navigate("/vendor/analytics")} />
        <NavButton icon="person" label="Profile" active />
      </nav>
    </div>
  );
};

// --- REUSABLE COMPONENTS ---

const InputGroup = ({ label, placeholder, value }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{label}</label>
    <input 
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm focus:outline-none focus:border-[#ff9300] transition-colors"
      placeholder={placeholder}
      defaultValue={value}
    />
  </div>
);

const TextAreaGroup = ({ label, placeholder, value }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{label}</label>
    <textarea 
      rows={3}
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm focus:outline-none focus:border-[#ff9300] transition-colors resize-none"
      placeholder={placeholder}
      defaultValue={value}
    />
  </div>
);

const SelectGroup = ({ label, options, value }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{label}</label>
    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm focus:outline-none focus:border-[#ff9300] transition-colors appearance-none">
      {options.map(opt => <option key={opt} value={opt} selected={opt === value}>{opt}</option>)}
    </select>
  </div>
);

const WalletRow = ({ label, value, color = "text-slate-900" }) => (
  <div className="flex justify-between items-center px-2 py-1">
    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    <span className={`text-sm font-black ${color}`}>{value}</span>
  </div>
);

const MiniCard = ({ label, value }) => (
  <div className="rounded-[1.6rem] border border-slate-100 bg-white p-4 text-center shadow-sm">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-2 text-lg font-black text-slate-900">{value}</p>
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 className="px-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
);

const SettingsItem = ({ icon, title, description, toggle, isOn = true, onToggle, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between rounded-[2rem] bg-white border border-slate-50 p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
  >
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-900">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="text-left">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <p className="text-[10px] font-medium text-slate-400 leading-tight uppercase tracking-tighter mt-0.5">{description}</p>
      </div>
    </div>

    {toggle ? (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.(!isOn);
        }}
        className={`h-6 w-11 rounded-full p-1 transition-colors ${isOn ? "bg-[#ff9300]" : "bg-slate-200"}`}
      >
        <div className={`h-4 w-4 rounded-full bg-white transition-transform ${isOn ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    ) : (
      <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
    )}
  </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 ${active ? "text-[#ff9300]" : "text-slate-300"}`}>
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
    <span className="mt-1 text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);