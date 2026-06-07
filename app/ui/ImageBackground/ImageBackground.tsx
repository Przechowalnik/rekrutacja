import { useMantineColorScheme } from "@mantine/core";
import { CSSProperties, memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { globalClasses } from "~/constants/styles";
import { useLayout } from "~/hooks/useLayout";
import { E_Language } from "~/models/enums";

type T_ImageBackground = {
  alt: string;
  ariaHidden?: boolean;
  customSrc?: string;
  height?: number | string;
  minHeight?: number | string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  onClick?: () => void;
  path?: {
    forceDarkMode?: boolean;
    forceLightMode?: boolean;
    format: "jpeg" | "png" | "svg" | "webp";
    pathWithColorMode?: boolean;
    pathWithDevice?: boolean;
    pathWithLanguage?: boolean;
    src: string;
  };
  style?: CSSProperties;
  width?: number | string;
};

const ImageBackgroundToMemoize = ({
  alt,
  ariaHidden,
  customSrc,
  height,
  minHeight,
  objectFit = "cover",
  onClick,
  path,
  style,
  width,
}: T_ImageBackground) => {
  const { i18n } = useTranslation(namespaces.common);
  const { colorScheme } = useMantineColorScheme();
  const { isDesktop, isTablet } = useLayout();

  const imageSource = (() => {
    if (customSrc) {
      return customSrc;
    }
    if (!path?.src) {
      return;
    }
    const deviceSuffix = (() => {
      if (!path.pathWithDevice) {
        return "";
      }
      if (isDesktop) {
        return "-desktop";
      }
      if (isTablet) {
        return "-tablet";
      }
      return "-mobile";
    })();
    const colorModeSuffix = (() => {
      if (!path.pathWithColorMode) {
        return "";
      }
      if (path.forceLightMode) {
        return "-light";
      }
      if (path.forceDarkMode || colorScheme === "dark") {
        return "-dark";
      }
      return "-light";
    })();
    const languageSuffix = (() => {
      if (!path.pathWithLanguage) {
        return "";
      }
      if (i18n.language === E_Language.EN.toLowerCase()) {
        return "-en";
      }
      return "-pl";
    })();
    return `${path.src}${deviceSuffix}${colorModeSuffix}${languageSuffix}.${path.format}`;
  })();

  const imgElement = (
    <img
      alt={alt}
      className={globalClasses.fade}
      loading="lazy"
      src={imageSource}
      style={{
        height,
        minHeight,
        objectFit,
        objectPosition: "center",
        width,
        ...style,
      }}
      {...(ariaHidden
        ? {
            "aria-hidden": true,
          }
        : {})}
    />
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        type="button"
      >
        {imgElement}
      </button>
    );
  }

  return imgElement;
};

export const ImageBackground = memo(ImageBackgroundToMemoize);
