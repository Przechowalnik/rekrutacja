import { useEffect, useState } from "react";

interface UseScrollingOptions {
  keyToClose?: "Enter" | "Escape" | "Shift";
  timeout?: number;
}

export function useScrolling({
  keyToClose,
  timeout = 100,
}: UseScrollingOptions) {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    function onScroll() {
      setScrolling(true);

      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => setScrolling(false), timeout);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (keyToClose && event.key === keyToClose) {
        setScrolling(false);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    globalThis.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("scroll", onScroll);
      globalThis.removeEventListener("keydown", onKeyDown);
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timeout, keyToClose]);

  return { isScrolling: scrolling };
}
