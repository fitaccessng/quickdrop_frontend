import { create } from "zustand";

export const useUiStore = create((set) => ({
  homeFilters: { search: "", category: "All" },
  theme: localStorage.getItem("quickdrop-theme") || "light",
  setHomeFilters: (partial) =>
    set((state) => ({ homeFilters: { ...state.homeFilters, ...partial } })),
  setTheme: (theme) => {
    localStorage.setItem("quickdrop-theme", theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === "dark" ? "light" : "dark";
      localStorage.setItem("quickdrop-theme", nextTheme);
      return { theme: nextTheme };
    }),
}));
