import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import {
  createVendorPayoutRequest,
  fetchVendorPayouts,
  fetchVendorProfile,
  updateVendorProfile,
} from "../api/vendorPortal";
import { useLogout } from "../hooks/useLogout";
import { formatMoney } from "../lib/utils";
import { maskAccountNumber } from "../lib/vendorPortal";

const buildStoreDraft = (profile) => ({
  name: profile?.name ?? "",
  category: profile?.category ?? "",
  city: profile?.city ?? "",
  description: profile?.description ?? "",
});

export const VendorProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useLogout();
  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: "", type: null });
  const [storeDraft, setStoreDraft] = useState({ name: "", category: "", city: "", description: "" });
  const [payoutDraft, setPayoutDraft] = useState({ amount: "", note: "" });
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  const profileQuery = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: fetchVendorProfile,
  });
  const payoutsQuery = useQuery({
    queryKey: ["vendor-payouts"],
    queryFn: fetchVendorPayouts,
  });

  const profile = profileQuery.data;
  const payouts = payoutsQuery.data;

  const updateMutation = useMutation({
    mutationFn: updateVendorProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-profile"] });
      setModalConfig({ isOpen: false, title: "", type: null });
    },
  });

  const payoutMutation = useMutation({
    mutationFn: createVendorPayoutRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-payouts"] });
      setPayoutDraft({ amount: "", note: "" });
    },
  });

  const payoutStatusTone = (status) => {
    if (status === "paid") return "bg-emerald-100 text-emerald-700";
    if (status === "approved") return "bg-sky-100 text-sky-700";
    if (status === "rejected") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const openDetails = (title, type) => {
    if (type === "store") {
      setStoreDraft(buildStoreDraft(profile));
    }
    setModalConfig({ isOpen: true, title, type });
  };

  const walletBreakdown = useMemo(
    () => [
      { label: "Delivered Revenue", value: formatMoney(payouts?.delivered_revenue ?? 0) },
      { label: "Pending Requests", value: formatMoney(payouts?.pending_request_total ?? 0) },
      { label: "Paid Out", value: formatMoney(payouts?.paid_out_total ?? 0) },
      { label: "Total Requested", value: formatMoney(payouts?.requested_total ?? 0) },
    ],
    [payouts],
  );

  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-20 font-body antialiased text-slate-900 pb-32">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-white/80 backdrop-blur-xl px-6 py-4 border-b border-slate-50">
        <h1 className="font-headline text-xl font-extrabold tracking-tight text-slate-900">Account Settings</h1>
        <button
          type="button"
          onClick={() => logout("/vendor/login")}
          className="text-slate-400 hover:text-slate-900 transition-colors"
        >
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
                onClick={() => openDetails("Store Setup", "store")}
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
            description={`${profile?.category || "Category"} • ${profile?.city || "City"}`}
            onClick={() => openDetails("Store Setup", "store")}
          />
          <SettingsItem
            icon="badge"
            title="Vendor Registration"
            description={profile?.business_registration_number || "Business registration and KYC"}
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
            onToggle={(value) => updateMutation.mutate({ auto_accept_orders: value })}
          />
        </div>

        <SectionTitle title="Earnings & Payouts" />
        <div className="grid gap-3">
          <SettingsItem
            icon="account_balance_wallet"
            title="Wallet Balance"
            description={formatMoney(payouts?.available_balance ?? 0)}
            onClick={() => openDetails("Wallet Balance", "wallet")}
          />
          <SettingsItem
            icon="request_quote"
            title="Payout Requests"
            description={`${payouts?.payout_requests?.length ?? 0} requests logged`}
            onClick={() => openDetails("Payout Requests", "payout")}
          />
        </div>
      </main>

      <AnimatePresence>
        {modalConfig.isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
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
                {modalConfig.type === "store" && (
                  <div className="space-y-4">
                    <InputGroup
                      label="Official Store Name"
                      value={storeDraft.name}
                      onChange={(value) => setStoreDraft((prev) => ({ ...prev, name: value }))}
                    />
                    <SelectGroup
                      label="Store Category"
                      options={[profile?.category].filter(Boolean)}
                      value={storeDraft.category}
                      disabled
                    />
                    <InputGroup
                      label="Operating City"
                      value={storeDraft.city}
                      onChange={(value) => setStoreDraft((prev) => ({ ...prev, city: value }))}
                    />
                    <TextAreaGroup
                      label="Store Description"
                      value={storeDraft.description}
                      onChange={(value) => setStoreDraft((prev) => ({ ...prev, description: value }))}
                    />
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          name: storeDraft.name,
                          city: storeDraft.city,
                          description: storeDraft.description,
                        })
                      }
                      className="w-full py-5 bg-slate-950 text-white font-headline font-extrabold text-lg rounded-[2.5rem] shadow-xl active:scale-95 transition-all"
                    >
                      {updateMutation.isPending ? "Updating..." : "Save Store Setup"}
                    </button>
                  </div>
                )}

                {modalConfig.type === "kyc" && (
                  <div className="space-y-4">
                    <ReadOnlyGroup label="Business Reg. Number (CIPC)" value={profile?.business_registration_number} />
                    <ReadOnlyGroup label="VAT Number" value={profile?.vat_number} />
                    <ReadOnlyGroup label="Tax Number" value={profile?.tin} />
                    <ReadOnlyGroup label="South African ID" value={profile?.south_african_id_number} />
                  </div>
                )}

                {modalConfig.type === "bank" && (
                  <div className="space-y-4">
                    <ReadOnlyGroup label="Bank Name" value={profile?.bank_name} />
                    <ReadOnlyGroup label="Account Holder" value={profile?.bank_account_name} />
                    <ReadOnlyGroup label="Account Number" value={maskAccountNumber(profile?.bank_account)} />
                  </div>
                )}

                {modalConfig.type === "hours" && (
                  <div className="space-y-3">
                    {Object.entries(profile?.opening_hours ?? {}).map(([day, value]) => (
                      <div key={day} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <span className="text-sm font-bold text-slate-700">{day}</span>
                        <span className="text-xs font-black text-slate-500">
                          {value?.closed ? "Closed" : `${value?.open || "--:--"} - ${value?.close || "--:--"}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {modalConfig.type === "radius" && (
                  <div className="space-y-6 py-4">
                    <div className="text-center">
                      <p className="text-4xl font-black font-headline text-slate-900">
                        {profile?.delivery_radius_km || 5} <span className="text-lg">km</span>
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Current Coverage Area</p>
                    </div>
                  </div>
                )}

                {modalConfig.type === "wallet" && (
                  <div className="space-y-6">
                    <div className="bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#ff9300] mb-1">Available Funds</p>
                      <h3 className="text-4xl font-black font-headline tracking-tighter">{formatMoney(payouts?.available_balance ?? 0)}</h3>
                      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-[#ff9300] rounded-full blur-[50px] opacity-20" />
                    </div>
                    <div className="space-y-3">
                      {walletBreakdown.map((row) => (
                        <WalletRow key={row.label} label={row.label} value={row.value} />
                      ))}
                    </div>
                  </div>
                )}

                {modalConfig.type === "payout" && (
                  <div className="space-y-6">
                    <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100 text-center">
                      <p className="text-[10px] font-black text-[#ff9300] uppercase tracking-widest mb-1">Withdrawable Balance</p>
                      <p className="text-2xl font-black text-slate-900">{formatMoney(payouts?.available_balance ?? 0)}</p>
                    </div>
                    <InputGroup
                      label="Amount to Withdraw"
                      value={payoutDraft.amount}
                      onChange={(value) => setPayoutDraft((prev) => ({ ...prev, amount: value }))}
                      type="number"
                    />
                    <TextAreaGroup
                      label="Note"
                      value={payoutDraft.note}
                      onChange={(value) => setPayoutDraft((prev) => ({ ...prev, note: value }))}
                    />
                    <button
                      onClick={() =>
                        payoutMutation.mutate({
                          amount: Number(payoutDraft.amount),
                          note: payoutDraft.note || null,
                        })
                      }
                      disabled={payoutMutation.isPending || !payoutDraft.amount}
                      className="w-full py-5 bg-slate-950 text-white font-headline font-extrabold text-lg rounded-[2.5rem] shadow-xl active:scale-95 transition-all disabled:opacity-50"
                    >
                      {payoutMutation.isPending ? "Submitting..." : "Submit Payout Request"}
                    </button>
                    {(payouts?.payout_requests ?? []).length > 0 && (
                      <div className="space-y-3">
                        {(payouts?.payout_requests ?? []).map((request) => (
                          <div key={request.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-extrabold text-slate-900">{formatMoney(request.amount)}</p>
                                <p className="text-xs text-slate-500">{new Date(request.created_at).toLocaleString()}</p>
                              </div>
                              <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${payoutStatusTone(request.status)}`}>
                                {request.status}
                              </span>
                            </div>
                            {request.note ? <p className="mt-2 text-xs text-slate-500">{request.note}</p> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {updateMutation.isError ? (
                  <p className="text-sm text-red-500">{updateMutation.error?.response?.data?.detail || "Unable to save changes."}</p>
                ) : null}
                {payoutMutation.isError ? (
                  <p className="text-sm text-red-500">{payoutMutation.error?.response?.data?.detail || "Unable to submit payout request."}</p>
                ) : null}
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

const InputGroup = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{label}</label>
    <input
      type={type}
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm focus:outline-none focus:border-[#ff9300] transition-colors"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const TextAreaGroup = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{label}</label>
    <textarea
      rows={3}
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm focus:outline-none focus:border-[#ff9300] transition-colors resize-none"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  </div>
);

const SelectGroup = ({ label, options, value, disabled = false }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{label}</label>
    <select
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-sm focus:outline-none focus:border-[#ff9300] transition-colors appearance-none"
      value={value}
      disabled={disabled}
      onChange={() => {}}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const ReadOnlyGroup = ({ label, value }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{label}</label>
    <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm font-bold text-slate-700">
      {value || "Not provided"}
    </div>
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
    onClick={toggle ? undefined : onClick}
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
        onClick={(event) => {
          event.stopPropagation();
          onToggle(!isOn);
        }}
        className={`relative h-7 w-12 rounded-full transition-colors ${isOn ? "bg-[#ff9300]" : "bg-slate-200"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${isOn ? "left-6" : "left-1"}`} />
      </button>
    ) : (
      <span className="material-symbols-outlined text-slate-300">chevron_right</span>
    )}
  </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 ${active ? "text-[#ff9300]" : "text-slate-300"}`}>
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
    <span className="mt-1 text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);
