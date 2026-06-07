/* eslint-disable @typescript-eslint/ban-ts-comment */
import "leaflet/dist/leaflet.css";

import {
  faChevronLeft,
  faChevronRight,
  faCrosshairs,
  faMinus,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Box, Flex, Loader as MantineLoader } from "@mantine/core";
import cx from "clsx";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import type { MouseEvent } from "react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Circle, MapContainer, TileLayer } from "react-leaflet";
import Supercluster from "supercluster";

import { colorsMantine } from "~/constants/colorsMantine";
import { namespaces } from "~/constants/namespaces";
import { globalClasses, globalIds } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { useScrolling } from "~/hooks/useScrolling";

import { Button } from "../Button";
import { Collapse } from "../Collapse";
import { IconSeo } from "../IconSeo";
import { SliderListingsMapButton } from "../SliderListingsMapButton";
import { Text } from "../Text";
import type { T_Map } from "./constants";
import classes from "./Map.module.css";
import { MapBounds } from "./MapBounds";
import { MapCluster } from "./MapCluster";
import { MapMarker } from "./MapMarker";
import { MapShiftDrag } from "./MapShiftDrag";

export const DEFAULT_CENTER = {
  lat: 52.2298,
  lng: 21.0118,
};

const MapClient = ({
  center = {
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
  },
  circles,
  countMarkers,
  height,
  initialZoom = 13,
  isLoading = false,
  markers = [],
  maxCountMarkers = 500,
  maxZoom = 18,
  minZoom = 11,
  onCloseMap,
  onMoveEnd,
  withButtonsPreviousAndNext = false,
}: T_Map) => {
  const [isReadyReferenceMap, setIsReadyReferenceMap] = useState(false);
  const [isScrollingMap, setIsScrollingMap] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<null | string>(null);
  const [selectedClusterId, setSelectedClusterId] = useState<null | number>(
    null,
  );
  const [isCursorOnMap, setIsCursorOnMap] = useState(false);
  const [mapMoveCounter, setMapMoveCounter] = useState(0);
  const mapReference = useRef<LeafletMap | null>(null);

  const { t } = useTranslation(namespaces.common);
  const { t: tSeo } = useTranslation(namespaces.seo);
  const { isMobile } = useLayout();
  const { isScrolling } = useScrolling({
    keyToClose: "Shift",
    timeout: 100,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (mapReference) {
        setIsReadyReferenceMap(true);
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [mapReference, setIsReadyReferenceMap]);

  useEffect(() => {
    if (!isCursorOnMap) {
      setIsScrollingMap(false);
      return;
    }

    let timer: NodeJS.Timeout | null = null;

    if (isScrolling) {
      setIsScrollingMap(true);
    } else {
      timer = setTimeout(() => setIsScrollingMap(false), 1000);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Shift") {
        setIsScrollingMap(false);
      }
    }

    globalThis.addEventListener("keydown", onKeyDown);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      globalThis.removeEventListener("keydown", onKeyDown);
    };
  }, [isScrolling, isCursorOnMap]);

  useEffect(() => {
    setIsCollapsed(true);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (mapReference.current) {
        mapReference.current.invalidateSize();
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (mapReference.current && center) {
      const zoom = mapReference.current.getZoom();
      mapReference.current.setView(center, zoom, {
        animate: true,
      });
    }
  }, [center]);

  const handleSetViewMap = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (mapReference.current && center) {
      const zoom = mapReference.current.getZoom();
      mapReference.current.setView([center.lat, center.lng], zoom, {
        animate: true,
      });
    }
  };

  const handleClickPlus = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (mapReference.current) {
      const zoom = mapReference.current.getZoom();
      const center = mapReference.current.getCenter();
      const newZoomValue = zoom - 1;
      mapReference.current.setView(center, newZoomValue, {
        animate: true,
      });
      setSelectedClusterId(null);
      setSelectedMarkerId(null);
    }
  };

  const handleClickMinus = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (mapReference.current) {
      const zoom = mapReference.current.getZoom();
      const center = mapReference.current.getCenter();
      const newZoomValue = zoom + 1;
      mapReference.current.setView(center, newZoomValue, {
        animate: true,
      });
      setSelectedClusterId(null);
      setSelectedMarkerId(null);
    }
  };

  const handleOnMouseEnter = useCallback(() => {
    setIsCursorOnMap(true);
    setIsScrollingMap(false);
  }, []);

  const handleOnMouseLeave = useCallback(() => {
    setIsCursorOnMap(false);
  }, []);

  const mapCircles = circles?.map(itemCircle => {
    return (
      <Circle
        center={{
          lat: itemCircle.lat,
          lng: itemCircle.lng,
        }}
        key={`circle_${itemCircle.lat}_${itemCircle.lng}`}
        pathOptions={{
          color: itemCircle?.color ?? colorsMantine.primary,
          fillColor: itemCircle?.color ?? colorsMantine.primary,
        }}
        radius={itemCircle.range}
      />
    );
  });

  const supercluster = useMemo(() => {
    const cluster = new Supercluster({
      maxZoom,
      minZoom,
      radius: 120,
    });
    cluster.load(
      markers.map(point => ({
        geometry: { coordinates: [point.lng, point.lat], type: "Point" },
        properties: { cluster: false, point, pointId: point.id },
        type: "Feature",
      })),
    );
    return cluster;
  }, [markers, maxZoom, minZoom, isReadyReferenceMap]);

  const clusters = useMemo(() => {
    if (!mapReference.current) {
      return [];
    }

    const newBounds = mapReference.current.getBounds();
    const zoom = mapReference.current.getZoom();

    return supercluster.getClusters(
      [
        newBounds.getWest(),
        newBounds.getSouth(),
        newBounds.getEast(),
        newBounds.getNorth(),
      ],
      Math.floor(zoom),
    );
  }, [supercluster, isReadyReferenceMap, mapMoveCounter]);

  const handleShowMarkerOrCluster = useCallback(
    ({ value = 1 }: { value: number }) => {
      if (!mapReference?.current) {
        return;
      }

      const foundActiveCluster = clusters.findIndex(
        item => item.properties.cluster_id === selectedClusterId,
      );

      const foundActiveMarker = clusters.findIndex(
        item => item.properties.pointId === selectedMarkerId,
      );

      const validActiveIndexCluster =
        foundActiveCluster === -1 ? foundActiveMarker : foundActiveCluster;

      if (
        validActiveIndexCluster >= 0 &&
        clusters.length > validActiveIndexCluster + value
      ) {
        const foundNextIndex = clusters.at(validActiveIndexCluster + value);
        if (foundNextIndex) {
          if (foundNextIndex.properties.cluster) {
            const coordinateLat = foundNextIndex.geometry.coordinates[1];
            const coordinateLng = foundNextIndex.geometry.coordinates[0];
            if (coordinateLat && coordinateLng) {
              const point = L.latLng(coordinateLat, coordinateLng);
              if (!mapReference.current.getBounds().contains(point)) {
                const zoom = mapReference.current.getZoom();
                mapReference.current.setView(
                  [coordinateLat, coordinateLng],
                  zoom,
                  {
                    animate: true,
                  },
                );
              }
              setSelectedMarkerId(null);
              setSelectedClusterId(foundNextIndex.properties.cluster_id);
            }
          } else if (foundNextIndex.properties.pointId) {
            const coordinateLat = foundNextIndex.geometry.coordinates[1];
            const coordinateLng = foundNextIndex.geometry.coordinates[0];
            if (coordinateLat && coordinateLng) {
              const point = L.latLng(coordinateLat, coordinateLng);
              if (!mapReference.current.getBounds().contains(point)) {
                const zoom = mapReference.current.getZoom();
                mapReference.current.setView(
                  [coordinateLat, coordinateLng],
                  zoom,
                  {
                    animate: true,
                  },
                );
              }
              setSelectedClusterId(null);
              setSelectedMarkerId(foundNextIndex.properties.pointId);
            }
          }
        }
      } else {
        const foundFirstCluster = clusters.at(0);
        if (foundFirstCluster) {
          if (foundFirstCluster.properties.cluster) {
            const coordinateLat = foundFirstCluster.geometry.coordinates[1];
            const coordinateLng = foundFirstCluster.geometry.coordinates[0];
            if (coordinateLat && coordinateLng) {
              const point = L.latLng(coordinateLat, coordinateLng);
              if (!mapReference.current.getBounds().contains(point)) {
                const zoom = mapReference.current.getZoom();
                mapReference.current.setView(
                  [coordinateLat, coordinateLng],
                  zoom,
                  {
                    animate: true,
                  },
                );
              }
              setSelectedMarkerId(null);
              setSelectedClusterId(foundFirstCluster.properties.cluster_id);
            }
          } else if (foundFirstCluster.properties.pointId) {
            const coordinateLat = foundFirstCluster.geometry.coordinates[1];
            const coordinateLng = foundFirstCluster.geometry.coordinates[0];
            if (coordinateLat && coordinateLng) {
              const point = L.latLng(coordinateLat, coordinateLng);
              if (!mapReference.current.getBounds().contains(point)) {
                const zoom = mapReference.current.getZoom();
                mapReference.current.setView(
                  [coordinateLat, coordinateLng],
                  zoom,
                  {
                    animate: true,
                  },
                );
              }
              setSelectedClusterId(null);
              setSelectedMarkerId(foundFirstCluster.properties.pointId);
            }
          }
        }
      }
    },
    [clusters, selectedMarkerId, selectedClusterId],
  );

  const mapSupercluster = useMemo(
    () =>
      clusters.map(cluster => {
        const [lng, lat] = cluster.geometry.coordinates;
        const {
          cluster: isCluster,
          cluster_id,
          point,
          point_count,
        } = cluster.properties;

        if (isCluster && lng && lat && cluster.id) {
          const isActive = cluster_id === selectedClusterId;

          return (
            <MapCluster
              count={point_count}
              isActive={isActive}
              key={`cluster-${cluster.id}`}
              lat={lat}
              lng={lng}
              onClick={() => {
                setSelectedMarkerId(null);
                setSelectedClusterId(previousState =>
                  previousState === cluster_id ? null : cluster_id,
                );
              }}
            />
          );
        }

        if (!point) {
          return null;
        }

        return (
          <MapMarker
            {...point}
            isActive={selectedMarkerId === point.id}
            key={`point_${point.id}`}
            onClick={() => {
              setSelectedClusterId(null);
              setSelectedMarkerId(previousState =>
                previousState === point.id ? null : point.id,
              );
            }}
          />
        );
      }),
    [clusters, selectedClusterId, isReadyReferenceMap],
  );

  const showLegendFromCluster = useMemo(() => {
    if (!selectedClusterId || !mapReference.current) {
      return null;
    }

    const zoom = mapReference.current.getZoom();
    const bounds = mapReference.current.getBounds();

    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];

    // @ts-ignore
    const clusters = supercluster.getClusters(bbox, zoom);

    const clusterFeature = clusters.find(
      f => f.properties.cluster_id === selectedClusterId,
    );

    if (clusterFeature?.properties?.cluster) {
      const leaves = supercluster.getLeaves(selectedClusterId, 1000, 0);

      return leaves.map((item, index) => (
        <Button
          fullWidth
          justify="flex-start"
          key={`point_${item.id}`}
          onClick={item?.properties?.point?.onClickDetails}
          variant={isMobile ? "filled" : "light"}
        >
          {`${index + 1}. ${item?.properties?.point?.title ?? ""}`}
        </Button>
      ));
    }

    return null;
  }, [selectedClusterId, isReadyReferenceMap]);

  return (
    <Collapse fullWith opened={isCollapsed}>
      <Box
        pos="relative"
        style={{
          borderRadius: 10,
          overflow: "hidden",
        }}
        w="100%"
      >
        <Flex
          direction={{
            base: "column",
            sm: "row",
          }}
          pt={{
            base: 24,
            xs: 0,
          }}
        >
          <Box
            className={cx(
              classes.leafletMap,
              globalClasses.opacityDelay,
              classes.dnd,
            )}
            h={
              height ?? {
                base: 315,
                md: 200,
              }
            }
            id={globalIds.dnd}
            onClick={() => {
              setSelectedClusterId(null);
              setSelectedMarkerId(null);
            }}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
            style={{
              transition: "width 0.3s ease",
            }}
            w={{
              base: "100%",
              sm: selectedClusterId ? "calc(100% - 324px)" : "100%",
            }}
          >
            {onCloseMap && (
              <Box
                bg={colorsMantine.whiteOpacity6}
                p={8}
                pb={2}
                pos="absolute"
                right={0}
                style={{
                  zIndex: 1,
                }}
                top={0}
              >
                <Button
                  ariaLabel={tSeo("imagesAlt.map.close")}
                  onClick={onCloseMap}
                  px={8}
                  radius={10}
                  size="sm"
                  variant="filled"
                  w={36}
                >
                  <IconSeo icon={faXmark} size="lg" />
                </Button>
              </Box>
            )}
            <Box
              bg={colorsMantine.whiteOpacity6}
              p={8}
              pos="absolute"
              pt={onCloseMap ? 2 : 8}
              right={0}
              style={{
                borderBottomLeftRadius: "16px",
                zIndex: 1,
              }}
              top={onCloseMap ? 46 : 0}
            >
              <Button
                ariaLabel={tSeo("imagesAlt.map.centerMapLocation")}
                onClick={handleSetViewMap}
                px={8}
                radius={10}
                size="sm"
                variant="filled"
                w={36}
              >
                <IconSeo icon={faCrosshairs} size="lg" />
              </Button>
            </Box>
            <Box
              bg={colorsMantine.whiteOpacity6}
              left={0}
              p={8}
              pb={2}
              pos="absolute"
              style={{
                zIndex: 1,
              }}
              top={0}
            >
              <Button
                ariaLabel={tSeo("imagesAlt.map.minus")}
                onClick={handleClickMinus}
                px={8}
                size="sm"
                variant="filled"
                w="auto"
              >
                <IconSeo icon={faPlus} size="lg" />
              </Button>
            </Box>
            <Box
              bg={colorsMantine.whiteOpacity6}
              left={0}
              p={8}
              pos="absolute"
              pt={2}
              style={{
                borderBottomRightRadius: "16px",
                zIndex: 1,
              }}
              top={46}
            >
              <Button
                ariaLabel={tSeo("imagesAlt.map.plus")}
                onClick={handleClickPlus}
                px={8}
                size="sm"
                variant="filled"
                w="auto"
              >
                <IconSeo icon={faMinus} size="lg" />
              </Button>
            </Box>
            {withButtonsPreviousAndNext && (
              <Flex
                bg={colorsMantine.whiteOpacity6}
                bottom={0}
                gap={8}
                left="50%"
                p={8}
                pos="absolute"
                style={{
                  borderTopLeftRadius: "16px",
                  borderTopRightRadius: "16px",
                  transform: `translateX(-50%) translateY(${clusters.length > 0 ? "0" : "100%"})`,
                  transition: "transform 0.3s ease",
                  zIndex: 1,
                }}
              >
                <Button
                  ariaLabel={tSeo("imagesAlt.map.previous")}
                  leftSection={<IconSeo icon={faChevronLeft} size="lg" />}
                  onClick={event => {
                    event.stopPropagation();
                    handleShowMarkerOrCluster({
                      value: -1,
                    });
                  }}
                  px={8}
                  size="sm"
                  variant="filled"
                  w={{
                    base: "calc(50% - 4px)",
                    xs: 180,
                  }}
                >
                  {t("map.buttonPrevious")}
                </Button>
                <Button
                  ariaLabel={tSeo("imagesAlt.map.next")}
                  onClick={event => {
                    event.stopPropagation();
                    handleShowMarkerOrCluster({
                      value: 1,
                    });
                  }}
                  px={8}
                  rightSection={<IconSeo icon={faChevronRight} size="lg" />}
                  size="sm"
                  variant="filled"
                  w={{
                    base: "calc(50% - 4px)",
                    xs: 180,
                  }}
                >
                  {t("map.buttonNext")}
                </Button>
              </Flex>
            )}
            <MapContainer
              boxZoom={false}
              center={
                center
                  ? [center.lat, center.lng]
                  : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng]
              }
              className={classes.leafletContainer}
              doubleClickZoom
              dragging
              fadeAnimation
              keyboard
              maxZoom={maxZoom}
              minZoom={minZoom}
              ref={mapReference}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
              tapTolerance={50}
              touchZoom={isMobile ? "center" : false}
              trackResize
              worldCopyJump={false}
              zoom={isMobile ? initialZoom - 1 : initialZoom}
              zoomAnimation
              zoomControl={false}
              zoomSnap={1}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                className={classes.leafletControlAttribution}
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {onMoveEnd && (
                <MapBounds
                  onMapViewChange={() =>
                    setMapMoveCounter(previous => previous + 1)
                  }
                  onMoveEnd={onMoveEnd}
                />
              )}
              {clusters.length > 0 &&
                !!countMarkers &&
                countMarkers > 0 &&
                mapSupercluster}
              {clusters.length === 0 &&
                !!countMarkers &&
                countMarkers > 0 &&
                isReadyReferenceMap && (
                  <MapCluster
                    count={countMarkers}
                    isActive={false}
                    lat={center.lat}
                    lng={center.lng}
                    onClick={() => {
                      if (!mapReference.current) {
                        return;
                      }

                      mapReference.current.setView(center, isMobile ? 13 : 14);
                    }}
                  />
                )}
              <MapShiftDrag />
              {mapCircles}
            </MapContainer>
            <Box
              bg={colorsMantine.primary}
              left="50%"
              pos="absolute"
              px={8}
              py={4}
              style={{
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                transform: `translateX(-50%) translateY(${typeof countMarkers === "number" ? 0 : "-100%"})`,
                transition: "transform 0.3s ease",
              }}
              top={0}
            >
              <Text c="white" center size="sm" withTextsToUi>
                {t("map.results", {
                  count: countMarkers ?? 0,
                })}
              </Text>
            </Box>
            {clusters.length > 0 &&
              countMarkers &&
              countMarkers >= maxCountMarkers && (
                <Box
                  bg={colorsMantine.blackOpacity8}
                  className={globalClasses.fadePage}
                  left={50}
                  pos="absolute"
                  right={50}
                  style={{
                    borderRadius: 8,
                  }}
                  top={10}
                >
                  <Text c="white" center fw="bold">
                    {t("map.errorCount")}
                  </Text>
                </Box>
              )}
            <Flex
              align="center"
              bg={colorsMantine.blackOpacity1}
              bottom={0}
              justify="center"
              left={0}
              pos="absolute"
              right={0}
              style={{
                opacity: isLoading ? 1 : 0,
                transform: `translateY(${isLoading ? "0" : "-100%"})`,
                transition: "transform 0.3s ease, opacity 0.3s ease",
                zIndex: 1,
              }}
              top={0}
            >
              <MantineLoader color="white" size="lg" />
            </Flex>
            <Box
              bottom={0}
              left={0}
              pos="absolute"
              right={0}
              style={{
                display: isLoading ? "block" : "none",
                zIndex: 1,
              }}
              top={0}
            />
            <Flex
              align="center"
              bg={colorsMantine.blackOpacity6}
              bottom={0}
              justify="center"
              left={0}
              pos="absolute"
              right={0}
              style={{
                opacity: isScrollingMap && !isLoading ? 1 : 0,
                transform: `translateY(${isScrollingMap && !isLoading ? "0" : "-100%"})`,
                transition: "transform 0.3s ease, opacity 0.3s ease",
                zIndex: 1,
              }}
              top={0}
            >
              <Text c="white" fw="bold" size="xl">
                {t("map.scroll")}
              </Text>
            </Flex>
          </Box>
          <Flex
            align="flex-start"
            direction="row"
            gap={8}
            id={globalIds.dnd}
            justify="flex-start"
            mah={
              height ?? {
                base: "auto",
                md: 200,
              }
            }
            pr={{
              base: selectedClusterId ? 12 : 0,
              sm: 0,
            }}
            px={{
              base: 0,
              sm: selectedClusterId ? 24 : 0,
            }}
            py={{
              base: selectedClusterId ? 24 : 0,
              sm: 0,
            }}
            style={{
              alignContent: "flex-start",
              overflowY: "auto",
              transition: "width 0.3s ease, padding 0.3s ease",
            }}
            visibleFrom="sm"
            w={{
              base: "100%",
              sm: selectedClusterId ? "324px" : "0%",
            }}
            wrap="wrap"
          >
            {showLegendFromCluster}
          </Flex>
          <Flex
            bg={colorsMantine.white}
            bottom={0}
            h={84}
            hiddenFrom="sm"
            left={0}
            pos="absolute"
            py={12}
            right={0}
            style={{
              transform: `translateY(${selectedClusterId ? "-55px" : "calc(100%)"})`,
              transition: "transform 0.3s ease",
            }}
          >
            <SliderListingsMapButton items={showLegendFromCluster ?? []} />
          </Flex>
        </Flex>
      </Box>
    </Collapse>
  );
};

export default memo(MapClient);
