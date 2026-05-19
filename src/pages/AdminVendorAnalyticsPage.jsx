import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { fetchAdminVendorAnalytics, updateAdminProductReview, updateAdminPromotionStatus } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { formatMoney } from "../lib/utils";

export const AdminVendorAnalyticsPage = () => {
  const { vendorId } = useParams();
  const queryClient = useQueryClient();
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewDraft, setReviewDraft] = useState({ rating: "", comment: "" });
  const analyticsQuery = useQuery({
    queryKey: ["admin-vendor-analytics", vendorId],
    queryFn: () => fetchAdminVendorAnalytics(vendorId),
    enabled: Boolean(vendorId),
  });
  const analytics = analyticsQuery.data;

  const reviewMutation = useMutation({
    mutationFn: updateAdminProductReview,
    onSuccess: () => {
      setEditingReviewId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-vendor-analytics", vendorId] });
    },
  });

  const promotionMutation = useMutation({
    mutationFn: updateAdminPromotionStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendor-analytics", vendorId] });
    },
  });

  return (
    <AdminShell title="Vendor Analytics" subtitle="Onboarding details, sales performance, and operational response metrics for one vendor.">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Orders" value={analytics?.total_orders ?? 0} />
        <MetricCard label="Completed" value={analytics?.completed_orders ?? 0} />
        <MetricCard label="Active" value={analytics?.active_orders ?? 0} />
        <MetricCard label="Revenue" value={formatMoney(analytics?.total_revenue ?? 0)} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            {analytics?.logo_url ? <img src={analytics.logo_url} alt={analytics.vendor_name || "Vendor"} className="h-16 w-16 rounded-2xl object-cover" /> : null}
            <div className="min-w-0">
              <h3 className="text-xl font-extrabold text-slate-900">{analytics?.vendor_name || "Vendor"}</h3>
              <p className="mt-2 text-sm text-slate-500">{analytics?.vendor_email} • {analytics?.vendor_phone || "No phone"}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                {analytics?.is_approved ? "Approved storefront" : "Pending approval"} • {analytics?.is_onboarded ? "Onboarded" : "Not onboarded"}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <InfoRow label="Slug" value={analytics?.vendor_slug} />
            <InfoRow label="Logo URL" value={analytics?.logo_url} />
            <InfoRow label="Cover Image URL" value={analytics?.cover_image_url} />
            <InfoRow label="Category" value={analytics?.category} />
            <InfoRow label="City" value={analytics?.city} />
            <InfoRow label="Street" value={analytics?.street} />
            <InfoRow label="PO Box" value={analytics?.po_box} />
            <InfoRow label="Support Email" value={analytics?.support_email} />
            <InfoRow label="Support Phone" value={analytics?.support_phone} />
            <InfoRow label="Business Reg." value={analytics?.business_registration_number} />
            <InfoRow label="VAT Number" value={analytics?.vat_number} />
            <InfoRow label="Tax Number" value={analytics?.tin} />
            <InfoRow label="SA ID" value={analytics?.south_african_id_number} />
            <InfoRow label="Bank" value={analytics?.bank_name} />
            <InfoRow label="Account Name" value={analytics?.bank_account_name} />
            <InfoRow label="Account Number" value={analytics?.bank_account_number} />
            <InfoRow label="Minimum Order" value={formatMoney(analytics?.minimum_order_amount ?? 0)} />
            <InfoRow label="Delivery Fee" value={formatMoney(analytics?.delivery_fee ?? 0)} />
            <InfoRow label="Prep Time" value={`${analytics?.prep_time_minutes ?? 0} mins`} />
            <InfoRow label="Delivery Radius" value={`${analytics?.delivery_radius_km ?? 0} km`} />
            <InfoRow label="Auto Accept Orders" value={analytics?.auto_accept_orders ? "Enabled" : "Disabled"} />
            <InfoRow label="Notifications" value={analytics?.notifications_enabled ? "Enabled" : "Disabled"} />
            <InfoRow label="Rating" value={analytics?.rating != null ? `${analytics.rating} / 5` : null} />
            <InfoRow label="Review Count" value={analytics?.review_count} />
            <InfoRow label="Latitude" value={analytics?.latitude} />
            <InfoRow label="Longitude" value={analytics?.longitude} />
            <InfoRow label="Permit URL" value={analytics?.permit_url} />
            <InfoRow label="Created" value={analytics?.created_at ? new Date(analytics.created_at).toLocaleString() : null} />
          </div>
          <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Description</p>
            <p className="mt-2 text-sm text-slate-700">{analytics?.description || "No description provided."}</p>
          </div>
          <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Opening Hours</p>
            <pre className="mt-2 whitespace-pre-wrap break-words text-xs font-medium text-slate-700">{analytics?.opening_hours ? JSON.stringify(analytics.opening_hours, null, 2) : "Not provided"}</pre>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-extrabold text-slate-900">Response & Sales Health</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <MetricCard label="Avg Response" value={`${analytics?.average_vendor_response_minutes ?? 0} min`} compact />
            <MetricCard label="Fastest" value={analytics?.fastest_vendor_response_minutes != null ? `${analytics.fastest_vendor_response_minutes} min` : "N/A"} compact />
            <MetricCard label="Slowest" value={analytics?.slowest_vendor_response_minutes != null ? `${analytics.slowest_vendor_response_minutes} min` : "N/A"} compact />
            <MetricCard label="AOV" value={formatMoney(analytics?.average_order_value ?? 0)} compact />
            <MetricCard label="Pending" value={analytics?.pending_orders ?? 0} compact />
            <MetricCard label="Cancelled" value={analytics?.cancelled_orders ?? 0} compact />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900">Top Products</h3>
        <div className="mt-5 space-y-3">
          {(analytics?.top_products ?? []).map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-[1.5rem] bg-slate-50 px-4 py-4">
              <div>
                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.units} units sold</p>
              </div>
              <p className="text-sm font-black text-slate-900">{formatMoney(item.revenue)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900">Uploaded Products</h3>
        <div className="mt-5 space-y-3">
          {(analytics?.uploaded_products ?? []).map((product) => (
            <div key={product.id} className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-slate-50 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-200">
                  {product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : null}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.category} • {product.stock_quantity} in stock • {product.is_available ? "Live" : "Hidden"}
                  </p>
                </div>
              </div>
              <p className="text-sm font-black text-slate-900">{formatMoney(product.price)}</p>
            </div>
          ))}
          {!analytics?.uploaded_products?.length ? <p className="text-sm text-slate-500">No products uploaded yet.</p> : null}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900">Promotion Requests</h3>
        <div className="mt-5 space-y-3">
          {(analytics?.promotions ?? []).map((promo) => (
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
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => promotionMutation.mutate({ promotionId: promo.id, status: "approved", admin_note: "Approved by admin" })}
                  className="rounded-full bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => promotionMutation.mutate({ promotionId: promo.id, status: "rejected", admin_note: "Please refine the campaign details and resubmit." })}
                  className="rounded-full bg-rose-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                >
                  Reject
                </button>
              </div>
              {promo.admin_note ? <p className="mt-2 text-xs font-bold text-slate-500">Admin note: {promo.admin_note}</p> : null}
            </div>
          ))}
          {!analytics?.promotions?.length ? <p className="text-sm text-slate-500">No promotion requests yet.</p> : null}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900">Product Reviews</h3>
        <div className="mt-5 space-y-3">
          {(analytics?.product_reviews ?? []).map((review) => {
            const isEditing = editingReviewId === review.id;
            return (
              <div key={review.id} className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{review.author_name}</p>
                    <p className="text-xs text-slate-500">{new Date(review.updated_at || review.created_at).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-orange-100 px-3 py-2 text-xs font-black text-orange-700">{review.rating}/5</span>
                </div>
                {isEditing ? (
                  <div className="mt-4 space-y-3">
                    <select
                      value={reviewDraft.rating}
                      onChange={(event) => setReviewDraft((current) => ({ ...current, rating: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                    >
                      {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} / 5</option>)}
                    </select>
                    <textarea
                      rows={3}
                      value={reviewDraft.comment}
                      onChange={(event) => setReviewDraft((current) => ({ ...current, comment: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => reviewMutation.mutate({ reviewId: review.id, rating: Number(reviewDraft.rating), comment: reviewDraft.comment })}
                        className="rounded-full bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                      >
                        Save Review
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="rounded-full bg-slate-200 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-3 text-sm text-slate-600">{review.comment}</p>
                    <button
                      onClick={() => {
                        setEditingReviewId(review.id);
                        setReviewDraft({ rating: String(review.rating), comment: review.comment });
                      }}
                      className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                    >
                      Edit Review
                    </button>
                  </>
                )}
              </div>
            );
          })}
          {!analytics?.product_reviews?.length ? <p className="text-sm text-slate-500">No product reviews yet.</p> : null}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-extrabold text-slate-900">Recent Orders</h3>
        <div className="mt-5 space-y-3">
          {(analytics?.recent_orders ?? []).map((order) => (
            <div key={order.id} className="rounded-[1.5rem] bg-slate-50 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{order.order_reference}</p>
                  <p className="text-xs text-slate-500">{order.customer_name} • {order.status}</p>
                </div>
                <p className="text-sm font-black text-slate-900">{formatMoney(order.total_amount)}</p>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {new Date(order.created_at).toLocaleString()} {order.tracking_note ? `• ${order.tracking_note}` : ""}
              </p>
            </div>
          ))}
          {!analytics?.recent_orders?.length ? <p className="text-sm text-slate-500">No orders yet.</p> : null}
        </div>
      </section>
    </AdminShell>
  );
};

const MetricCard = ({ label, value, compact = false }) => (
  <div className={`rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm ${compact ? "" : ""}`}>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-3 text-2xl font-extrabold text-slate-900">{value}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="rounded-[1.25rem] bg-slate-50 px-4 py-3">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-bold text-slate-900">{value || "Not provided"}</p>
  </div>
);
