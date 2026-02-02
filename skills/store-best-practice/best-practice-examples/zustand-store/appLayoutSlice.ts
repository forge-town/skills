import { type StateCreator } from "zustand";

export interface AppLayoutSlice {
  sidebarOpen: boolean;

  toggleSidebar: () => void;
  handleSetSidebarOpen: (open: boolean) => void;
}

export const createAppLayoutSlice: StateCreator<AppLayoutSlice> = (set) => ({
  sidebarOpen: false,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  handleSetSidebarOpen: (open) => set({ sidebarOpen: open }),
});
