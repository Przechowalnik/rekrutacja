import { MantineSize } from "@mantine/core";
import {
  disableBodyScroll as disableScroll,
  enableBodyScroll as enableScroll,
} from "body-scroll-lock";
import DOMPurify from "dompurify";
import slugify from "slugify";

import { convertToValidString } from "~/lib/validations";
import { E_Roles, T_CompanyWorkerPermissions } from "~/models/enums";
import type { T_UserSession } from "~/models/userSession";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const countSpaces = (text: string): number => {
  return text.split(" ").length - 1;
};

export async function waitForAction(time = 1000) {
  await new Promise(resolve => setTimeout(resolve, time));
}

function sortObjectKeys(object: { [key: string]: any }): {
  [key: string]: any;
} {
  const sortedObject: { [key: string]: any } = {};
  const keys = Object.keys(object).sort((a, b) => a.localeCompare(b));
  for (const key of keys) {
    sortedObject[key] =
      typeof object[key] === "object" &&
      object[key] !== null &&
      !Array.isArray(object[key])
        ? sortObjectKeys(object[key])
        : object[key];
  }
  return sortedObject;
}

export function arraysEqual({
  array1,
  array2,
  ignoreCaseInsensitive,
}: {
  array1: any[];
  array2: any[];
  ignoreCaseInsensitive?: boolean;
}): boolean {
  if (array1.length !== array2.length) {
    return false;
  }

  const sortedArray1 = [...array1].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );
  const sortedArray2 = [...array2].sort((a, b) =>
    String(a).localeCompare(String(b)),
  );

  for (const [index, element] of sortedArray1.entries()) {
    if (
      !deepEqual({
        ignoreCaseInsensitive,
        object1: element,
        object2: sortedArray2[index],
      })
    ) {
      return false;
    }
  }
  return true;
}

function deepEqual({
  ignoreCaseInsensitive,
  object1,
  object2,
}: {
  ignoreCaseInsensitive?: boolean;
  object1: any;
  object2: any;
}): boolean {
  if (object1 === object2) {
    return true;
  }

  if (
    object1 === null ||
    object2 === null ||
    typeof object1 !== "object" ||
    typeof object2 !== "object"
  ) {
    return false;
  }

  if (Array.isArray(object1) && Array.isArray(object2)) {
    if (object1.length !== object2.length) {
      return false;
    }

    const isArrayEqual = arraysEqual({
      array1: object1,
      array2: object2,
      ignoreCaseInsensitive,
    });

    return isArrayEqual;
  }

  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key)) {
      return false;
    }

    const value1_ = object1[key];
    const value2_ = object2[key];

    const value1 =
      typeof value1_ === "string" && ignoreCaseInsensitive
        ? value1_.toLowerCase()
        : value1_;
    const value2 =
      typeof value2_ === "string" && ignoreCaseInsensitive
        ? value2_.toLowerCase()
        : value2_;

    if (
      !deepEqual({ ignoreCaseInsensitive, object1: value1, object2: value2 })
    ) {
      return false;
    }
  }

  return true;
}

export function compareObjects({
  ignoreCaseInsensitive,
  object1,
  object2,
}: {
  ignoreCaseInsensitive?: boolean;
  object1: { [key: string]: any };
  object2: { [key: string]: any };
}): boolean {
  const sortedObject1 = sortObjectKeys(object1);
  const sortedObject2 = sortObjectKeys(object2);
  return deepEqual({
    ignoreCaseInsensitive,
    object1: sortedObject1,
    object2: sortedObject2,
  });
}

export function arraysMatch(array1: string[], array2: string[]): boolean {
  if (array1.length !== array2.length) {
    return false;
  }

  const sortedArray1 = [...array1].sort((a, b) => a.localeCompare(b));
  const sortedArray2 = [...array2].sort((a, b) => a.localeCompare(b));

  return sortedArray1.every((value, index) => value === sortedArray2[index]);
}

export function formatReferralCode(code: string): string {
  if (code.length === 12) {
    return `${code.slice(0, 4)} ${code.slice(4, 8)} ${code.slice(8)}`;
  }
  return code;
}

export function findFirstFreeIndex({
  excludedIndices,
  maxIndex,
}: {
  excludedIndices: number[];
  maxIndex: number;
}): null | number {
  for (let index = 0; index <= maxIndex; index++) {
    if (!excludedIndices.includes(index)) {
      return index;
    }
  }

  return null;
}

