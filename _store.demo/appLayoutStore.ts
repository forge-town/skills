import { createContext, useContext } from "react";
import {
  createStore,
  type Mutate,
  type StateCreator,
  type StoreApi,
} from "zustand";
import { createAppLayoutSlice, type AppLayoutSlice } from "./appLayoutSlice";
import { createTopBarSlice, type TopBarSlice } from "./topBarSlice";

export interface AppLayoutState extends AppLayoutSlice, TopBarSlice {}

export type AppLayoutStoreSlice<T> = StateCreator<AppLayoutState, [], [], T>;

export type AppLayoutStore = Mutate<StoreApi<AppLayoutState>, []>;

export const createAppLayoutStore = () => {
  const store = createStore<AppLayoutState>()((set, get, api) => ({
    ...createAppLayoutSlice(set, get, api),
    ...createTopBarSlice(set, get, api),
  }));

  return store;
};

export const AppLayoutStoreContext = createContext<AppLayoutStore | null>(null);

export const useAppLayoutStore = () => {
  const context = useContext(AppLayoutStoreContext);
  if (!context) {
    throw new Error(
      "useAppLayoutStore must be used within a AppLayoutStoreProvider"
    );
  }
  return context;
};
