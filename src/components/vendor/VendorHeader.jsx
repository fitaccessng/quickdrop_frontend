import { MapPin, Star, Timer } from "lucide-react";

import { formatMoney } from "../../lib/utils";

export const VendorHeader = ({ vendor }) => (
  <div className="overflow-hidden rounded-[2rem] bg-white/[0.05]">
    <div className="h-64 bg-gradient-to-br from-base-700 to-base-800">
      {vendor.cover_image_url ? (
        <img src={vendor.cover_image_url} alt={vendor.name} className="h-full w-full object-cover" />
      ) : null}
    </div>
    <div className="space-y-5 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-base-300">{vendor.category}</p>
          <h1 className="mt-3 text-3xl font-bold text-white">{vendor.name}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-base-300">{vendor.description}</p>
        </div>
        <div className="rounded-[1.5rem] bg-base-900/70 p-4">
          <p className="text-sm text-base-300">Minimum order</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatMoney(vendor.minimum_order_amount)}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 text-sm text-base-200">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
          <Star size={14} className="text-accent-gold" /> {vendor.rating.toFixed(1)} ({vendor.review_count} reviews)
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
          <Timer size={14} className="text-accent-lime" /> {vendor.prep_time_minutes} min prep
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
          <MapPin size={14} className="text-base-400" /> {vendor.city}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
          Delivery fee {formatMoney(vendor.delivery_fee)}
        </span>
      </div>
    </div>
  </div>
);
