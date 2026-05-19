// VendorOrdersPage.jsx
import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { fetchVendorOrders, fetchVendorProfile, updateVendorOrder } from "../api/vendorPortal";
import { formatMoney } from "../lib/utils";

export const VendorOrdersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("incoming");

  const profileQuery = useQuery({ queryKey: ["vendor-profile"], queryFn: fetchVendorProfile });
  const ordersQuery = useQuery({ queryKey: ["vendor-orders"], queryFn: fetchVendorOrders });

  const updateMutation = useMutation({
    mutationFn: updateVendorOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-orders-preview"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-analytics"] });
    },
  });

  const orders = ordersQuery.data ?? [];
  const filteredOrders = useMemo(() => {
    if (activeTab === "incoming") return orders.filter((order) => order.status === "pending");
    if (activeTab === "active") {
      return orders.filter((order) =>
        ["confirmed", "preparing", "rider_assigned", "on_the_way"].includes(order.status),
      );
    }
    return orders.filter((order) => ["delivered", "cancelled"].includes(order.status));
  }, [activeTab, orders]);

  const materialIconFill = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" };

  return (
    <div className="min-h-screen bg-slate-50/50 pt-24 pb-36 md:pt-28 font-body antialiased text-slate-900">
      
      {/* Top Sticky Safe Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white/90 backdrop-blur-xl px-4 md:px-6 py-3 md:py-4 border-b border-slate-100">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
        </button>
        <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
          <img
            alt="Vendor Profile"
            src={profileQuery.data?.logo_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDt3oVfFpK37eociAJQHv_k4tqskwQNe5UUCZ5gxsev5nRQdbJwZXL0VkRZo0vR3fgO-OA2U3SNMA6fSy8uwaqQvNDAXjpQg9hfSdR-aBCsbz2AfeUOrF6Oy7IOo5hP1xcJki4ZFV8FlwrtFTGlQMrEXUaHk_sQeKIsKZSwo5UaxW4zSX2opzRD6Zqb-7cbaSD9OneV1jiv4tSD4ExwaBjDfhsnSK4FnaNhLns7sIky2-8Bck3dUTUGjP-xii49lv0UAO6P2oUQEXLr"}
            className="h-full w-full object-cover"
          />
        </div>
      </header>

      {/* Main Content Workspace Wrapper */}
      <main className="mx-auto max-w-5xl px-4 md:px-6 space-y-6 md:space-y-8">
        
        {/* Portal Branding Section */}
        <section>
          <p className="font-label text-[10px] md:text-xs font-bold uppercase tracking-widest text-[#ff9300] mb-0.5">
            Vendor Portal
          </p>
          <h2 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tighter text-slate-900">
            Orders Management
          </h2>
          <p className="mt-1 text-xs md:text-sm text-slate-500 max-w-xl">
            Incoming orders, active fulfillment, and history stay in one operational workflow.
          </p>
        </section>

        {/* Swipe Protected Tab Bar Controls */}
        <div className="w-full overflow-x-auto whitespace-nowrap rounded-2xl bg-slate-100 p-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="inline-flex w-full min-w-max sm:min-w-0">
            {[
              { id: "incoming", label: "Incoming" },
              { id: "active", label: "Active Orders" },
              { id: "history", label: "History" },
            ].map((tab) => {
              const count = orders.filter((order) => {
                if (tab.id === "incoming") return order.status === "pending";
                if (tab.id === "active") return ["confirmed", "preparing", "rider_assigned", "on_the_way"].includes(order.status);
                return ["delivered", "cancelled"].includes(order.status);
              }).length;

              const isTabActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] sm:min-w-0 rounded-xl px-4 py-2.5 md:py-3 text-xs md:text-sm font-bold transition-all text-center ${
                    isTabActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Filtered Request Stream Stack */}
        <div className="space-y-4 md:space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="group relative overflow-hidden rounded-3xl bg-white p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100">
              
              {/* Card Meta Row */}
              <div className="relative z-10 mb-4 flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <span className="mb-0.5 block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#ff9300] truncate">
                    {order.status.replaceAll("_", " ")}
                  </span>
                  <h3 className="text-base md:text-lg font-black text-slate-900 truncate">{order.order_reference}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {new Date(order.created_at).toLocaleString("en-ZA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base md:text-lg font-black text-slate-900">{formatMoney(order.total_amount)}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">ID: #{order.id.toString().slice(-4)}</p>
                </div>
              </div>

              {/* Collapsible Meta Block Grid */}
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-[1fr_1fr]">
                
                {/* Customer Framework Column Card */}
                <div className="rounded-2xl bg-slate-50/70 p-3 md:p-4 border border-slate-100/50">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
                      <img
                        alt={order.customer.full_name}
                        src={order.customer.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCNsOyY7C8NhorlMRxXsRz1qxLWgqRD77IctmsvhwgJjHx5lIdwAvrxJ9xkzZ5bkf1Q-0Xt_eqlKQ1gnm4b9sPDom45w3oBEep0LYhtBLmiiXDyDBpAHyDTuO4A8KwyOJlsGf4AYWl2PCyotzTGnxn26JW9exRmMlCFFwQlKHXAJ8AC541PC--0-o-wY5K2eBummRKn06PjbJClzWPm07LmUR_92x4Ej6N_fUDUwXGAMwIlm-PMLYRes1kIJ1iiG17LgB4U_ZdT_Q_5"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm md:text-base truncate">{order.customer.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{order.customer.phone || order.customer.email}</p>
                    </div>
                  </div>

                  {/* Matrix Telemetry Fields */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-500">
                    <DetailPill label="Customer info" value={order.customer.email} />
                    <DetailPill label="Payment" value={order.payment_status} />
                    <DetailPill label="Delivery city" value={`${order.address.city}, ${order.address.state}`} />
                    <DetailPill label="Rider assigned" value={order.status === "rider_assigned" || order.status === "on_the_way" ? "Assigned" : "Pending"} />
                  </div>
                </div>

                {/* Specific Order Manifest Column Card */}
                <div className="rounded-2xl bg-slate-50/70 p-3 md:p-4 border border-slate-100/50 flex flex-col justify-between">
                  <div>
                    <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">Order details</p>
                    <ul className="space-y-1.5 divide-y divide-slate-100/50">
                      {order.items.map((item) => (
                        <li key={item.id} className="flex justify-between text-xs md:text-sm font-medium pt-1.5 first:pt-0">
                          <span className="text-slate-700 pr-2 line-clamp-1">{item.quantity}x {item.product_name}</span>
                          <span className="text-slate-400 flex-shrink-0">{formatMoney(item.total_price)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 rounded-xl bg-white border border-slate-100 p-3 text-[11px] font-medium text-slate-500 leading-relaxed">
                    Delivery to {order.address.line1}. Customer label: {order.address.label}.
                  </div>
                </div>
              </div>

              {/* Action Trigger Buttons Container */}
              <div className="relative z-10 mt-4 md:mt-6 flex flex-col gap-2">
                {order.status === "pending" && (
                  <div className="flex gap-2 w-full">
                    <button
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ orderId: order.id, status: "confirmed" })}
                      className="flex-1 rounded-xl bg-[#ff9300] py-3 text-xs font-bold text-white shadow-md shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                      {updateMutation.isPending ? "Processing..." : "Accept Order"}
                    </button>
                    <button
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ orderId: order.id, status: "cancelled", tracking_note: "Rejected by vendor" })}
                      className="px-4 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-700 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {order.status !== "pending" && !["delivered", "cancelled"].includes(order.status) && (
                  <div className="grid grid-cols-3 gap-1.5 w-full">
                    {[
                      { status: "preparing", label: "Preparing" },
                      { status: "rider_assigned", label: "Ready" },
                      { status: "delivered", label: "Complete" },
                    ].map((action) => {
                      const isCurrentState = order.status === action.status;
                      return (
                        <button
                          key={action.status}
                          disabled={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({
                              orderId: order.id,
                              status: action.status,
                              tracking_note:
                                action.status === "rider_assigned"
                                  ? "Order is packed and waiting for rider pickup."
                                  : undefined,
                            })
                          }
                          className={`rounded-xl py-2.5 text-[10px] font-black uppercase tracking-wider transition-all truncate px-1 ${
                            isCurrentState ? "bg-slate-900 text-white shadow-sm" : "bg-slate-100 text-slate-500 active:bg-slate-200"
                          }`}
                        >
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Context Logs Overlays */}
                {order.tracking_note && (
                  <div className="w-full rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-[11px] font-medium text-slate-500">
                    <span className="font-bold text-slate-700">Note:</span> {order.tracking_note}
                  </div>
                )}

                {order.rider && (
                  <div className="w-full rounded-xl bg-orange-50/60 border border-orange-100/50 px-3 py-2.5 text-[11px] font-medium text-slate-700">
                    <span className="font-bold text-orange-800">Rider:</span> {order.rider.full_name} {order.rider.phone ? `• ${order.rider.phone}` : ""}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty Request Stack Interface */}
          {!filteredOrders.length && !ordersQuery.isLoading && (
            <div className="py-16 text-center bg-white rounded-3xl border border-slate-100">
              <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">inventory_2</span>
              <p className="text-slate-400 text-xs font-medium">No orders found in this category.</p>
            </div>
          )}
        </div>
      </main>

      {/* Global Bottom Navigation Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] flex justify-around items-center px-2 pb-5 pt-2 safe-bottom">
        <NavButton icon="storefront" label="Shop" onClick={() => navigate("/vendor/dashboard")} />
        <NavButton icon="shopping_bag" label="Orders" onClick={() => navigate("/vendor/orders")} active={true} />

        {/* Action Insertion Fab Pin */}
        <div className="relative w-12 h-12 flex justify-center items-center">
          <button
            onClick={() => navigate("/vendor/upload-product")}
            className="absolute -top-5 rounded-full border-4 border-white bg-slate-900 p-3 text-white shadow-lg transition-all active:scale-95"
          >
            <span className="material-symbols-outlined flex items-center justify-center text-xl" style={materialIconFill}>add</span>
          </button>
        </div>

        <NavButton icon="analytics" label="Insights" onClick={() => navigate("/vendor/analytics")} />
        <NavButton icon="person" label="Profile" onClick={() => navigate("/vendor/profile")} />
      </nav>
    </div>
  );
};

const DetailPill = ({ label, value }) => (
  <div className="rounded-xl bg-white border border-slate-100 p-2.5 min-w-0">
    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{label}</p>
    <p className="mt-0.5 truncate text-xs font-bold text-slate-700">{value}</p>
  </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-1 px-3 transition-opacity active:opacity-60 ${
      active ? "text-[#ff9300]" : "text-slate-400"
    }`}
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
    <span className="mt-0.5 font-body text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);