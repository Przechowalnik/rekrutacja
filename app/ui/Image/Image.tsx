import type { ImageProps } from "@mantine/core";
import {
  Box,
  Image as ImageMantine,
  useMantineColorScheme,
} from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { globalClasses } from "~/constants/styles";
import manifest from "~/generated/image-manifest.json";
import { useLayout } from "~/hooks/useLayout";
import { E_Language } from "~/models/enums";
import {
  buildOptimizedImageSourceSet,
  buildOptimizedImageUrl,
} from "~/utilities/imageOptimization";

const REMOTE_IMAGE_WIDTHS = [256, 384, 640, 750, 828, 1080, 1200, 1920];

type T_Image = {
  alt: string;
  ariaHidden?: boolean;
  customSrc?: string;
  fetchPriority?: "auto" | "high" | "low";
  loading?: "eager" | "lazy";
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
  sizes?: string;
} & ImageProps;

type T_ManifestEntry = {
  avifSrcSet: string;
  fallbackSrc: string;
  fallbackSrcSet?: string;
  webpSrcSet: string;
};

function resolveFinalSource(arguments_: {
  colorScheme: "dark" | "light";
  customSrc?: string;
  isDesktop: boolean;
  isTablet: boolean;
  language: string;
  path?: T_Image["path"];
}) {
  const { colorScheme, customSrc, isDesktop, isTablet, language, path } =
    arguments_;

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

  const colorSuffix = (() => {
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

  const langSuffix = (() => {
    if (!path.pathWithLanguage) {
      return "";
    }
    if (language === E_Language.EN.toLowerCase()) {
      return "-en";
    }
    return "-pl";
  })();

  return `${path.src}${deviceSuffix}${colorSuffix}${langSuffix}.${path.format}`;
}

const ImageToMemoize = (properties: T_Image) => {
  const { i18n } = useTranslation(namespaces.common);
  const { colorScheme } = useMantineColorScheme();
  const { isDesktop, isTablet } = useLayout();

  const {
    alt,
    ariaHidden,
    className,
    customSrc,
    fetchPriority,
    fit,
    h,
    hiddenFrom,
    loading = "lazy",
    mah,
    maw,
    mih,
    miw,
    onClick,
    path,
    radius,
    sizes = "100vw",
    style,
    visibleFrom,
    w,
    ...mantineOnlyProps
  } = properties;

  const finalSource = resolveFinalSource({
    colorScheme: colorScheme === "auto" ? "light" : colorScheme,
    customSrc,
    isDesktop,
    isTablet,
    language: i18n.language,
    path,
  });

  const isSvg = finalSource?.endsWith(".svg");
  const entry =
    !isSvg && finalSource
      ? (manifest as Record<string, T_ManifestEntry>)[finalSource]
      : undefined;

  const mergedClassName = [
    loading === "lazy" ? globalClasses.fade : undefined,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const borderRadiusValue = (() => {
    if (!radius) {
      return;
    }
    if (typeof radius === "number") {
      return `${radius}px`;
    }
    if (/^[a-z]+$/i.test(String(radius))) {
      return `var(--mantine-radius-${radius})`;
    }
    return String(radius);
  })();

  if (finalSource && entry) {
    return (
      <Box
        className={mergedClassName || undefined}
        component="picture"
        h={h}
        hiddenFrom={hiddenFrom}
        mah={mah}
        maw={maw}
        mih={mih}
        miw={miw}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (event_: React.KeyboardEvent) => {
                if (event_.key === "Enter" || event_.key === " ") {
                  event_.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        role={onClick ? "button" : undefined}
        style={{
          cursor: onClick ? "pointer" : undefined,
          overflow: radius ? "hidden" : undefined,
          ...style,
        }}
        tabIndex={onClick ? 0 : undefined}
        visibleFrom={visibleFrom}
        w={w}
      >
        <source sizes={sizes} srcSet={entry.avifSrcSet} type="image/avif" />
        <source sizes={sizes} srcSet={entry.webpSrcSet} type="image/webp" />
        <img
          alt={alt}
          decoding="async"
          fetchPriority={fetchPriority}
          loading={loading}
          {...(ariaHidden ? ({ "aria-hidden": true } as const) : {})}
          sizes={sizes}
          src={entry.fallbackSrc}
          srcSet={entry.fallbackSrcSet}
          style={{
            borderRadius: borderRadiusValue,
            height: h ? "100%" : "auto",
            maxWidth: "100%",
            objectFit: fit,
            width: "100%",
          }}
        />
      </Box>
    );
  }

  const optimizedSource = finalSource
    ? buildOptimizedImageUrl({ src: finalSource, width: 1080 })
    : finalSource;
  const optimizedSourceSet = finalSource
    ? buildOptimizedImageSourceSet({
        src: finalSource,
        widths: REMOTE_IMAGE_WIDTHS,
      })
    : undefined;

  return (
    <ImageMantine
      {...mantineOnlyProps}
      alt={alt}
      className={mergedClassName || undefined}
      decoding="async"
      fetchPriority={fetchPriority}
      fit={fit}
      h={h}
      hiddenFrom={hiddenFrom}
      loading={loading}
      mah={mah}
      maw={maw}
      mih={mih}
      miw={miw}
      onClick={onClick}
      radius={radius}
      sizes={sizes}
      src={optimizedSource}
      srcSet={optimizedSourceSet}
      style={style}
      visibleFrom={visibleFrom}
      w={w}
      {...(ariaHidden ? { "aria-hidden": true } : {})}
    />
  );
};

export const Image = memo(ImageToMemoize);
