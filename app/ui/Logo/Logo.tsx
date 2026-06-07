import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";

import { Image } from "../Image";

type T_Logo = {
  dark?: boolean;
  height?: string;
  light?: boolean;
  minHeight?: string;
  minWidth?: string;
  width?: string;
};

export const Logo = ({
  dark,
  height = "42.6px",
  light,
  minHeight,
  minWidth,
  width = "150px",
}: T_Logo) => {
  const { t: tSeo } = useTranslation(namespaces.seo);

  return (
    <Image
      alt={tSeo("imagesAlt.logo")}
      customSrc={
        dark
          ? "/logo/logo-light.svg"
          : light
            ? "/logo/logo-dark.svg"
            : undefined
      }
      h={height}
      mih={minHeight}
      miw={minWidth}
      path={
        !dark && !light
          ? {
              format: "svg",
              pathWithColorMode: true,
              src: "/logo/logo",
            }
          : undefined
      }
      w={width}
    />
  );
};
