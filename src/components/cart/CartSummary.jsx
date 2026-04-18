import { Link } from "react-router-dom";

import { formatMoney, groupBy } from "../../lib/utils";

export const CartSummary = ({ items }) => {
  const grouped = Object.values(groupBy(items, "vendorId"));
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const estimatedDelivery = grouped.length * 1500;
  const total = subtotal + estimatedDelivery;

  return (
    <div className="rounded-[1.8rem] bg-white/[0.05] p-5">
      <p className="text-xl font-semibold text-white">Checkout snapshot</p>
      <div className="mt-5 space-y-3 text-sm text-base-300">
        <div className="flex items-center justify-between">
          <span>Vendor groups</span>
          <span>{grouped.length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Items subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Estimated delivery</span>
          <span>{formatMoney(estimatedDelivery)}</span>
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-base-950/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-base-300">Global total</span>
          <span className="text-2xl font-bold text-white">{formatMoney(total)}</span>
        </div>
      </div>
      <Link
        to="/checkout"
        className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-accent-orange to-accent-coral px-5 py-4 font-semibold text-base-950"
      >
        Continue to checkout
      </Link>
    </div>
  );
};
