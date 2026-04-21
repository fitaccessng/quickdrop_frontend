import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchRiderProfile, updateRiderProfile } from "../api/rider";
import { useAuthStore } from "../store/authStore";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const RiderProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const setProfile = useAuthStore((state) => state.setProfile);
  const [activeSheet, setActiveSheet] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const { data: rider, isLoading } = useQuery({
    queryKey: ["rider-profile"],
    queryFn: fetchRiderProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateRiderProfile,
    onSuccess: (data) => {
      setProfile(data);
      queryClient.invalidateQueries({ queryKey: ["rider-profile"] });
      setUploadError("");
    },
    onError: (error) => {
      setUploadError(error.response?.data?.detail || "Unable to update rider profile.");
    },
  });

  const closeSheet = () => setActiveSheet(null);

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const avatarUrl = await readFileAsDataUrl(file);
      updateMutation.mutate({ avatar_url: avatarUrl });
    } catch {
      setUploadError("Unable to read the selected image.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center font-black uppercase tracking-widest text-slate-400">
        Loading Profile...
      </div>
    );
  }

  const roleLabel = rider?.rider_status ? `Rider • ${rider.rider_status}` : "Rider";
  const tenureValue = rider?.is_onboarded ? "Active" : "Pending";
  const vehicleValue = [rider?.vehicle_type, rider?.license_number].filter(Boolean).join(" • ") || "Vehicle not set";
  const personalInfo = [rider?.email, rider?.phone, rider?.city, rider?.state].filter(Boolean).join(" • ") || "Profile details not complete yet.";
  const licenseInfo = rider?.license_number || "No license number uploaded.";
  const locationInfo =
    rider?.current_latitude != null && rider?.current_longitude != null
      ? `${Number(rider.current_latitude).toFixed(5)}, ${Number(rider.current_longitude).toFixed(5)}`
      : "No live location shared yet.";

  return (
    <div className="min-h-screen bg-[#f9f9f9] font-body text-slate-900 antialiased pb-32">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-white/80 px-6 backdrop-blur-xl border-b border-slate-50">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-100 text-[#0A192F] active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
        </button>

        <h1 className="text-sm font-black tracking-widest text-[#0A192F] uppercase">
          My Account
        </h1>

        <button
          onClick={() => navigate("/notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-100 text-[#0A192F] active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#ff8c00]"></span>
        </button>
      </header>

      <main className="mx-auto max-w-md px-6 pt-24 space-y-8">
        <section className="relative flex flex-col items-center rounded-[2.5rem] bg-white p-8 text-center shadow-sm border border-slate-100">
          <div className="relative mb-4">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-orange-50 p-1 shadow-xl">
              <img
                alt="Profile"
                className="h-full w-full rounded-full object-cover"
                src={rider?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80"}
              />
            </div>
            <label className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#ff8c00] text-white shadow-lg">
              <span className="material-symbols-outlined text-lg">photo_camera</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          {uploadError ? <p className="mb-3 text-xs font-bold text-red-500">{uploadError}</p> : null}
          <h2 className="text-3xl font-black tracking-tight text-[#0A192F]">{rider?.full_name}</h2>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff8c00]">{roleLabel}</p>

          <div className="mt-8 grid w-full grid-cols-3 gap-4">
            <StatCard value={rider?.wallet_balance?.toFixed(0) || "0"} label="Balance" />
            <StatCard value={rider?.total_deliveries || 0} label="Trips" />
            <StatCard value={tenureValue} label="Status" />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Account Details</h3>
          <div className="space-y-3">
            <MenuLink
              icon="person_edit"
              title="Personal Info"
              subtitle={personalInfo}
              onClick={() =>
                setActiveSheet({
                  title: "Personal Info",
                  content: `${rider?.full_name}\n${rider?.email || ""}\n${rider?.phone || ""}\n${rider?.city || ""} ${rider?.state || ""}`.trim(),
                })
              }
            />
            <MenuLink
              icon="moped"
              title="Vehicle Details"
              subtitle={vehicleValue}
              badge={rider?.rider_status === "delivering" ? "Busy" : "Active"}
              onClick={() =>
                setActiveSheet({
                  title: "Vehicle Details",
                  content: `Vehicle: ${rider?.vehicle_type || "Not set"}\nLicense: ${rider?.license_number || "Not set"}\nCurrent location: ${locationInfo}`,
                })
              }
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Compliance</h3>
          <div className="grid grid-cols-2 gap-4">
            <DocCard
              icon="badge"
              title="Driver's License"
              expiry={rider?.license_number ? "Verified" : "Pending"}
              onClick={() =>
                setActiveSheet({
                  title: "Driver's License",
                  content: licenseInfo,
                })
              }
            />
            <DocCard
              icon="gpp_good"
              title="Profile Status"
              expiry={rider?.is_onboarded ? "Active" : "Setup Needed"}
              actionLabel="View"
              onClick={() =>
                setActiveSheet({
                  title: "Rider Status",
                  content: `Current rider status: ${rider?.rider_status || "offline"}\nWallet balance: ${rider?.wallet_balance || 0}\nTotal earnings: ${rider?.total_earnings || 0}`,
                })
              }
            />
          </div>
        </section>

        <section className="pb-12 text-center">
          <button
            onClick={() => {
              clearSession();
              navigate("/rider/login");
            }}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white border border-slate-100 py-4 font-black uppercase tracking-widest text-red-500 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-8 pt-4 bg-white/90 backdrop-blur-2xl z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] border-t border-slate-100">
        <NavItem to="/rider/dashboard" icon="home" />
        <NavItem to="/rider/wallet" icon="payments" />
        <NavItem to="/rider/orders" icon="receipt_long" />
        <NavItem to="/rider/profile" icon="person" active />
      </nav>

      {activeSheet && (
        <>
          <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm" onClick={closeSheet} />
          <div className="fixed bottom-0 left-0 z-[70] w-full animate-in slide-in-from-bottom duration-300">
            <div className="mx-auto max-w-md overflow-hidden rounded-t-[2.5rem] bg-white p-8 shadow-2xl">
              <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-slate-200" />
              <h2 className="text-2xl font-black text-[#0A192F] mb-4">{activeSheet.title}</h2>
              <p className="whitespace-pre-line text-slate-500 font-bold leading-relaxed mb-8">
                {activeSheet.content}
              </p>
              <button
                onClick={closeSheet}
                className="w-full rounded-2xl bg-[#0A192F] py-4 font-black uppercase tracking-widest text-white active:scale-95 transition-transform"
              >
                Close Details
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ value, label }) => (
  <div className="rounded-2xl bg-slate-50 py-4 border border-slate-100">
    <p className="text-xl font-black text-[#0A192F]">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
  </div>
);

const MenuLink = ({ icon, title, subtitle, badge, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-4 rounded-[1.5rem] bg-white p-5 shadow-sm border border-slate-50 active:scale-[0.98] transition-all"
  >
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#ff8c00]">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="flex-1 text-left">
      <div className="flex items-center gap-2">
        <p className="font-black text-[#0A192F] text-sm">{title}</p>
        {badge && (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-black uppercase text-green-600">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-slate-400">{subtitle}</p>
    </div>
    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
  </button>
);

const DocCard = ({ icon, title, expiry, actionLabel = "Edit", onClick }) => (
  <button
    onClick={onClick}
    className="rounded-[2rem] bg-white p-5 shadow-sm border border-slate-100 text-left active:scale-[0.97] transition-all"
  >
    <span className="material-symbols-outlined mb-3 block text-[#ff8c00]">{icon}</span>
    <p className="text-sm font-black text-[#0A192F]">{title}</p>
    <p className="mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{expiry}</p>
    <div className="w-full rounded-xl bg-slate-50 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 text-center">
      {actionLabel}
    </div>
  </button>
);

const NavItem = ({ to, icon, active = false }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center rounded-full p-3 w-14 h-14 transition-all duration-300 ${
      active ? "bg-[#ff8c00] text-white scale-110 shadow-lg shadow-orange-500/40" : "text-slate-400 hover:text-[#0A192F]"
    }`}
  >
    <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
      {icon}
    </span>
  </Link>
);
