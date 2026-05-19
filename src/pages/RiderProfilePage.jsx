// RiderProfilePage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchRiderProfile, updateRiderProfile } from "../api/rider";
import { useLogout } from "../hooks/useLogout";
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
  const logout = useLogout();
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center font-black uppercase tracking-widest text-xs text-slate-400 animate-pulse">
          Loading Profile...
        </div>
      </div>
    );
  }

  const roleLabel = rider?.rider_status ? `Rider • ${rider.rider_status.replace("_", " ")}` : "Rider";
  const vehicleValue = [rider?.vehicle_type, rider?.license_number].filter(Boolean).join(" • ") || "Vehicle not set";
  const personalInfo = [rider?.email, rider?.phone, rider?.city, rider?.state].filter(Boolean).join(" • ") || "Profile details incomplete.";
  const licenseInfo = rider?.license_number || "No license number uploaded.";
  const locationInfo =
    rider?.current_latitude != null && rider?.current_longitude != null
      ? `${Number(rider.current_latitude).toFixed(5)}, ${Number(rider.current_longitude).toFixed(5)}`
      : "No live location shared yet.";
  const avatarInitials = rider?.full_name
    ? rider.full_name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()
    : "RD";

  return (
    <div className="min-h-screen bg-slate-50 font-body text-slate-900 antialiased pt-16 pb-32 overflow-x-hidden">
      {/* Mobile Sticky Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-white px-4 border-b border-slate-100 max-w-md mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-lg font-bold">arrow_back_ios_new</span>
        </button>

        <h1 className="text-sm font-black tracking-wider text-[#0A192F] uppercase">
          My Account
        </h1>

        <button
          onClick={() => navigate("/profile/notifications")}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-[#0A192F] active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#ff8c00] ring-2 ring-white"></span>
        </button>
      </header>

      {/* Main Structural Wrapper Component layout */}
      <main className="mx-auto max-w-md px-4 pt-4 space-y-6">
        
        {/* Profile Identity Avatar Sheet Block */}
        <section className="relative flex flex-col items-center rounded-[2rem] bg-white p-6 text-center shadow-sm border border-slate-100">
          <div className="relative mb-3">
            <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-orange-50 p-0.5 shadow-md">
              {rider?.avatar_url ? (
                <img
                  alt="Profile Avatar"
                  className="h-full w-full rounded-full object-cover"
                  src={rider.avatar_url}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-2xl font-black text-slate-500">
                  {avatarInitials}
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-[#ff8c00] text-white shadow-md active:scale-90 transition-transform">
              <span className="material-symbols-outlined text-base">photo_camera</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          {uploadError && <p className="mb-2 text-[10px] font-black text-red-500 uppercase">{uploadError}</p>}
          
          <h2 className="text-xl font-black tracking-tight text-[#0A192F] truncate max-w-full">{rider?.full_name}</h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ff8c00] mt-0.5">{roleLabel}</p>

          {/* Cleaned Optimized 2-Column Balanced Ticker Summary Block */}
          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <StatCard value={rider?.wallet_balance?.toFixed(0) || "0"} label="Balance" />
            <StatCard value={rider?.total_deliveries || 0} label="Trips" />
          </div>
        </section>

        {/* Account Details Core Block section */}
        <section className="space-y-2.5">
          <h3 className="px-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Account Details</h3>
          <div className="space-y-2">
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
              onClick={() =>
                setActiveSheet({
                  title: "Vehicle Details",
                  content: `Vehicle: ${rider?.vehicle_type || "Not set"}\nLicense: ${rider?.license_number || "Not set"}\nCurrent location: ${locationInfo}`,
                })
              }
            />
          </div>
        </section>

        {/* Compliance Section Container Block */}
        <section className="space-y-2.5">
          <h3 className="px-1 text-[9px] font-black uppercase tracking-widest text-slate-400">Compliance Documentation</h3>
          <div className="grid grid-cols-2 gap-3">
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
              expiry={rider?.is_onboarded ? "Approved" : "Setup Needed"}
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

        {/* Account Termination/Logout Operations Deck */}
        <section className="pt-2">
          <button
            onClick={() => {
              logout("/rider/login");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-200/60 py-3.5 text-xs font-black uppercase tracking-widest text-red-500 active:scale-[0.99] transition-transform shadow-sm"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            Logout Session
          </button>
        </section>
      </main>

      {/* Global Bottom Tab Bar Navigation System */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center px-4 bg-white/95 backdrop-blur-xl z-50 border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.02)] max-w-md mx-auto rounded-t-2xl">
        <NavItem to="/rider/dashboard" icon="home" />
        <NavItem to="/rider/wallet" icon="payments" />
        <NavItem to="/rider/orders" icon="receipt_long" />
        <NavItem to="/rider/profile" icon="person" active />
      </nav>

      {/* Dynamic Overlay Slide-Up Panel Controller Context Sheet */}
      {activeSheet && (
        <>
          <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-sm" onClick={closeSheet} />
          <div className="fixed bottom-0 left-0 right-0 z-[70] w-full max-w-md mx-auto animate-in slide-in-from-bottom duration-200">
            <div className="overflow-hidden rounded-t-[2rem] bg-white p-5 border-t shadow-xl">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
              <h2 className="text-lg font-black text-[#0A192F] mb-2">{activeSheet.title}</h2>
              <p className="whitespace-pre-line text-xs font-bold text-slate-500 leading-relaxed mb-6">
                {activeSheet.content}
              </p>
              <button
                onClick={closeSheet}
                className="w-full rounded-xl bg-[#0A192F] py-3 text-xs font-black uppercase tracking-widest text-white active:scale-95 transition-transform"
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
  <div className="rounded-xl bg-slate-50/60 py-3 border border-slate-100">
    <p className="text-base font-black text-[#0A192F]">{value}</p>
    <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mt-0.5">{label}</p>
  </div>
);

const MenuLink = ({ icon, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-100 active:scale-[0.99] transition-transform"
  >
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#ff8c00] flex-shrink-0">
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <div className="flex-1 text-left min-w-0">
      <p className="font-black text-[#0A192F] text-xs uppercase tracking-wide">{title}</p>
      <p className="text-[11px] font-bold text-slate-400 truncate mt-0.5">{subtitle}</p>
    </div>
    <span className="material-symbols-outlined text-slate-300 text-lg flex-shrink-0">chevron_right</span>
  </button>
);

const DocCard = ({ icon, title, expiry, actionLabel = "View", onClick }) => (
  <button
    onClick={onClick}
    className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 text-left flex flex-col h-full active:scale-[0.98] transition-all"
  >
    <span className="material-symbols-outlined text-xl text-[#ff8c00] mb-2">{icon}</span>
    <p className="text-xs font-black text-[#0A192F] leading-tight line-clamp-1">{title}</p>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5 mb-4">{expiry}</p>
    <div className="w-full mt-auto rounded-lg bg-slate-50 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 text-center border border-slate-100">
      {actionLabel}
    </div>
  </button>
);

const NavItem = ({ to, icon, active = false }) => (
  <Link 
    to={to} 
    className={`flex items-center justify-center rounded-xl w-11 h-11 transition-all duration-200 ${
      active ? "bg-[#ff8c00] text-white shadow-md shadow-orange-500/20" : "text-slate-400 active:text-slate-900"
    }`}
  >
    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
      {icon}
    </span>
  </Link>
);