export function containsWordsInAnyText({
  matchThreshold = 0.8,
  query,
  text,
}: {
  matchThreshold?: number;
  query: string;
  text: string;
}): boolean {
  if (!query) {
    return true;
  }

  const cleanText = convertToValidString(text)
    .replaceAll(/<\/?[^>]+(\/)?>/g, "")
    .toLowerCase();
  const cleanQuery = convertToValidString(query)
    .replaceAll(/<\/?[^>]+(\/)?>/g, "")
    .toLowerCase();

  const textWords = cleanText.split(" ").filter(Boolean);
  const queryWords = cleanQuery.split(" ").filter(Boolean);

  if (queryWords.length === 0) {
    return false;
  }

  const matchCount = queryWords.filter(queryWord =>
    textWords.some(textWord => textWord.includes(queryWord)),
  ).length;

  const matchRatio = matchCount / queryWords.length;

  return matchRatio >= matchThreshold;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isSocialMediaUrl({
  socialMedia,
  url,
}: {
  socialMedia: "facebook" | "instagram" | "tiktok";
  url: string;
}): boolean {
  let regex: RegExp;

  switch (socialMedia) {
    case "instagram": {
      regex = /^(https?:\/\/)?(www\.)?instagram\.com\/(\w+)\/?$/i;
      break;
    }
    case "tiktok": {
      regex = /^(https?:\/\/)?(www\.)?tiktok\.com\/@[\w.]+\/?$/i;
      break;
    }
    case "facebook": {
      regex = /^(https?:\/\/)?(www\.)?facebook\.com\/([\d.a-z]+)\/?$/i;
      break;
    }
    default: {
      return false;
    }
  }

  return regex.test(url.trim());
}

type T_LocationCity = {
  id: string;
  name: string;
  nameSearch: string;
} | null;

type T_LocationDistrict = {
  id: string;
  name: string;
  nameSearch: string;
} | null;

type T_GenerateLocationAddress = {
  city: null | T_LocationCity;
  cityCustom: null | string;
  district: null | T_LocationDistrict;
  flatNumber?: null | string;
  streetName: string;
  streetNumber: string;
};

export const generateLocationAddress = (
  companyLocation: T_GenerateLocationAddress,
): string => {
  const cityName =
    companyLocation.city?.name || companyLocation.cityCustom || "";
  const districtName = companyLocation.district?.name;

  return `${cityName}${districtName ? ` (${districtName})` : ""}, ${companyLocation.streetName} ${companyLocation.streetNumber}${companyLocation.flatNumber ? ` / ${companyLocation.flatNumber}` : ""}`;
};

export const generateLocationAddressLastCity = ({
  location,
}: {
  location: T_GenerateLocationAddress;
}): string => {
  const cityName = location.city?.name || location.cityCustom || "";
  const districtName = location.district?.name;

  return `${location.streetName} ${location.streetNumber}${location.flatNumber ? ` / ${location.flatNumber}` : ""}, ${cityName}${districtName ? ` (${districtName})` : ""}`;
};

interface FieldMessage {
  field: string;
  message: string;
}

export function reduceToUniqueFields(array: FieldMessage[]): FieldMessage[] {
  const uniqueMap = new Map<string, FieldMessage>();

  for (const item of array) {
    if (!uniqueMap.has(item.field)) {
      uniqueMap.set(item.field, item);
    }
  }

  return [...uniqueMap.values()];
}

type OmitNested<T> = {
  [K in keyof T]?: T[K] extends object ? false | OmitNested<T[K]> : false;
};

export const omitNested = <T>(object: T, keys: OmitNested<T>): T => {
  if (typeof object !== "object" || object === null) {
    return object;
  }

  const result = { ...object } as T;
  for (const key in keys) {
    if (keys[key] === false) {
      delete (result as any)[key];
    } else if (
      typeof keys[key] === "object" &&
      typeof result[key] === "object"
    ) {
      (result as any)[key] = omitNested(
        result[key],
        keys[key] as OmitNested<T[typeof key]>,
      );
    }
  }
  return result;
};

const sizeOrder: MantineSize[] = ["xs", "sm", "md", "lg", "xl"];

export function getNextMantineSize({
  size,
}: {
  size: MantineSize;
}): MantineSize {
  const index = sizeOrder.indexOf(size);

  if (index === -1 || index >= sizeOrder.length - 1) {
    return size;
  }

  return sizeOrder[index + 1] as MantineSize;
}

export const isNumber = (value: any): boolean => {
  return value === null || value === undefined || value === ""
    ? false
    : !Number.isNaN(Number(value));
};

const getScrollPosition = () => {
  return (
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );
};

const isIOS = () => {
  return /iP(ad|hone|od)/.test(globalThis.navigator.userAgent);
};

let scrollPosition = 0;

const navSelector = "nav";

export function disableBodyScroll(timeout?: number) {
  if (typeof timeout === "number") {
    setTimeout(() => {
      disableBodyScrollFunction();
    }, timeout);
  } else {
    disableBodyScrollFunction();
  }
}

function disableBodyScrollFunction() {
  const nav = document.querySelector(navSelector);

  if (isIOS()) {
    scrollPosition = getScrollPosition();

    if (nav instanceof HTMLElement) {
      nav.style.paddingRight = "24px";
    }

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.paddingRight = "0";
  } else {
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    if (nav instanceof HTMLElement) {
      nav.style.paddingRight = `${scrollBarWidth}px`;
    }
    document.body.style.paddingRight = `${scrollBarWidth}px`;

    disableScroll(document.documentElement, { reserveScrollBarGap: false });
  }
}

function enableBodyScrollFunction() {
  const nav = document.querySelector(navSelector);

  if (isIOS()) {
    if (nav instanceof HTMLElement) {
      nav.style.paddingRight = "";
    }

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.paddingRight = "";

    window.scrollTo(0, scrollPosition);
  } else {
    if (nav instanceof HTMLElement) {
      nav.style.paddingRight = "";
    }
    document.body.style.paddingRight = "";

    enableScroll(document.documentElement);
  }
}

export function enableBodyScroll(timeout?: number) {
  if (typeof timeout === "number") {
    setTimeout(() => {
      enableBodyScrollFunction();
    }, timeout);
  } else {
    enableBodyScrollFunction();
  }
}

export function isNonEmptyObject<T extends object>(
  object: null | T | undefined,
): object is T & Record<string, unknown> {
  return (
    typeof object === "object" &&
    object !== null &&
    !Array.isArray(object) &&
    Object.keys(object).length > 0
  );
}

export const isTodayOrFuture = ({ isoDate }: { isoDate: string }): boolean => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const inputDate = new Date(isoDate);

  return inputDate >= today;
};

