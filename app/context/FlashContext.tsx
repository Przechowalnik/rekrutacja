import type { PropsWithChildren } from "react";
import { createContext, useCallback, useMemo, useState } from "react";

import { T_FlashData } from "~/models/flashData";

export const FlashContext = createContext<{
  flashData: null | T_FlashData;
  onChangeFlashData: (newFlashData: null | T_FlashData) => void;
}>({
  flashData: null,
  onChangeFlashData: () => {},
});

export const FlashContextProvider = ({ children }: PropsWithChildren) => {
  const [flashData, setFlashData] = useState<null | T_FlashData>(null);

  const onChangeFlashData = useCallback((newFlashData: null | T_FlashData) => {
    setFlashData(newFlashData);
  }, []);

  const context = useMemo(() => {
    return { flashData, onChangeFlashData };
  }, [flashData, onChangeFlashData]);

  return (
    <FlashContext.Provider value={context}>{children}</FlashContext.Provider>
  );
};
