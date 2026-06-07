import L from "leaflet";
import { memo, useEffect, useRef } from "react";
import { Marker, Popup } from "react-leaflet";

import { colorsMantine } from "~/constants/colorsMantine";
import { globalClasses } from "~/constants/styles";

import { T_Marker } from "../constants";

const MapMarker = ({ content, isActive, lat, lng, onClick }: T_Marker) => {
  const markerReference = useRef<L.Marker>(null);

  useEffect(() => {
    const marker = markerReference.current;
    if (!marker) {
      return;
    }

    if (isActive) {
      marker.openPopup();
    } else {
      marker.closePopup();
    }
  }, [isActive]);

  const customIcon = new L.DivIcon({
    className: globalClasses.fade,
    html: `
    <div style="
      background-color: ${isActive ? colorsMantine.primary9 : colorsMantine.primary5};
      width: 35px;
      height: 35px;
      border-radius: 50%;
      border: 2px solid light-dark(${colorsMantine.gray0}, ${colorsMantine.dark9});
      position: relative;
    ">
      <div style="
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 16px solid ${isActive ? colorsMantine.primary9 : colorsMantine.primary5};
      "></div>
    </div>
  `,
    iconAnchor: [20, 20],
    iconSize: [40, 40],
  });

  return (
    <Marker
      eventHandlers={
        onClick
          ? {
              click: onClick,
            }
          : undefined
      }
      icon={customIcon}
      position={[lat, lng]}
      ref={markerReference}
    >
      {content && <Popup autoClose={false}>{content}</Popup>}
    </Marker>
  );
};

export default memo(MapMarker);
