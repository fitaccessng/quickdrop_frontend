import { create } from "zustand";
import { persist } from "zustand/middleware";

const buildLineKey = (productId, vendorId) => `${vendorId}:${productId}`;

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      addItem: (product, vendor) =>
        set((state) => {
          const lineKey = buildLineKey(product.id, vendor.id);
          const existing = state.items.find((item) => item.lineKey === lineKey);

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.lineKey === lineKey ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                lineKey,
                productId: product.id,
                vendorId: vendor.id,
                productName: product.name,
                vendorName: vendor.name,
                vendorLogo: vendor.logo_url,
                quantity: 1,
                unitPrice: product.price,
              },
            ],
          };
        }),
      updateQuantity: (lineKey, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.lineKey === lineKey ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: (value) => set({ isCartOpen: value ?? !get().isCartOpen }),
    }),
    {
      name: "quickdrop-cart",
    },
  ),
);
