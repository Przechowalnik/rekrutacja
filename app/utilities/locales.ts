/* eslint-disable @typescript-eslint/no-unused-vars */
import type { i18n } from "i18next";

import { namespaces } from "~/constants/namespaces";

type DictionaryKey = "countriesCode" | "listingCity" | "listingCityDistrict";

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export function getLocalizedValue({
  dictionaryKey,
  i18n,
  translateToLang,
  value,
}: {
  dictionaryKey: DictionaryKey;
  i18n: i18n;
  translateToLang: "en" | "pl";
  value?: string;
}): string | undefined {
  if (!value) {
    return undefined;
  }

  const upper = value.trim().toUpperCase();

  const targetBundle = i18n.getResourceBundle(
    translateToLang,
    namespaces.common,
  )?.[dictionaryKey];

  if (targetBundle) {
    const dict = targetBundle as Record<string, string>;

    if (dict[upper]) {
      return dict[upper];
    }

    const found = Object.entries(dict).find(
      ([_, value_]) => value_.trim().toUpperCase() === upper,
    );

    if (found) {
      const translated = found[0];
      return translated.charAt(0) + translated.slice(1).toLowerCase();
    }
  }

  const otherLang = translateToLang === "en" ? "pl" : "en";

  const otherBundle = i18n.getResourceBundle(otherLang, namespaces.common)?.[
    dictionaryKey
  ] as Record<string, string> | undefined;

  if (otherBundle) {
    const foundInOther = Object.entries(otherBundle).find(
      ([_, value_]) =>
        typeof value_ === "string" && value_.trim().toUpperCase() === upper,
    );

    if (foundInOther) {
      const key = foundInOther[0];

      const targetBundle = i18n.getResourceBundle(
        translateToLang,
        namespaces.common,
      )?.[dictionaryKey] as Record<string, string> | undefined;

      if (targetBundle?.[key]) {
        return targetBundle[key];
      }

      return titleCase(key);
    }
  }
  return value;
}
