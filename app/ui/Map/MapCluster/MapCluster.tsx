import L from "leaflet";
import { memo } from "react";
import { Marker, Popup } from "react-leaflet";

import { colorsMantine } from "~/constants/colorsMantine";
import { globalClasses } from "~/constants/styles";

import { T_Cluster } from "../constants";

const MapCluster = ({
  content,
  count,
  isActive,
  lat,
  lng,
  onClick,
}: T_Cluster) => {
  const customIcon = new L.DivIcon({
    className: globalClasses.fade,
    html: `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: ${isActive ? colorsMantine.primary9 : colorsMantine.primary5};
      width: 45px;
      height: 45px;
      border-radius: 50%;
      border: 2px solid ${isActive ? colorsMantine.primary9 : colorsMantine.primary};
      position: relative;
      color: ${colorsMantine.white};
      font-weight: bold;
      font-size: 14px !important;
      position: relative;
    ">${count}</div>
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
    >
      {content && <Popup>{content}</Popup>}
    </Marker>
  );
};

export default memo(MapCluster);
