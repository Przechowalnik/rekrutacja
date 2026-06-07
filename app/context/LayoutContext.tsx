import type { DefaultMantineColor } from "@mantine/core";
import { em } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import type { PropsWithChildren } from "react";
import { createContext, useEffect, useMemo, useState } from "react";
import {
  isAndroid as isAndroidPackage,
  isBrowser as isBrowserDevicePackage,
  isIOS as isIOSPackage,
  isMobile as isMobileDevicePackage,
} from "react-device-detect";

export type T_Layout = {
  isAndroid: boolean;
  isBrowserDevice: boolean;
  isDesktop: boolean;
  isDesktopOrTablet: boolean;
  isIOS: boolean;
  isMobile: boolean;
  isMobileDevice: boolean;
  isTablet: boolean;
  isTabletOrMobile: boolean;
  platformColor: DefaultMantineColor;
};

const DEFAULTS: T_Layout = {
  isAndroid: false,
  isBrowserDevice: false,
  isDesktop: false,
  isDesktopOrTablet: false,
  isIOS: false,
  isMobile: false,
  isMobileDevice: false,
  isTablet: false,
  isTabletOrMobile: false,
  platformColor: "violet",
};

export const LayoutContext = createContext<T_Layout>(DEFAULTS);

export const LayoutContextProvider = ({ children }: PropsWithChildren) => {
  const [isBrowserDevice, setIsBrowserDevice] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  const isTablet =
    useMediaQuery(`(min-width: ${em(576)}) and (max-width: ${em(991)})`) ??
    false;
  const isDesktop = useMediaQuery(`(min-width: ${em(992)})`) ?? false;
  const isTabletOrMobile = useMediaQuery(`(max-width: ${em(991)})`) ?? false;
  const isDesktopOrTablet = useMediaQuery(`(min-width: ${em(576)})`) ?? false;
  const isMobile = useMediaQuery(`(max-width: ${em(575)})`) ?? false;

  useEffect(() => {
    setIsBrowserDevice(isBrowserDevicePackage);
    setIsMobileDevice(isMobileDevicePackage);
    setIsIOS(isIOSPackage);
    setIsAndroid(isAndroidPackage);
  }, []);

  const contextValues = useMemo(() => {
    return {
      isAndroid,
      isBrowserDevice,
      isDesktop,
      isDesktopOrTablet,
      isIOS,
      isMobile,
      isMobileDevice,
      isTablet,
      isTabletOrMobile,
      platformColor: "violet",
    };
  }, [
    isAndroid,
    isBrowserDevice,
    isDesktop,
    isDesktopOrTablet,
    isIOS,
    isMobile,
    isMobileDevice,
    isTablet,
    isTabletOrMobile,
  ]);

  return (
    <LayoutContext.Provider value={contextValues}>
      {children}
    </LayoutContext.Provider>
  );
};
