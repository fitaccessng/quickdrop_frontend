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
    <div className="min-h-screen bg-white pt-20 font-body antialiased text-slate-900">
      <header className="fixed top-0 z-50 flex w-full items-center justify-between bg-white px-6 py-4">
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

      <main className="mx-auto max-w-5xl px-6 pb-32 space-y-8">
        <section className="mb-8">
          <p className="font-label text-xs font-bold uppercase tracking-widest text-[#ff9300] mb-1">
            Vendor Portal
          </p>
          <h2 className="font-headline text-3xl font-extrabold tracking-tighter text-slate-900">
            Orders Management
          </h2>
          <p className="mt-2 text-sm text-slate-500">Incoming orders, active fulfillment, and history stay in one operational workflow.</p>
        </section>

        <nav className="mb-8 flex rounded-2xl bg-slate-100 p-1">
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

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-xl py-3 text-sm font-bold transition-all ${
                  activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </nav>

        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50">
              <div className="relative z-10 mb-4 flex justify-between items-start">
                <div>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#ff9300]">
                    {order.status.replaceAll("_", " ")}
                  </span>
                  <h3 className="text-lg font-bold">{order.order_reference}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(order.created_at).toLocaleString("en-ZA", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-slate-900">{formatMoney(order.total_amount)}</p>
                  <p className="text-xs text-slate-400">ID: #{order.id.toString().slice(-4)}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-slate-50">
                      <img
                        alt={order.customer.full_name}
                        src={order.customer.avatar_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuCNsOyY7C8NhorlMRxXsRz1qxLWgqRD77IctmsvhwgJjHx5lIdwAvrxJ9xkzZ5bkf1Q-0Xt_eqlKQ1gnm4b9sPDom45w3oBEep0LYhtBLmiiXDyDBpAHyDTuO4A8KwyOJlsGf4AYWl2PCyotzTGnxn26JW9exRmMlCFFwQlKHXAJ8AC541PC--0-o-wY5K2eBummRKn06PjbJClzWPm07LmUR_92x4Ej6N_fUDUwXGAMwIlm-PMLYRes1kIJ1iiG17LgB4U_ZdT_Q_5"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{order.customer.full_name}</p>
                      <p className="text-sm text-slate-500">{order.customer.phone || order.customer.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-500">
                    <DetailPill label="Customer info" value={order.customer.email} />
                    <DetailPill label="Payment" value={order.payment_status} />
                    <DetailPill label="Delivery city" value={`${order.address.city}, ${order.address.state}`} />
                    <DetailPill label="Rider assigned" value={order.status === "rider_assigned" || order.status === "on_the_way" ? "Assigned" : "Pending"} />
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Order details</p>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm font-medium">
                        <span className="text-slate-700">{item.quantity}x {item.product_name}</span>
                        <span className="text-slate-400">{formatMoney(item.total_price)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-xs font-medium text-slate-500">
                    Delivery to {order.address.line1}. Customer label: {order.address.label}.
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex flex-wrap gap-2">
                {order.status === "pending" && (
                  <>
                    <button
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ orderId: order.id, status: "confirmed" })}
                      className="flex-1 rounded-full bg-[#ff9300] py-4 font-bold text-white shadow-lg shadow-orange-200 transition-all active:scale-95 disabled:opacity-70"
                    >
                      {updateMutation.isPending ? "Processing..." : "Accept Order"}
                    </button>
                    <button
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ orderId: order.id, status: "cancelled", tracking_note: "Rejected by vendor" })}
                      className="flex-1 rounded-full bg-slate-100 py-4 font-bold text-slate-700 transition-all active:scale-95 disabled:opacity-70"
                    >
                      Reject
                    </button>
                  </>
                )}

                {order.status !== "pending" && !["delivered", "cancelled"].includes(order.status) && (
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { status: "preparing", label: "Preparing" },
                      { status: "rider_assigned", label: "Ready For Rider" },
                      { status: "delivered", label: "Completed" },
                    ].map((action) => (
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
                        className={`rounded-xl py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                          order.status === action.status ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {order.tracking_note && (
                  <div className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
                    Tracking note: {order.tracking_note}
                  </div>
                )}

                {order.rider && (
                  <div className="w-full rounded-2xl bg-orange-50 px-4 py-3 text-xs font-medium text-slate-700">
                    Rider assigned: {order.rider.full_name} {order.rider.phone ? `• ${order.rider.phone}` : ""}
                  </div>
                )}
              </div>
            </div>
          ))}

          {!filteredOrders.length && !ordersQuery.isLoading && (
            <div className="py-16 text-center">
              <span className="material-symbols-outlined text-slate-200 text-5xl mb-4">inventory_2</span>
              <p className="text-slate-400 text-sm">No orders in this category.</p>
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

const DetailPill = ({ label, value }) => (
  <div className="rounded-2xl bg-white px-3 py-3">
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-2 truncate text-xs font-bold text-slate-700">{value}</p>
  </div>
);

const NavButton = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-2 transition-opacity active:opacity-60 ${
      active ? "text-[#ff9300]" : "text-slate-400"
    }`}
  >
    <span className="material-symbols-outlined text-[24px]">{icon}</span>
    <span className="mt-1 font-body text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);
