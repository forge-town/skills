import { type StateCreator } from "zustand";

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

export interface TopBarSlice {
  tabs: Tab[];
  currentTab: string;

  handleSetTabs: (tabs: Tab[]) => void;
  handleSetCurrentTab: (tabId: string) => void;
  handleTabClick: (tabId: string) => void;
}

export const createTopBarSlice: StateCreator<TopBarSlice> = (set) => ({
  tabs: [],
  currentTab: "",

  handleSetTabs: (tabs) => set({ tabs }),
  handleSetCurrentTab: (tabId) => set({ currentTab: tabId }),
  handleTabClick: (tabId) => set({ currentTab: tabId }),
});
