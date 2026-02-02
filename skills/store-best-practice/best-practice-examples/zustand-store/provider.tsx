import { type ReactNode } from "react";
import { AppLayoutStoreContext, createAppLayoutStore } from "./appLayoutStore";
import { useInit } from "@/hooks/useInit";

interface Props {
  children: ReactNode;
}

export const AppLayoutStoreProvider = ({ children }: Props) => {
  const store = useInit(() => createAppLayoutStore());

  return (
    <AppLayoutStoreContext.Provider value={store}>
      {children}
    </AppLayoutStoreContext.Provider>
  );
};
