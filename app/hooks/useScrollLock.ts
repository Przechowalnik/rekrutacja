import { useEffect } from "react";

export function useScrollLock(shouldLock: boolean) {
  useEffect(() => {
    const preventDefault = (event: Event) => {
      if (shouldLock) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventDefault);
    };
  }, [shouldLock]);
}
