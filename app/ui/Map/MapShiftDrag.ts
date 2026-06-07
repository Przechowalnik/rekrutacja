import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MapShiftDrag() {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.disable();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Shift") {
        map.scrollWheelZoom.enable();
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === "Shift") {
        map.scrollWheelZoom.disable();
      }
    }

    globalThis.addEventListener("keydown", onKeyDown);
    globalThis.addEventListener("keyup", onKeyUp);

    return () => {
      globalThis.removeEventListener("keydown", onKeyDown);
      globalThis.removeEventListener("keyup", onKeyUp);
      map.scrollWheelZoom.disable();
    };
  }, [map]);

  return null;
}
