import type { PropsWithChildren } from "react";
import { createContext, useContext } from "react";

const NonceContext = createContext<string | undefined>(undefined);

export function NonceProvider({
  children,
  nonce,
}: PropsWithChildren<{ nonce: string }>) {
  return (
    <NonceContext.Provider value={nonce}>{children}</NonceContext.Provider>
  );
}

export function useNonce(): string | undefined {
  return useContext(NonceContext);
}
