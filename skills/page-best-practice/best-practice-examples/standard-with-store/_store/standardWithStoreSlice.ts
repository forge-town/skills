import { type StateCreator } from "zustand";

export interface StandardWithStoreSlice {
  loading: boolean;
  searchQuery: string;
  selectedSort: string;
  users: Array<{ id: string; name: string; email: string; status: string }>;

  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSelectedSort: (sort: string) => void;
  setUsers: (
    users: Array<{ id: string; name: string; email: string; status: string }>,
  ) => void;
}

export const createStandardWithStoreSlice: StateCreator<
  StandardWithStoreSlice
> = (set) => ({
  loading: false,
  searchQuery: "",
  selectedSort: "name",
  users: [],

  setLoading: (loading) => set({ loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedSort: (sort) => set({ selectedSort: sort }),
  setUsers: (users) => set({ users }),
});
