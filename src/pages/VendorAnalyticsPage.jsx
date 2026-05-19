import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { fetchProducts } from "../api/products";
import { createVendorPromotion, fetchVendorAnalytics, fetchVendorPayouts, fetchVendorProfile, fetchVendorPromotions } from "../api/vendorPortal";
import { formatMoney } from "../lib/utils";
import { getInventoryStats } from "../lib/vendorPortal";

export const VendorAnalyticsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };
  const [promoForm, setPromoForm] = useState({
    promo_type: "seasonal_discount",
    product_id: "",
    title: "",
    description: "",
    discount_percent: "",
  });
  const [promoMessage, setPromoMessage] = useState("");

  const profileQuery = useQuery({ queryKey: ["vendor-profile"], queryFn: fetchVendorProfile });
  const analyticsQuery = useQuery({ queryKey: ["vendor-analytics"], queryFn: fetchVendorAnalytics });
  const payoutsQuery = useQuery({ queryKey: ["vendor-payouts"], queryFn: fetchVendorPayouts });
  const promotionsQuery = useQuery({ queryKey: ["vendor-promotions"], queryFn: fetchVendorPromotions });
  const productsQuery = useQuery({
    queryKey: ["vendor-products-analytics", profileQuery.data?.id],
    queryFn: () => fetchProducts({ vendor_id: profileQuery.data.id, include_unavailable: true }),
    enabled: Boolean(profileQuery.data?.id),
  });

  const analytics = analyticsQuery.data;
  const inventoryStats = useMemo(() => getInventoryStats(productsQuery.data ?? []), [productsQuery.data]);

  const revenues = analytics?.monthly_revenue?.map((item) => item.revenue) || [];
  const maxRev = Math.max(...revenues, 1);
  const payoutSummary = payoutsQuery.data;
  const promotions = promotionsQuery.data ?? analytics?.promotions ?? [];

  const promoMutation = useMutation({
    mutationFn: createVendorPromotion,
    onSuccess: () => {
      setPromoMessage("Promotion submitted for admin review.");
      setPromoForm({
        promo_type: "seasonal_discount",
        product_id: "",
        title: "",
        description: "",
        discount_percent: "",
      });
      queryClient.invalidateQueries({ queryKey: ["vendor-promotions"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-analytics"] });
    },
    onError: (error) => {
      const detail = error?.response?.data?.detail;
      setPromoMessage(typeof detail === "string" ? detail : "Unable to submit promotion right now.");
    },
  });

  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-20 font-body antialiased text-slate-900 pb-32">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-white/80 backdrop-blur-xl px-6 py-4 border-b border-slate-50">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
        </button>
        <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white shadow-sm">
          <img
            alt="Vendor Profile"
            src={profileQuery.data?.logo_url || "/favicon.svg"}
            className="h-full w-full object-cover"
          />
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 mt-6 space-y-8">
        {/* NEW GLOBAL STATS CARD */}
        <section className="bg-slate-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ff9300] mb-1">Total Revenue</p>
                  <h2 className="text-4xl font-headline font-extrabold tracking-tighter">
                    {analyticsQuery.isLoading ? "..." : formatMoney(analytics?.total_revenue)}
                  </h2>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#ff9300]">payments</span>
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Wallet Balance</p>
                  <p className="text-lg font-black">{formatMoney(payoutSummary?.available_balance ?? 0)}</p>
               </div>
               <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Requests</p>
                <p className="text-lg font-black text-slate-400">{formatMoney(payoutSummary?.pending_request_total ?? 0)}</p>
              </div>
            </div>
          </div>
          {/* Decorative Glow */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#ff9300] rounded-full blur-[80px] opacity-20"></div>
        </section>

        {/* REVENUE CHART BENTO */}
        <section className="rounded-[2rem] bg-white p-6 border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h4 className="font-headline font-extrabold text-slate-900">Monthly Growth</h4>
              <span className="text-[10px] font-black uppercase text-[#ff9300] bg-orange-50 px-3 py-1 rounded-full">Live Trend</span>
           </div>
           <div className="h-24 flex items-end justify-between gap-2">
              {analytics?.monthly_revenue?.map((item, index) => (
                <div
                  key={index}
                  style={{ height: `${Math.max((item.revenue / maxRev) * 100, 15)}%` }}
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    index === analytics.monthly_revenue.length - 1 ? "bg-[#ff9300]" : "bg-slate-100 hover:bg-orange-100"
                  }`}
                ></div>
              )) || Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="w-full h-8 bg-slate-50 rounded-t-lg animate-pulse" />
              ))}
            </div>
        </section>

        {/* POPULAR ITEMS */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="font-headline text-xl font-extrabold tracking-tight">Popular Items</h4>
            <button onClick={() => navigate("/vendor/upload-product")} className="text-[#ff9300] text-xs font-bold uppercase tracking-wider">Manage</button>
          </div>
          <div className="space-y-3">
            {analytics?.top_products?.map((product, index) => (
              <div key={index} className="group rounded-[2rem] bg-white p-3.5 flex items-center gap-4 border border-slate-100 shadow-sm transition-all active:scale-[0.98]">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100">
                  <img src={productsQuery.data?.find((item) => item.name === product.name)?.image_url || productsQuery.data?.find((item) => item.name === product.name)?.image_urls?.[0] || "/favicon.svg"} className="w-full h-full object-cover opacity-80" alt="product" />
                </div>
                <div className="flex-grow">
                  <h5 className="font-bold text-slate-900 text-sm">{product.name}</h5>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{product.units_sold} units sold</p>
                </div>
                <div className="text-right pr-2">
                  <p className="font-black text-slate-900 text-sm">{formatMoney(product.revenue)}</p>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${index === 0 ? "bg-[#ff9300] text-white" : "bg-slate-100 text-slate-400"}`}>
                    TOP {index + 1}
                  </span>
                </div>
              </div>
            )) || <p className="text-center text-slate-400 text-sm py-4">No data yet.</p>}
          </div>
        </section>

        {/* INVENTORY HEALTH BENTO */}
        <section className="space-y-4">
          <h4 className="font-headline text-xl font-extrabold tracking-tight px-1">Inventory Health</h4>
          <div className="grid grid-cols-2 gap-3">
            <HealthBox label="Live" value={inventoryStats.availableProducts} color="text-emerald-500" />
            <HealthBox label="Low Stock" value={analytics?.low_stock_count ?? inventoryStats.lowStockProducts} color="text-amber-500" />
            <HealthBox label="Out" value={inventoryStats.outOfStockProducts} color="text-red-500" />
            <HealthBox label="Total SKU" value={inventoryStats.totalProducts} />
          </div>
        </section>

        {/* MARKETING CTA */}
        <section className="relative overflow-hidden bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
           <div className="relative z-10 space-y-3">
              <span className="text-[#ff9300] text-[10px] font-black uppercase tracking-[0.2em]">Marketing</span>
              <h5 className="text-2xl font-black font-headline leading-tight">Boost your reach.</h5>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">Run seasonal discounts or highlight your best sellers to South African foodies.</p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  promoMutation.mutate({
                    ...promoForm,
                    product_id: promoForm.product_id ? Number(promoForm.product_id) : null,
                    discount_percent: promoForm.discount_percent ? Number(promoForm.discount_percent) : null,
                  });
                }}
                className="space-y-3 pt-2"
              >
                <select
                  value={promoForm.promo_type}
                  onChange={(event) => setPromoForm((current) => ({ ...current, promo_type: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="seasonal_discount">Seasonal Discount</option>
                  <option value="best_seller">Highlight Best Seller</option>
                </select>
                <select
                  value={promoForm.product_id}
                  onChange={(event) => setPromoForm((current) => ({ ...current, product_id: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="">Choose Product</option>
                  {(productsQuery.data ?? []).map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
                <input
                  value={promoForm.title}
                  onChange={(event) => setPromoForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Campaign title"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                />
                <textarea
                  rows={3}
                  value={promoForm.description}
                  onChange={(event) => setPromoForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="What should foodies know about this promo?"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                />
                <input
                  value={promoForm.discount_percent}
                  onChange={(event) => setPromoForm((current) => ({ ...current, discount_percent: event.target.value }))}
                  placeholder="Discount % (optional)"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-black uppercase tracking-widest text-white">
                  {promoMutation.isPending ? "Submitting..." : "Configure Promos"}
                </button>
                {promoMessage ? <p className="text-sm font-bold text-slate-600">{promoMessage}</p> : null}
              </form>
           </div>
           <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-slate-50 text-[120px] select-none">campaign</span>
        </section>

        <section className="rounded-[2rem] bg-white p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-headline text-xl font-extrabold tracking-tight">Promo Status</h4>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Admin approval required</span>
          </div>
          <div className="mt-5 space-y-3">
            {promotions.length ? promotions.map((promo) => (
              <div key={promo.id} className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{promo.title}</p>
                    <p className="text-xs text-slate-500">{promo.product_name || "All products"} • {promo.promo_type.replaceAll("_", " ")}</p>
                  </div>
                  <span className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-wider ${
                    promo.status === "approved" ? "bg-emerald-100 text-emerald-700" : promo.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {promo.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{promo.description}</p>
                {promo.admin_note ? <p className="mt-2 text-xs font-bold text-slate-500">Admin note: {promo.admin_note}</p> : null}
              </div>
            )) : <p className="text-sm text-slate-500">No promotions submitted yet.</p>}
          </div>
        </section>
      </main>

      {/* MOBILE NAV */}
      <nav className="fixed bottom-0 z-50 flex w-full items-center justify-around rounded-t-[2.5rem] bg-white/90 px-4 pb-8 pt-2 shadow-[0_-8px_32px_rgba(0,0,0,0.05)] backdrop-blur-2xl border-t border-slate-50">
        <NavButton icon="storefront" label="Shop" onClick={() => navigate("/vendor/dashboard")} />
        <NavButton icon="shopping_bag" label="Orders" onClick={() => navigate("/vendor/orders")} />
        <button onClick={() => navigate("/vendor/upload-product")} className="scale-110 -translate-y-4 rounded-full border-4 border-[#fcfcfc] bg-slate-900 p-3 text-white shadow-xl transition-all active:scale-90">
          <span className="material-symbols-outlined text-[28px]" style={materialIconFill}>add_circle</span>
        </button>
        <NavButton icon="analytics" label="Insights" active />
        <NavButton icon="person" label="Profile" onClick={() => navigate("/vendor/profile")} />
      </nav>
    </div>
  );
};

const HealthBox = ({ label, value, color = "text-slate-900" }) => (
  <div className="rounded-[1.5rem] bg-white p-5 border border-slate-100 shadow-sm">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 ${active ? "text-[#ff9300]" : "text-slate-300"}`}>
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
    <span className="mt-1 text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);
