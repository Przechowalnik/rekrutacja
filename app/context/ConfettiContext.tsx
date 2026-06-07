import type { PropsWithChildren } from "react";
import { createContext, useEffect, useMemo, useState } from "react";

export type T_Confetti = {
  enabled: boolean;
  onChangeConfetti: (newValue: boolean) => void;
};

export const ConfettiContext = createContext<T_Confetti>({
  enabled: false,
  onChangeConfetti: () => {},
});

export const ConfettiContextProvider = ({ children }: PropsWithChildren) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(false);
  }, []);

  const onChangeConfetti = (newValue: boolean) => {
    setEnabled(newValue);
  };

  const contextValues = useMemo(() => {
    return {
      enabled,
      onChangeConfetti,
    };
  }, [enabled, onChangeConfetti]);

  return (
    <ConfettiContext.Provider value={contextValues}>
      {children}
    </ConfettiContext.Provider>
  );
};
