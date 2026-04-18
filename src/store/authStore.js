import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      accountType: null,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setSession: (accessToken, user, accountType = "user") =>
        set({ token: accessToken, user, accountType }),
      clearSession: () => set({ token: null, user: null, accountType: null }),
      setProfile: (user) => set((state) => ({ user: { ...state.user, ...user } })),
    }),
    {
      name: "quickdrop-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
