import { TFunction } from "i18next";

import { T_SeoImage } from "~/ui/PageMeta";

import { links } from "./links";

export const getCompanySeoImage = ({
  tCommon,
  tSeo,
}: {
  tCommon: TFunction<"common", undefined>;
  tSeo: TFunction<"seo", undefined>;
}): T_SeoImage => {
  return {
    alt: tSeo("socials.default.imageAlt", {
      companyName: tCommon("company.name"),
    }),
    height: "630px",
    type: "image/png",
    url: `${links.baseUrl}/og-image.png`,
    width: "1200px",
  };
};
