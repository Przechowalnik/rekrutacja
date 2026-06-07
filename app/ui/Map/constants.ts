import type { CSSProperties, StyleProp } from "@mantine/core";
import { ReactNode } from "react";

type T_MapCenter = {
  lat: number;
  lng: number;
};

type T_Circle = {
  color?: string;
  lat: number;
  lng: number;
  range: number;
};

export type T_Marker = {
  content?: ReactNode;
  id: string;
  isActive?: boolean;
  lat: number;
  lng: number;
  onClick?: () => void;
  onClickDetails?: () => void;
  title: string;
};

export type T_Cluster = {
  content?: ReactNode;
  count: number;
  isActive: boolean;
  lat: number;
  lng: number;
  onClick?: () => void;
};

export type T_MapOnMoveEnd = {
  east: number;
  north: number;
  south: number;
  west: number;
  zoom: number;
};

export type T_Map = {
  center?: T_MapCenter;
  circles?: T_Circle[];
  countMarkers?: number;
  height?: StyleProp<CSSProperties["height"]>;
  initialZoom?: number;
  isLoading?: boolean;
  markers?: T_Marker[];
  maxCountMarkers?: number;
  maxZoom?: number;
  minZoom?: number;
  onCloseMap?: () => void;
  onMoveEnd?: (data: T_MapOnMoveEnd) => void;
  withButtonsPreviousAndNext?: boolean;
};
