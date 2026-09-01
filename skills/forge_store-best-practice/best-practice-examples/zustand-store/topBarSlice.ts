import { type StateCreator } from "zustand";

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

export interface TopBarSlice {
  tabs: Tab[];
  currentTab: string;

  handleTabClick: (tabId: string) => void;
}

export const createTopBarSlice: StateCreator<TopBarSlice> = (set) => ({
  tabs: [],
  currentTab: "",

  handleTabClick: (tabId) => set({ currentTab: tabId }),
});
