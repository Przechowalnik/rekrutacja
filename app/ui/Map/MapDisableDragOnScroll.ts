import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapDisableDragOnScroll() {
  const map = useMap();

  useEffect(() => {
    let isScrolling: null | ReturnType<typeof setTimeout> = null;

    function onScroll() {
      map.dragging.disable();

      if (isScrolling !== null) {
        clearTimeout(isScrolling);
      }

      isScrolling = setTimeout(() => {
        map.dragging.enable();
      }, 250);
    }

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      map.dragging.enable();
    };
  }, [map]);

  return null;
}
