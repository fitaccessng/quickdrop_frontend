import { create } from "zustand";

export const useUiStore = create((set) => ({
  homeFilters: { search: "", category: "All" },
  setHomeFilters: (partial) =>
    set((state) => ({ homeFilters: { ...state.homeFilters, ...partial } })),
}));
