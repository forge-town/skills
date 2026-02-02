import { type StateCreator } from "zustand";

export interface AppLayoutSlice {
  sidebarOpen: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const createAppLayoutSlice: StateCreator<AppLayoutSlice> = (set) => ({
  sidebarOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
});
