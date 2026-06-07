import { useEffect, useRef } from "react";
import { useMapEvents } from "react-leaflet";

import { T_MapOnMoveEnd } from "../constants";

type T_MapBounds = {
  onMapViewChange?: () => void;
  onMoveEnd?: (data: T_MapOnMoveEnd) => void;
};

export const MapBounds = ({ onMapViewChange, onMoveEnd }: T_MapBounds) => {
  const timeoutReference = useRef<NodeJS.Timeout | null>(null);
  const lastBounds = useRef<L.LatLngBounds | null>(null);
  const initCalled = useRef(false);

  const map = useMapEvents({
    drag: () => {
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }
    },
    dragstart: () => {
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }
    },
    mousedown: () => {
      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }
    },
    moveend: () => {
      if (!onMoveEnd) {
        return;
      }

      if (timeoutReference.current) {
        clearTimeout(timeoutReference.current);
      }

      timeoutReference.current = setTimeout(() => {
        const newBounds = map.getBounds();

        if (lastBounds.current?.equals(newBounds)) {
          return;
        }
        lastBounds.current = newBounds;
        onMapViewChange?.();
        onMoveEnd?.({
          east: newBounds.getEast(),
          north: newBounds.getNorth(),
          south: newBounds.getSouth(),
          west: newBounds.getWest(),
          zoom: Math.round(map.getZoom()),
        });
      }, 1000);
    },
  });

  useEffect(() => {
    if (initCalled.current) {
      return;
    }

    initCalled.current = true;

    const timer = setTimeout(() => {
      const newBounds = map.getBounds();

      lastBounds.current = newBounds;
      onMoveEnd?.({
        east: newBounds.getEast(),
        north: newBounds.getNorth(),
        south: newBounds.getSouth(),
        west: newBounds.getWest(),
        zoom: Math.round(map.getZoom()),
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [map, onMoveEnd]);

  return null;
};
