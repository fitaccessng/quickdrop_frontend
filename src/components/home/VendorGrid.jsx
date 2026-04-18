import { Star, Timer } from "lucide-react";
import { Link } from "react-router-dom";

import { formatMoney } from "../../lib/utils";
import { LoadingCard } from "../common/LoadingCard";

export const VendorGrid = ({ vendors, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <LoadingCard key={index} className="h-72" />
        ))}
      </div>
    );
  }

  if (!vendors.length) {
    return <div className="rounded-2xl bg-white/[0.05] p-8 text-base-300">No vendors match your current filters.</div>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {vendors.map((vendor) => (
        <Link key={vendor.id} to={`/vendor/${vendor.id}`} className="overflow-hidden rounded-[1.8rem] bg-white/[0.05]">
          <div className="h-48 bg-gradient-to-r from-base-800 to-base-700">
            {vendor.cover_image_url ? (
              <img src={vendor.cover_image_url} alt={vendor.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-semibold text-white">{vendor.name}</p>
                <p className="mt-1 text-sm text-base-300">{vendor.description}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-base-200">{vendor.category}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-base-200">
              <span className="inline-flex items-center gap-2 rounded-full bg-base-900/70 px-3 py-2">
                <Star size={14} className="text-accent-gold" />
                {vendor.rating.toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-base-900/70 px-3 py-2">
                <Timer size={14} className="text-accent-lime" />
                {vendor.prep_time_minutes} min
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-base-900/70 px-3 py-2">
                {formatMoney(vendor.delivery_fee)} delivery
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
