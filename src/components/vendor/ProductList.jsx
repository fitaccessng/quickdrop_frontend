import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { formatMoney } from "../../lib/utils";

export const ProductList = ({ products, vendor, onAddToCart, onProductClick }) => (
  <div className="grid gap-5 lg:grid-cols-2">
    {products.map((product, index) => (
      <motion.div
        key={product.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="rounded-[1.7rem] bg-white/[0.05] p-5"
      >
        <div
          className="flex cursor-pointer gap-4"
          onClick={() => onProductClick?.(product)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onProductClick?.(product);
            }
          }}
        >
          <div className="h-24 w-24 shrink-0 rounded-2xl bg-base-900/80">
            {product.image_url || product.image ? (
              <img
                src={product.image_url || product.image}
                alt={product.name}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : null}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{product.name}</p>
                <p className="mt-2 text-sm leading-6 text-base-300">{product.description}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-base-200">{product.category}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-white">{formatMoney(product.price)}</p>
                <p className="text-sm text-base-400">{product.prep_time_minutes ?? vendor.prep_time_minutes ?? 20} min prep</p>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddToCart(product, vendor);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-accent-orange to-accent-coral px-4 py-3 text-sm font-semibold text-base-950"
              >
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);
