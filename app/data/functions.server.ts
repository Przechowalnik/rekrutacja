import { randomInt } from "node:crypto";

import { getDistance } from "geolib";
import slugify from "slugify";

import { E_Language } from "~/models/enums";

import { E_LanguagesServer } from "./models.server";

const englishRoute = E_Language.EN.toLowerCase();

export const isEnglishRequest = (request: Request): boolean => {
  const url = new URL(request.url);

  // 1. Direct check for non-API routes
  if (
    url.pathname.startsWith(`/${englishRoute}/`) ||
    url.pathname === `/${englishRoute}`
  ) {
    return true;
  }

  // 2. Check Referer header (works when browser sends it)
  const referer = request.headers.get("Referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (
        refererUrl.pathname.startsWith(`/${englishRoute}/`) ||
        refererUrl.pathname === `/${englishRoute}`
      ) {
        return true;
      }
    } catch {
      // Invalid referer URL, continue to next check
    }
  }

  // 3. Check currentLang or userLang cookie as fallback
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map(c => c.trim());
    for (const c of cookies) {
      // currentLang is set by entry.server.tsx for all page visits
      if (c.startsWith("currentLang=")) {
        const langValue = c.slice("currentLang=".length).toLowerCase();
        return langValue === englishRoute;
      }
      // userLang is set for logged-in users
      if (c.startsWith("userLang=")) {
        const langValue = c.slice("userLang=".length).toLowerCase();
        return langValue === englishRoute;
      }
    }
  }

  return false;
};

export const getLocalizedRedirectPath = (
  path: string,
  request: Request,
): string => {
  if (!isEnglishRequest(request)) {
    return path;
  }
  if (path.startsWith(`/${englishRoute}`) || path.startsWith("/api")) {
    return path;
  }
  return `/${englishRoute}${path}`;
};

export const getLocalizedPathByLang = (path: string, lang: string): string => {
  if (lang.toLowerCase() === englishRoute) {
    if (path.startsWith(`/${englishRoute}`) || path.startsWith("/api")) {
      return path;
    }
    return `/${englishRoute}${path}`;
  }
  return path;
};

export function detectLangFromRequest(request: Request) {
  return isEnglishRequest(request)
    ? E_LanguagesServer.EN
    : E_LanguagesServer.PL;
}

export async function waitForAction(time = 1000) {
  await new Promise(resolve => setTimeout(resolve, time));
}

export function generateRandomDigits(howMany: number): string {
  let result = "";

  const firstDigit = randomInt(1, 10);
  result += firstDigit.toString();

  for (let index = 1; index < howMany; index++) {
    const randomDigit = randomInt(0, 10);
    result += randomDigit.toString();
  }

  return result;
}