function formatWithDashes({
  numberToFormat,
}: {
  numberToFormat: number;
}): string {
  return numberToFormat.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, "-");
}

type T_GeneratePhoneToShow = {
  phone:
    | {
        countryCode: null | number;
        number: bigint | null | number;
        verifiedAt?: Date | null | string;
      }
    | null
    | undefined;
  safeReturn?: boolean;
  withCountryCode?: boolean;
  withVerified?: boolean;
};

export const generatePhoneToShow = ({
  phone,
  safeReturn = true,
  withCountryCode = true,
  withVerified = true,
}: T_GeneratePhoneToShow) => {
  if (!phone) {
    return safeReturn ? "-" : null;
  }

  const isVerified = withVerified ? phone?.verifiedAt : true;
  const hasPhoneData = isVerified && phone?.countryCode && phone?.number;

  if (!hasPhoneData) {
    return safeReturn ? "-" : null;
  }

  const countryCodePrefix = withCountryCode ? `(+${phone.countryCode}) ` : "";

  return `${countryCodePrefix}${formatWithDashes({
    numberToFormat: Number(phone.number),
  })}`;
};

export function containsHtmlTags({ text }: { text: string }): boolean {
  const pattern = /<[^>]+>/;
  return pattern.test(text);
}

export function truncateText({
  ellipsis = true,
  maxLength = 400,
  text,
}: {
  ellipsis?: boolean;
  maxLength: number;
  text: string;
}) {
  if (!text) {
    return "";
  }
  if (text.length <= maxLength) {
    return text;
  }

  if (ellipsis) {
    const truncated = text.slice(0, maxLength - 3).trim();
    return truncated + "…";
  } else {
    return text.slice(0, maxLength).trim();
  }
}

export function toCamelCase(string_: string): string {
  return string_.replaceAll(/-([a-z])/g, (_, char) => char.toUpperCase());
}

export const safeHtml = ({ element }: { element: string }) => {
  if (globalThis.window === undefined) {
    return element;
  }

  return DOMPurify.sanitize(element, {
    USE_PROFILES: { html: true },
  });
};

export function normalizeSearch(text: string) {
  return slugify(text, {
    locale: "pl",
    lower: true,
    strict: true,
  });
}

export const checkCompanyUserPermissions = ({
  permissions,
  user,
}: {
  permissions: T_CompanyWorkerPermissions[];
  user: null | T_UserSession;
}) => {
  if (user?.role?.includes(E_Roles.B2B_OWNER)) {
    return true;
  }

  if (!user?.company || !user?.workerSettings?.permissions) {
    return false;
  }

  return permissions.some(permission =>
    user?.workerSettings?.permissions?.includes(permission),
  );
};
