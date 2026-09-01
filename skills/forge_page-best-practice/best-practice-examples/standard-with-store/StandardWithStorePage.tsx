import { StandardWithStorePageStoreProvider } from "./_store";
import { StandardWithStorePageContent } from "./StandardWithStorePageContent";

export const StandardWithStorePage = () => {
  return (
    <StandardWithStorePageStoreProvider>
      <StandardWithStorePageContent />
    </StandardWithStorePageStoreProvider>
  );
};
