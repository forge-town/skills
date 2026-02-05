import { type ReactNode } from "react";
import {
  StandardWithStoreStoreContext,
  createStandardWithStoreStore,
} from "./standardWithStoreStore";
import { useInit } from "@/hooks/useInit";

interface Props {
  children: ReactNode;
}

export const StandardWithStorePageStoreProvider = ({ children }: Props) => {
  const store = useInit(() => createStandardWithStoreStore());

  return (
    <StandardWithStoreStoreContext.Provider value={store}>
      {children}
    </StandardWithStoreStoreContext.Provider>
  );
};
