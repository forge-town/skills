import { createContext, useContext } from "react";
import {
  createStore,
  type Mutate,
  type StateCreator,
  type StoreApi,
} from "zustand";
import {
  createStandardWithStoreSlice,
  type StandardWithStoreSlice,
} from "./standardWithStoreSlice";

export interface StandardWithStoreState extends StandardWithStoreSlice {}

export type StandardWithStoreStoreSlice<T> = StateCreator<
  StandardWithStoreState,
  [],
  [],
  T
>;

export type StandardWithStoreStore = Mutate<
  StoreApi<StandardWithStoreState>,
  []
>;

export const createStandardWithStoreStore = () => {
  const store = createStore<StandardWithStoreState>()((set, get, api) => ({
    ...createStandardWithStoreSlice(set, get, api),
  }));

  return store;
};

export const UserManagementStoreContext =
export const StandardWithStoreStoreContext = createContext<StandardWithStoreStore | null>(null);

export const useStandardWithStoreStore = () => {
  const context = useContext(StandardWithStoreStoreContext);
  if (!context) {
    throw new Error(
      "useStandardWithStoreStore must be used within a StandardWithStoreStoreProvider",
    );
  }
  return context;
};
