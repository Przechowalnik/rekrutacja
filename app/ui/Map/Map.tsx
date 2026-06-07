import { Suspense, useEffect, useState } from "react";

import { dynamic } from "~/hoc/dynamic";

import type { T_Map } from "./constants";

const MapClient = dynamic(() => import("./Map.client"));

export const Map = (properties: T_Map) => {
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    setIsMapReady(true);
  }, []);

  if (!isMapReady) {
    return;
  }

  return (
    <Suspense>
      <MapClient {...properties} />
    </Suspense>
  );
};
