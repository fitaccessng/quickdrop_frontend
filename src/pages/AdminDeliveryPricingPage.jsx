import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchAdminDeliverySettings, updateAdminDeliverySettings } from "../api/admin";
import { AdminShell } from "../components/admin/AdminShell";
import { formatMoney } from "../lib/utils";

export const AdminDeliveryPricingPage = () => {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["admin-delivery-settings"],
    queryFn: fetchAdminDeliverySettings,
  });
  const [form, setForm] = useState({
    base_fee: "0",
    fee_per_km: "0",
    free_distance_km: "0",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (settingsQuery.data) {
      setForm({
        base_fee: String(settingsQuery.data.base_fee ?? 0),
        fee_per_km: String(settingsQuery.data.fee_per_km ?? 0),
        free_distance_km: String(settingsQuery.data.free_distance_km ?? 0),
      });
    }
  }, [settingsQuery.data]);

  const mutation = useMutation({
    mutationFn: updateAdminDeliverySettings,
    onSuccess: () => {
      setMessage("Delivery pricing updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-settings"] });
    },
    onError: (error) => {
      setMessage(error.response?.data?.detail || "Unable to update delivery pricing.");
    },
  });

  const previewBase = Number(form.base_fee || 0);
  const previewPerKm = Number(form.fee_per_km || 0);
  const previewFreeDistance = Number(form.free_distance_km || 0);
  const sampleDistance = 8;
  const sampleBillableDistance = Math.max(sampleDistance - previewFreeDistance, 0);
  const sampleTotal = previewBase + sampleBillableDistance * previewPerKm;

  return (
    <AdminShell title="Delivery Pricing" subtitle="Control the base charge and per-kilometer delivery pricing used during checkout.">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">Pricing Settings</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("");
              mutation.mutate({
                base_fee: Number(form.base_fee),
                fee_per_km: Number(form.fee_per_km),
                free_distance_km: Number(form.free_distance_km),
              });
            }}
            className="mt-5 space-y-4"
          >
            <NumberField
              label="Base Delivery Fee"
              value={form.base_fee}
              onChange={(value) => setForm((current) => ({ ...current, base_fee: value }))}
            />
            <NumberField
              label="Fee Per Kilometer"
              value={form.fee_per_km}
              onChange={(value) => setForm((current) => ({ ...current, fee_per_km: value }))}
            />
            <NumberField
              label="Free Distance (KM)"
              value={form.free_distance_km}
              onChange={(value) => setForm((current) => ({ ...current, free_distance_km: value }))}
            />
            {message ? <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}
            <button disabled={mutation.isPending} className="rounded-2xl bg-slate-900 px-5 py-4 text-sm font-black uppercase tracking-widest text-white">
              {mutation.isPending ? "Saving..." : "Save Pricing"}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <PricingCard label="Base Fee" value={formatMoney(previewBase)} />
            <PricingCard label="Per KM" value={formatMoney(previewPerKm)} accent />
            <PricingCard label="Free KM" value={previewFreeDistance} />
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9300]">Calculation Preview</p>
            <div className="mt-4 rounded-[1.5rem] bg-slate-50 p-5">
              <p className="text-sm font-bold text-slate-700">Sample delivery distance: {sampleDistance} km</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base fee</span>
                  <span className="font-bold text-slate-900">{formatMoney(previewBase)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Billable distance</span>
                  <span className="font-bold text-slate-900">{sampleBillableDistance.toFixed(2)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distance fee</span>
                  <span className="font-bold text-slate-900">{formatMoney(sampleBillableDistance * previewPerKm)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3">
                  <span className="font-black uppercase tracking-widest text-[#ff9300]">Estimated total</span>
                  <span className="text-xl font-extrabold text-slate-900">{formatMoney(sampleTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

const NumberField = ({ label, value, onChange }) => (
  <label className="block space-y-2">
    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
    <input
      type="number"
      step="0.01"
      min="0"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
      required
    />
  </label>
);

const PricingCard = ({ label, value, accent }) => (
  <div className={`rounded-[1.75rem] border p-5 shadow-sm ${accent ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-3 text-3xl font-extrabold text-slate-900">{value}</p>
  </div>
);
