import { useRef } from "react";

function generateToken() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

export function usePlacesSessionToken() {
  const tokenReference = useRef<null | string>(null);

  const getToken = () => {
    if (!tokenReference.current) {
      tokenReference.current = generateToken();
    }
    return tokenReference.current;
  };

  const resetToken = () => {
    tokenReference.current = null;
  };

  return { getToken, resetToken };
}
