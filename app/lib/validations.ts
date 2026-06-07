import dayjs from "dayjs";
import slugify from "slugify";

export function reduceMultipleSpaces(input: string): string {
  const trimmedInput = input.replace(/^ +/, "");
  return trimmedInput.replaceAll(/ {2,}/g, " ").trim();
}

export function removeNonNumericCharacters(input: string): string {
  return input.replaceAll(/\D/g, "");
}

export function reduceMultipleSpacesWithoutTrim(input: string): string {
  const trimmedInput = input.replace(/^ +/, "");
  return trimmedInput.replaceAll(/ {2,}/g, " ");
}

export const validEmail = (email: string): boolean => {
  const normalized = reduceMultipleSpaces(email).toLowerCase().trim();

  const emailRegex = /^(?!.*\.\.)([\w%+.-]+)@([\da-z-]+\.)+[a-z]{2,}$/i;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, domain] = normalized.split("@");
  if (
    !domain ||
    domain.startsWith("-") ||
    domain.startsWith(".") ||
    domain.endsWith("-") ||
    domain.endsWith(".")
  ) {
    return false;
  }

  return emailRegex.test(normalized);
};

type T_ValidStringMinLength = {
  minLength: number;
  value: string;
};

export const validStringMinLength = ({
  minLength = 12,
  value,
}: T_ValidStringMinLength): boolean => {
  return reduceMultipleSpaces(value).length >= minLength;
};

type T_ValidStringMinAndMaxLength = {
  maxLength: number;
  minLength: number;
  value: string;
};

export const validStringMinAndMaxLength = ({
  maxLength = 30,
  minLength = 12,
  value,
}: T_ValidStringMinAndMaxLength): boolean => {
  const length = reduceMultipleSpaces(value).length;
  return length >= minLength && length <= maxLength;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFile(input: any): input is File {
  return input instanceof File;
}

export function isNumeric(value: string): boolean {
  return !Number.isNaN(Number(value));
}

export function validDate(value: string): boolean {
  return dayjs(value).isValid();
}

export function validDateISO(value: string): boolean {
  const isoRegex =
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)$/;

  return dayjs(value).isValid() && isoRegex.test(value);
}

export const validStringIsNumberMinAndMaxLength = ({
  maxLength = 30,
  minLength = 12,
  value,
}: T_ValidStringMinAndMaxLength): boolean => {
  const length = reduceMultipleSpaces(value).length;
  return length >= minLength && length <= maxLength && isNumeric(value);
};

type T_ValidNumberInRange = {
  max?: number;
  min?: number;
  value: number;
};

export const validNumberInRange = ({
  max = Number.MAX_SAFE_INTEGER,
  min = Number.MIN_SAFE_INTEGER,
  value,
}: T_ValidNumberInRange): boolean => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return false;
  }

  return value >= min && value <= max;
};

export const validatePaymentMethodId = (paymentMethodId: string): boolean => {
  const paymentMethodIdPattern = /^pm_[\dA-Za-z]{24,}$/;
  return paymentMethodIdPattern.test(paymentMethodId);
};

export function removeSpecialCharacterFromString(value: string): string {
  return value.replaceAll("-", "");
}

export function splitPhoneNumber(phoneNumber: string): {
  phoneCountryCode: null | string;
  phoneNumber: null | string;
} {
  const regex = /^\+(\d+)\s([\d-]+)$/;
  const match = regex.exec(phoneNumber.trim());

  if (match) {
    const matchedCountryCode = match?.[1] ?? null;
    const matchedPhoneNumber = match?.[2]?.replaceAll("-", "") ?? null;

    return {
      phoneCountryCode: matchedCountryCode,
      phoneNumber: matchedPhoneNumber,
    };
  }

  return {
    phoneCountryCode: null,
    phoneNumber: null,
  };
}

export function insertHyphens(input: string, validIndexToInsert = 3): string {
  let result = "";
  for (let index = 0; index < input.length; index++) {
    result += input[index];
    if ((index + 1) % validIndexToInsert === 0 && index + 1 !== input.length) {
      result += "-";
    }
  }
  return result;
}

type T_ShowPhoneNumber = {
  phoneCountryCode: number;
  phoneNumber: bigint | number;
};

export const showPhoneNumber = ({
  phoneCountryCode,
  phoneNumber,
}: T_ShowPhoneNumber) => {
  return `+${phoneCountryCode} ${insertHyphens(`${phoneNumber}`)}`;
};

export function isValidPostalCode(postalCode: string): boolean {
  const regex = /^\d{2}-\d{3}$/;
  return regex.test(reduceMultipleSpaces(postalCode));
}

export function removeHyphenFromPostalCode(postalCode: string): number {
  return Number(reduceMultipleSpaces(postalCode).replace("-", ""));
}

type T_CheckObjectsChanges = {
  newObject: object | string;
  oldObject: object | string;
};

export const checkObjectsChanges = ({
  newObject,
  oldObject,
}: T_CheckObjectsChanges) => {
  return JSON.stringify(oldObject) !== JSON.stringify(newObject);
};

export const convertToValidString = (value: string) => {
  let string_ = reduceMultipleSpaces(value.toLowerCase()).trim();
  const charMap = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
  };
  string_ = string_.replaceAll(
    /([óąćęłńśźż])/g,
    (_, key: string) => charMap[key as keyof typeof charMap],
  );
  string_ = string_.replaceAll(/[^\d\sa-z-]/gi, "");
  string_ = string_.replaceAll(/(^\s+)|(\s+$)/g, "");
  return string_;
};

export const convertToCorrectSlug = (value: string) => {
  return slugify(reduceMultipleSpaces(value).replaceAll("_", "-") ?? "", {
    lower: true,
    replacement: "-",
    strict: true,
    trim: true,
  });
};

export const getLastStringAfterDash = (text: string): string => {
  const dashIndex = text.lastIndexOf("-");
  if (dashIndex === -1) {
    return text;
  }

  return text.slice(dashIndex + 1);
};

type T_CheckObjectKeys<T> = {
  keys: Array<keyof T>;
  obj: T;
};

export function checkObjectKeys<T extends object>({
  keys,
  obj,
}: T_CheckObjectKeys<T>): boolean {
  return keys.every(
    key => Object.hasOwn(obj, key) && typeof obj[key] === "string",
  );
}

export const validOneUppercaseAndOneLowerCaseLetter = (text: string) => {
  return /[a-z]/.test(text) && /[A-Z]/.test(text);
};

export const validOneSpecialCharacter = (text: string) => {
  return /[!"#$%&'()*+,./:;<=>?@[\\\]^_{|}-]/.test(text);
};

export const validHasNumber = (text: string): boolean => /\d/.test(text);

export const validPassword = (password: string) => {
  const sanitizedPassword = reduceMultipleSpaces(password);
  const lengthRequirement = validStringMinAndMaxLength({
    maxLength: 40,
    minLength: 6,
    value: sanitizedPassword,
  });
  const hasUpperCaseAndLowerCase =
    validOneUppercaseAndOneLowerCaseLetter(sanitizedPassword);
  const hasSpecialCharacter = validOneSpecialCharacter(sanitizedPassword);

  return lengthRequirement && hasUpperCaseAndLowerCase && hasSpecialCharacter;
};

export function removeStreetPrefix(address: string) {
  const validAddress = reduceMultipleSpaces(address);
  if (validAddress.startsWith("ul. ")) {
    return validAddress.slice(4);
  }
  return validAddress;
}
