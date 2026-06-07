import { useContext } from "react";

import { FlashContext } from "~/context/FlashContext";

export const useFlash = () => {
  const context = useContext(FlashContext);

  return context;
};
