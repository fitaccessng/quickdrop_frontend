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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-100 border-t-[#ff9300]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 font-body antialiased text-slate-900">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <QuickDropLogo size={40} showWordmark labelClassName="font-headline text-2xl font-bold text-slate-900" />
        </div>
        <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
          <img
            alt="Vendor Profile"
            src={vendor?.logo_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCfkB6cjWDXmZMSFKo0Zulkq3Ztp0U3KQntRZ_3-11cpX1vGFwTMCraj72aKbnHKPJQobLtqQffUqhFVpny2_I4mqm5sym2U7Da55rmkZ5bW5MT-ZrS9VaeWvfXoUZt2GaR3QC3kadzF8Rxtu5XHcjZOfGU53jsVVcjURHiO6U3looOC1xv52QDs59UIKtGwAvvpAs7NXwNhbL_L9X4lgndA8mtZgWzB893O64lkuacVcdjhQ20wlFgXgDnOsBor0wM5BdlE0unYBAh"}
            className="h-full w-full object-cover"
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-32 space-y-8">
        <section className="space-y-2">
          <p className="font-label text-xs font-bold uppercase tracking-wide text-[#ff9300]">
            Vendor Operations
          </p>
          <h1 className="font-headline text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
            Welcome back, <br />
            {vendor?.name?.split(" ")[0] || "Vendor"}
          </h1>
          <p className="text-slate-500">
            Daily revenue is {formatMoney(orderMetrics.dailyRevenue)} and you currently have {orderMetrics.pending} incoming orders waiting.
          </p>
        </section>

        <nav className="no-scrollbar flex gap-2 overflow-x-auto py-2">
          {["Overview", "Orders", "Inventory"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`whitespace-nowrap rounded-full px-5 py-2 text-xs font-bold transition-all ${
                activeTab === tab.toLowerCase() ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <section className="grid grid-cols-2 gap-4">
                <MetricCard
                  label="Daily Revenue"
                  value={formatMoney(orderMetrics.dailyRevenue)}
                  icon="payments"
                  tone="orange"
                />
                <MetricCard
                  label="Completed Orders"
                  value={orderMetrics.completed}
                  icon="task_alt"
                />
                <MetricCard
                  label="Pending Orders"
                  value={orderMetrics.pending}
                  icon="hourglass_top"
                />
                <MetricCard
                  label="Available Products"
                  value={inventoryStats.availableProducts}
                  icon="inventory_2"
                />
              </section>

              <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white">
                <div className="relative z-10 space-y-4">
                  <span className="material-symbols-outlined text-4xl text-[#ff9300]" style={materialIconFill}>
                    insights
                  </span>
                  <h3 className="max-w-[240px] font-headline text-2xl font-bold">Orders Summary</h3>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <SummaryPill label="Incoming" value={orderMetrics.pending} />
                    <SummaryPill label="Active" value={orderMetrics.active} />
                    <SummaryPill label="Completed" value={orderMetrics.completed} />
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-[#ff9300]/10 blur-3xl"></div>
              </section>

              <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline text-xl font-extrabold tracking-tight">Popular Items</h3>
                    <button onClick={() => navigate("/vendor/analytics")} className="text-sm font-bold text-[#ff9300]">
                      Insights
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {popularProducts.map((product, index) => (
                      <div key={product.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{product.name}</p>
                          <p className="text-xs text-slate-400">{product.units} items sold</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{formatMoney(product.revenue)}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#ff9300]">#{index + 1}</p>
                        </div>
                      </div>
                    ))}
                    {!popularProducts.length && (
                      <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
                        Popular items will appear once orders start coming in.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 shadow-sm space-y-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Alerts</p>
                    <h3 className="mt-2 font-headline text-xl font-extrabold tracking-tight">Store Watchlist</h3>
                  </div>
                  <AlertRow
                    icon="warning"
                    title="Low stock"
                    description={`${analytics?.low_stock_count ?? inventoryStats.lowStockProducts} items need restocking soon.`}
                  />
                  <AlertRow
                    icon="inventory"
                    title="Out of stock"
                    description={`${inventoryStats.outOfStockProducts} products are hidden from your storefront.`}
                  />
                  <AlertRow
                    icon="support_agent"
                    title="Complaints"
                    description="No open customer complaints right now."
                  />
                </div>
              </section>
            </div>
          )}

          {(activeTab === "orders" || activeTab === "inventory") && (
            <div className="space-y-3">
              {(activeTab === "orders" ? orders : products).map((item) => (
                <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <img
                      alt={item.name || "item"}
                      src={item.image_url || `https://picsum.photos/seed/${item.id}/200`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="truncate font-headline text-sm font-bold text-slate-900">
                      {activeTab === "inventory" ? item.name : item.customer?.full_name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {activeTab === "inventory"
                        ? `${item.category} • ${item.stock_quantity ?? 0} in stock`
                        : item.order_reference}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-black text-[#ff9300]">
                        {formatMoney(activeTab === "inventory" ? item.price : item.total_amount)}
                      </span>
                      {activeTab === "inventory" && (
                        <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-widest ${(item.stock_quantity ?? 0) <= 0 ? "bg-red-100 text-red-600" : item.is_available ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {(item.stock_quantity ?? 0) <= 0 ? "Out" : item.is_available ? "Live" : "Hidden"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(activeTab === "inventory" ? "/vendor/upload-product" : "/vendor/orders")}
                    className="rounded-xl bg-slate-900 p-2.5 text-white transition-transform active:scale-90"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {activeTab === "inventory" ? "edit" : "local_shipping"}
                    </span>
                  </button>
                </div>
              ))}
              {((activeTab === "orders" && !orders.length) || (activeTab === "inventory" && !products.length)) && (
                <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
                  No {activeTab} found.
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-white/90 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-8px_32px_rgba(0,0,0,0.05)] flex justify-around items-center px-4 pb-8 pt-2">
        <NavButton icon="storefront" label="Shop" onClick={() => navigate("/vendor/dashboard")} />
        <NavButton icon="shopping_bag" label="Orders" onClick={() => navigate("/vendor/orders")} />

        <button
          onClick={() => navigate("/vendor/upload-product")}
          className="scale-110 -translate-y-4 rounded-full border-4 border-white bg-slate-900 p-4 text-white shadow-xl transition-all active:scale-90"
        >
          <span className="material-symbols-outlined" style={materialIconFill}>add</span>
        </button>

        <NavButton icon="analytics" label="Insights" onClick={() => navigate("/vendor/analytics")} />
        <NavButton icon="person" label="Profile" onClick={() => navigate("/vendor/profile")} />
      </nav>
    </div>
  );
};

const MetricCard = ({ label, value, icon, tone }) => (
  <div className={`space-y-4 rounded-2xl border p-5 shadow-sm ${tone === "orange" ? "border-orange-100 bg-orange-50" : "border-slate-100 bg-slate-50"}`}>
    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone === "orange" ? "bg-white text-[#ff9300]" : "bg-slate-200 text-slate-600"}`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
    </div>
    <div>
      <p className="font-label text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="font-headline text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

const SummaryPill = ({ label, value }) => (
  <div className="rounded-2xl bg-white/10 px-3 py-4">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
  </div>
);

const AlertRow = ({ icon, title, description }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-bold text-slate-900">{title}</p>
        <p className="text-xs font-medium text-slate-400">{description}</p>
      </div>
    </div>
  </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ease-out active:scale-90 ${
      active ? "text-[#ff9300]" : "text-slate-400 hover:text-slate-600"
    }`}
  >
    <span className="material-symbols-outlined text-[26px]">{icon}</span>
    <span className="mt-1 font-body text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);
