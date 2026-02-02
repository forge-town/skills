import { type StateCreator } from "zustand";

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

export interface TopBarSlice {
  tabs: Tab[];
  currentTab: string;

  setTabs: (tabs: Tab[]) => void;
  setCurrentTab: (tabId: string) => void;
  handleTabClick: (tabId: string) => void;
}

export const createTopBarSlice: StateCreator<TopBarSlice> = (set) => ({
  tabs: [],
  currentTab: "",

  setTabs: (tabs) => set({ tabs }),
  setCurrentTab: (tabId) => set({ currentTab: tabId }),
  handleTabClick: (tabId) => set({ currentTab: tabId }),
});
