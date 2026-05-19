// VendorDashboard.jsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { fetchProducts } from "../api/products";
import { fetchVendorAnalytics, fetchVendorOrders, fetchVendorProfile } from "../api/vendorPortal";
import { QuickDropLogo } from "../components/branding/QuickDropLogo";
import { formatMoney } from "../lib/utils";
import { getInventoryStats, getOrderMetrics, getPopularProducts } from "../lib/vendorPortal";

export const VendorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const profileQuery = useQuery({ queryKey: ["vendor-profile"], queryFn: fetchVendorProfile });
  const analyticsQuery = useQuery({ queryKey: ["vendor-analytics"], queryFn: fetchVendorAnalytics });
  const ordersQuery = useQuery({ queryKey: ["vendor-orders-preview"], queryFn: fetchVendorOrders });
  const productsQuery = useQuery({
    queryKey: ["vendor-products-dashboard", profileQuery.data?.id],
    queryFn: () => fetchProducts({ vendor_id: profileQuery.data.id, include_unavailable: true }),
    enabled: Boolean(profileQuery.data?.id),
  });

  const vendor = profileQuery.data;
  const analytics = analyticsQuery.data;
  const orders = ordersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const orderMetrics = useMemo(() => getOrderMetrics(orders), [orders]);
  const inventoryStats = useMemo(() => getInventoryStats(products), [products]);
  const popularProducts = useMemo(() => getPopularProducts(orders).slice(0, 3), [orders]);

  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  if (profileQuery.isLoading || analyticsQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-100 border-t-[#ff9300]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-32 font-body antialiased text-slate-900 overflow-x-hidden">
      {/* Mobile-First Sticky App Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-white px-4 border-b border-slate-100 max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <QuickDropLogo size={32} showWordmark labelClassName="font-headline text-lg font-black text-slate-900" />
        </div>
        <div className="h-9 w-9 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <img
            alt="Vendor Profile"
            src={vendor?.logo_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCfkB6cjWDXmZMSFKo0Zulkq3Ztp0U3KQntRZ_3-11cpX1vGFwTMCraj72aKbnHKPJQobLtqQffUqhFVpny2_I4mqm5sym2U7Da55rmkZ5bW5MT-ZrS9VaeWvfXoUZt2GaR3QC3kadzF8Rxtu5XHcjZOfGU53jsVVcjURHiO6U3looOC1xv52QDs59UIKtGwAvvpAs7NXwNhbL_L9X4lgndA8mtZgWzB893O64lkuacVcdjhQ20wlFgXgDnOsBor0wM5BdlE0unYBAh"}
            className="h-full w-full object-cover"
          />
        </div>
      </header>

      {/* Main Responsive Body Canvas */}
      <main className="mx-auto max-w-md px-4 pt-4 space-y-6">
        <section className="space-y-1.5">
          <p className="font-label text-[9px] font-black uppercase tracking-widest text-[#ff9300]">
            Vendor Operations
          </p>
          <h1 className="font-headline text-2xl font-black leading-tight tracking-tight text-slate-900">
            Welcome back, <span className="text-[#ff9300]">{vendor?.name?.split(" ")[0] || "Vendor"}</span>
          </h1>
          <p className="text-xs font-bold text-slate-400 leading-relaxed">
            Daily revenue is <span className="text-slate-800">{formatMoney(orderMetrics.dailyRevenue)}</span> with <span className="text-slate-800">{orderMetrics.pending}</span> incoming orders.
          </p>
        </section>

        {/* Dynamic Mobile-First Segmented Pill Toggles */}
        <nav className="no-scrollbar flex gap-1.5 overflow-x-auto bg-slate-200/50 p-1 rounded-xl">
          {["Overview", "Orders", "Inventory"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`flex-1 text-center whitespace-nowrap rounded-lg py-2 text-xs font-black uppercase tracking-wider transition-all ${
                activeTab === tab.toLowerCase() ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 active:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Tab Target Routing Views */}
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Stacked Layout Structure Configured for Grid Scaling */}
              <section className="grid grid-cols-1 gap-3">
                <MetricCard
                  label="Daily Revenue"
                  value={formatMoney(orderMetrics.dailyRevenue)}
                  icon="payments"
                  tone="orange"
                />
                <div className="grid grid-cols-3 gap-2">
                  <MiniMetric label="Ready" value={orderMetrics.completed} icon="task_alt" />
                  <MiniMetric label="Pending" value={orderMetrics.pending} icon="hourglass_top" />
                  <MiniMetric label="Stock" value={inventoryStats.availableProducts} icon="inventory_2" />
                </div>
              </section>

              {/* Aggregated Dark Insight Segment Panel */}
              <section className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-5 text-white shadow-md">
                <div className="relative z-10 space-y-3.5">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-2xl text-[#ff9300]" style={materialIconFill}>
                      insights
                    </span>
                    <h3 className="font-headline text-sm font-black uppercase tracking-wider text-slate-200">Orders Summary</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <SummaryPill label="Incoming" value={orderMetrics.pending} />
                    <SummaryPill label="Active" value={orderMetrics.active} />
                    <SummaryPill label="Completed" value={orderMetrics.completed} />
                  </div>
                </div>
                <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-[#ff9300]/10 blur-2xl"></div>
              </section>

              {/* Popular Products Context List Stream */}
              <section className="space-y-5">
                <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                    <h3 className="font-headline text-sm font-black uppercase tracking-wide text-slate-800">Popular Items</h3>
                    <button onClick={() => navigate("/vendor/analytics")} className="text-[10px] font-black uppercase tracking-widest text-[#ff9300]">
                      Insights
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {popularProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between rounded-xl bg-slate-50/60 px-3 py-2.5">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-black text-slate-900 truncate">{product.name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{product.units} items sold</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-black text-slate-900">{formatMoney(product.revenue)}</p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#ff9300]">#{index + 1}</p>
                        </div>
                      </div>
                    ))}
                    {!popularProducts.length && (
                      <div className="py-6 text-center text-xs font-bold text-slate-400">
                        Popular items will appear once orders stack up.
                      </div>
                    )}
                  </div>
                </div>

                {/* Vertical Alerts Block Monitor Section */}
                <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm space-y-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">System Monitoring</p>
                    <h3 className="mt-0.5 font-headline text-sm font-black uppercase tracking-wide text-slate-800">Store Watchlist</h3>
                  </div>
                  <AlertRow
                    icon="warning"
                    title="Low stock alerts"
                    description={`${analytics?.low_stock_count ?? inventoryStats.lowStockProducts} items need restocking soon.`}
                  />
                  <AlertRow
                    icon="inventory"
                    title="Out of stock list"
                    description={`${inventoryStats.outOfStockProducts} products hidden from public view.`}
                  />
                </div>
              </section>
            </div>
          )}

          {/* Combined Secondary Segment Content Iterations */}
          {(activeTab === "orders" || activeTab === "inventory") && (
            <div className="space-y-2">
              {(activeTab === "orders" ? orders : products).map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                    <img
                      alt={item.name || "item"}
                      src={item.image_url || item.image_urls?.[0] || "/favicon.svg"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate font-headline text-xs font-black text-slate-900">
                      {activeTab === "inventory" ? item.name : item.customer?.full_name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 truncate">
                      {activeTab === "inventory"
                        ? `${item.category} • ${item.stock_quantity ?? 0} units left`
                        : item.order_reference}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-black text-[#ff9300]">
                        {formatMoney(activeTab === "inventory" ? item.price : item.total_amount)}
                      </span>
                      {activeTab === "inventory" && (
                        <span className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${(item.stock_quantity ?? 0) <= 0 ? "bg-red-50 text-red-600" : item.is_available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {(item.stock_quantity ?? 0) <= 0 ? "Out" : item.is_available ? "Live" : "Hidden"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(activeTab === "inventory" ? "/vendor/upload-product" : "/vendor/orders")}
                    className="rounded-xl bg-slate-900 p-2 text-white flex-shrink-0 active:scale-90 transition-transform"
                  >
                    <span className="material-symbols-outlined text-base">
                      {activeTab === "inventory" ? "edit" : "local_shipping"}
                    </span>
                  </button>
                </div>
              ))}
              {((activeTab === "orders" && !orders.length) || (activeTab === "inventory" && !products.length)) && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-xs font-bold text-slate-400 bg-white">
                  No execution records for {activeTab} discovered.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Global Framework App Navigation Footer Dock */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center px-4 bg-white/95 backdrop-blur-xl z-50 border-t border-slate-100 shadow-[0_-8px_30px_rgb(0,0,0,0.02)] max-w-md mx-auto rounded-t-2xl">
        <NavButton icon="storefront" label="Shop" onClick={() => navigate("/vendor/dashboard")} active />
        <NavButton icon="shopping_bag" label="Orders" onClick={() => navigate("/vendor/orders")} />

        <button
          onClick={() => navigate("/vendor/upload-product")}
          className="-translate-y-4 rounded-full border-4 border-white bg-slate-900 p-3 text-white shadow-lg transition-transform active:scale-90"
        >
          <span className="material-symbols-outlined text-xl block" style={materialIconFill}>add</span>
        </button>

        <NavButton icon="analytics" label="Insights" onClick={() => navigate("/vendor/analytics")} />
        <NavButton icon="person" label="Profile" onClick={() => navigate("/vendor/profile")} />
      </nav>
    </div>
  );
};

const MetricCard = ({ label, value, icon, tone }) => (
  <div className={`flex items-center gap-3.5 rounded-2xl border p-4 shadow-sm ${tone === "orange" ? "border-orange-100 bg-orange-50" : "border-slate-100 bg-white"}`}>
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${tone === "orange" ? "bg-white text-[#ff9300]" : "bg-slate-100 text-slate-600"}`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="font-label text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="font-headline text-lg font-black text-slate-900 truncate mt-0.5">{value}</p>
    </div>
  </div>
);

const MiniMetric = ({ label, value, icon }) => (
  <div className="bg-white p-3 rounded-2xl border border-slate-100 text-center shadow-sm">
    <span className="material-symbols-outlined text-slate-400 text-base block mb-1">{icon}</span>
    <p className="text-xs font-black text-slate-900">{value}</p>
    <p className="text-[8px] font-black uppercase tracking-wider text-slate-400 mt-0.5">{label}</p>
  </div>
);

const SummaryPill = ({ label, value }) => (
  <div className="rounded-xl bg-white/10 p-2.5">
    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-0.5 text-base font-black text-white">{value}</p>
  </div>
);

const AlertRow = ({ icon, title, description }) => (
  <div className="rounded-xl border border-slate-50 bg-slate-50/50 p-2.5">
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-600 border border-slate-100/50 flex-shrink-0">
        <span className="material-symbols-outlined text-sm">{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-black text-slate-800 leading-tight">{title}</p>
        <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{description}</p>
      </div>
    </div>
  </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center rounded-xl w-12 h-12 transition-all duration-200 ${
      active ? "text-[#ff9300]" : "text-slate-400 active:text-slate-900"
    }`}
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
    <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">{label}</span>
  </button>
);