import { formatMoney, groupBy } from "../../lib/utils";

export const CartGroups = ({ items, onQuantityChange }) => {
  const grouped = groupBy(items, "vendorId");

  return (
    <div className="space-y-5">
      {Object.values(grouped).map((group) => {
        const vendorName = group[0].vendorName;
        const vendorSubtotal = group.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

        return (
          <div key={vendorName} className="rounded-[1.8rem] bg-white/[0.05] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xl font-semibold text-white">{vendorName}</p>
                <p className="text-sm text-base-300">{group.length} items</p>
              </div>
              <p className="text-lg font-bold text-white">{formatMoney(vendorSubtotal)}</p>
            </div>
            <div className="mt-5 space-y-4">
              {group.map((item) => (
                <div key={item.lineKey} className="flex items-center justify-between gap-4 rounded-2xl bg-base-950/50 p-4">
                  <div>
                    <p className="font-medium text-white">{item.productName}</p>
                    <p className="mt-1 text-sm text-base-300">{formatMoney(item.unitPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.lineKey, item.quantity - 1)}
                      className="rounded-xl bg-white/10 px-3 py-2 text-white"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => onQuantityChange(item.lineKey, item.quantity + 1)}
                      className="rounded-xl bg-white/10 px-3 py-2 text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
