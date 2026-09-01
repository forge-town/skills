import { type StateCreator } from "zustand";

export interface AppLayoutSlice {
  sidebarOpen: boolean;

  handleSidebarToggleButtonClick: () => void;
}

export const createAppLayoutSlice: StateCreator<AppLayoutSlice> = (set) => ({
  sidebarOpen: false,

  handleSidebarToggleButtonClick: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),
});