export const generateRandomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;

  for (let index = 0; index < length; index++) {
    const randomIndex = randomInt(0, charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
};

const getRandomChar = (charSet: string): string => {
  const randomIndex: number = randomInt(0, charSet.length);
  return charSet.charAt(randomIndex);
};

export function generatePassword(passwordLength: number = 16): string {
  const specialChars = "!@#$%&";
  const numbers = "0123456789";
  const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";

  const allowedSpecialChars: string =
    specialChars + numbers + upperCaseLetters + lowerCaseLetters;

  const generateRandomPassword = (): string => {
    let password = "";

    password += getRandomChar(upperCaseLetters);
    password += getRandomChar(upperCaseLetters);
    password += getRandomChar(specialChars);
    password += getRandomChar(specialChars);
    password += getRandomChar(numbers);
    password += getRandomChar(numbers);

    for (let index = 0; index < passwordLength - 6; index++) {
      let randomChar: string = getRandomChar(allowedSpecialChars);
      while (
        [
          ".",
          ",",
          ";",
          "-",
          "_",
          " ",
          ":",
          "^",
          "(",
          ")",
          "[",
          "]",
          "<",
          ">",
          "}",
          "{",
        ].includes(randomChar)
      ) {
        randomChar = getRandomChar(allowedSpecialChars);
      }
      password += randomChar;
    }

    const chars = [...password];
    for (let index = chars.length - 1; index > 0; index--) {
      const index_ = randomInt(0, index + 1);
      const temp = chars[index]!;
      chars[index] = chars[index_]!;
      chars[index_] = temp;
    }
    return chars.join("").slice(0, passwordLength);
  };

  return generateRandomPassword();
}

export function generateDomainLink(request: Request) {
  const headers = request.headers;

  const isLocalhost = headers.get("host")?.includes("localhost");

  let domain: null | string = null;

  if (isLocalhost) {
    domain = `http://localhost:${process.env.PORT || 5173}`;
  } else {
    const protocol = headers.get("x-forwarded-proto") || "https";
    const host = headers.get("host");
    domain = `${protocol}://${host}`;
  }

  return domain;
}

export function addHyphenToPostalCode(postalCode: number): string {
  const postalCodeString = postalCode.toString();
  if (postalCodeString.length !== 5) {
    return "";
  }
  return `${postalCodeString.slice(0, 2)}-${postalCodeString.slice(2)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNumberOrBooleanAndConvert(value: any): any {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    } else if (value.toLowerCase() === "false") {
      return false;
    }

    const convertedNumber = Number(value);
    return Number.isNaN(convertedNumber) ? value : convertedNumber;
  }

  return value;
}

export function reduceMultipleSpaces(input: string): string {
  const trimmedInput = input.replace(/^ +/, "");
  return trimmedInput.replaceAll(/ {2,}/g, " ").trim();
}

export const convertToCorrectSlug = (value: string) => {
  return slugify(reduceMultipleSpaces(value).replaceAll("_", "-") ?? "", {
    lower: true,
    replacement: "-",
    strict: true,
    trim: true,
  });
};

type AllowedKeys<T extends Record<string, unknown>> = { [K in keyof T]: true };

export const hasUnexpectedKeys = <T extends Record<string, unknown>>({
  allowedKeys,
  object,
}: {
  allowedKeys: AllowedKeys<T>;
  object: T;
}): boolean => {
  return Object.keys(object).some(key => !(key in allowedKeys));
};

type T_GenerateIdsToConnectOrDisconnectItem = {
  id: string;
};

type T_GenerateIdsToConnectOrDisconnect = {
  itemsFromDb: T_GenerateIdsToConnectOrDisconnectItem[];
  newItems: string[];
};

export const generateIdsToConnectOrDisconnect = ({
  itemsFromDb,
  newItems,
}: T_GenerateIdsToConnectOrDisconnect) => {
  const idsToDisconnect =
    itemsFromDb
      .filter(item => {
        const isOldAdditionInNewAdditions = newItems.includes(item.id);
        return !isOldAdditionInNewAdditions;
      })
      ?.map(item => item.id) ?? [];

  const idsToConnect = newItems.filter(item => {
    const isNewAdditionInOldAdditions = itemsFromDb.some(
      itemAddition => itemAddition.id === item,
    );
    return !isNewAdditionInOldAdditions;
  });

  return {
    idsToConnect,
    idsToDisconnect,
  };
};

type LocationWithRadius = {
  latitude: number;
  longitude: number;
  radius?: number;
};

type Location = {
  latitude: number;
  longitude: number;
};

export function getDistanceFromServiceToLocation({
  pointA,
  pointB,
}: {
  pointA: LocationWithRadius;
  pointB: Location;
}) {
  const distance = getDistance(pointA, pointB);

  const radiusInMeters = pointA.radius ? pointA.radius * 1000 : undefined;

  const isInRadius = radiusInMeters ? distance <= radiusInMeters : true;

  return {
    distanceInKm: distance / 1000,
    distanceInMeters: distance,
    isInRadius,
  };
}

const toNumber = (value: bigint | number): number =>
  typeof value === "bigint" ? Number(value) : value;

export const calculatePointsFromMonths = ({
  months,
  product,
}: {
  months: number;
  product: {
    points_1: bigint;
    points_2_5: bigint;
    points_6_plus: bigint;
  };
}) => {
  if (months <= 0) {
    return 0;
  }

  let pointsPerMonth: number;

  if (months === 1) {
    pointsPerMonth = toNumber(product.points_1);
  } else if (months >= 2 && months <= 5) {
    pointsPerMonth = toNumber(product.points_2_5);
  } else {
    pointsPerMonth = toNumber(product.points_6_plus);
  }

  return months * pointsPerMonth;
};

type T_GeoPoint = {
  lat: number;
  lng: number;
};

export function haversineKm({
  city,
  locationToCheck,
}: {
  city: T_GeoPoint;
  locationToCheck: T_GeoPoint;
}): number {
  const EARTH_RADIUS_KM = 6371;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const cityLat = toRad(city.lat);
  const locationLat = toRad(locationToCheck.lat);

  const dLat = toRad(locationToCheck.lat - city.lat);
  const dLng = toRad(locationToCheck.lng - city.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(cityLat) * Math.cos(locationLat) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function boundingBoxKm({
  location,
  radiusKm = 50,
}: {
  location: T_GeoPoint;
  radiusKm?: number;
}) {
  const latDelta = radiusKm / 110.574;
  const cosLat = Math.cos((location.lat * Math.PI) / 180);
  const safeCosLat = Math.max(0.000_001, Math.abs(cosLat));
  const lngDelta = radiusKm / (111.32 * safeCosLat);

  return {
    maxLat: location.lat + latDelta,
    maxLng: location.lng + lngDelta,
    minLat: location.lat - latDelta,
    minLng: location.lng - lngDelta,
  };
}

export function normalizeSearch(text: string) {
  return slugify(text, {
    locale: "pl",
    lower: true,
    strict: true,
  });
}

export function extractApartmentNumber(address: string): string | undefined {
  // Search type "/12", "m12", "lok. 3", "m 1" itp.
  const regex = /[\s/-]?(?:m|lok\.?)\s*([\da-z]+)/i;
  const match = regex.exec(address);
  return match?.[1];
}
