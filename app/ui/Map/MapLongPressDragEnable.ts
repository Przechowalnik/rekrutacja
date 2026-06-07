/* eslint-disable @typescript-eslint/no-explicit-any */
import L, { LatLng } from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

import { disableBodyScroll, enableBodyScroll } from "~/utilities/functions";

export function MapLongPressDragEnable() {
  const map = useMap();
  const timerReference = useRef<null | ReturnType<typeof setTimeout>>(null);
  const longPressActive = useRef(false);
  const touchMoved = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startCenter = useRef<LatLng | null>(null);

  useEffect(() => {
    const container = map.getContainer();

    function onTouchStart(event: any) {
      event.stopPropagation();
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        startPos.current = { x: touch.clientX, y: touch.clientY };
        startCenter.current = map.getCenter();
      }
      touchMoved.current = false;
      longPressActive.current = false;

      timerReference.current = setTimeout(() => {
        longPressActive.current = true;
        map.dragging.enable();
        disableBodyScroll();
      }, 100);
    }

    function onTouchMove(event: any) {
      event.stopPropagation();
      if (event.touches.length !== 1) {
        return;
      }

      if (!longPressActive.current || !startCenter.current) {
        map.dragging.disable();
        enableBodyScroll();
        if (timerReference.current) {
          clearTimeout(timerReference.current);
          timerReference.current = null;
        }
        return;
      }

      const touch = event.touches[0];
      const dx = touch.clientX - startPos.current.x;
      const dy = touch.clientY - startPos.current.y;

      const startPoint = map.latLngToContainerPoint(startCenter.current);
      const newPoint = L.point(startPoint.x - dx, startPoint.y - dy);
      const newLatLng = map.containerPointToLatLng(newPoint);

      map.setView(newLatLng, map.getZoom(), { animate: false });

      touchMoved.current = true;
      if (timerReference.current) {
        clearTimeout(timerReference.current);
        timerReference.current = null;
      }
    }

    function onTouchEnd() {
      if (timerReference.current) {
        clearTimeout(timerReference.current);
        timerReference.current = null;
      }

      longPressActive.current = false;
      touchMoved.current = false;
      startCenter.current = null;

      map.dragging.disable();
      enableBodyScroll();
    }

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    container.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      if (timerReference.current) {
        clearTimeout(timerReference.current);
        timerReference.current = null;
      }
      map.dragging.disable();
      enableBodyScroll();
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
      container.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [map]);

  return null;
}
