// import { resolve } from "node:path";

import { RemixI18Next } from "remix-i18next/server";

import i18n from "~/localization/i18n"; // your i18n configuration file

import { resourcesToSend } from "./resourcesToSend";

const i18next = new RemixI18Next({
  detection: {
    fallbackLanguage: i18n.fallbackLng,
    supportedLanguages: i18n.supportedLngs,
  },
  i18next: {
    ...i18n,
    resources: resourcesToSend,
  },
});

export default i18next;
