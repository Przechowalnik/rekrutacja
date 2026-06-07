import { useContext } from "react";

import { ConfettiContext } from "~/context/ConfettiContext";

export const useConfetti = () => {
  const properties = useContext(ConfettiContext);

  return properties;
};
