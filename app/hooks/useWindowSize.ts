import { useEffect, useState } from "react";

function getWindowDimensions() {
  if (globalThis.window === undefined) {
    return {
      height: 0,
      width: 0,
    };
  }

  const { innerHeight: height, innerWidth: width } = globalThis;
  return {
    height,
    width,
  };
}
export function useWindowSize() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions(),
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}
