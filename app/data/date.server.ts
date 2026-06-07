/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from "dayjs";

export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export function hasDateExpired(endDateToValid: string): boolean {
  const now = dayjs();
  const endDate = dayjs(endDateToValid);

  return endDate.isBefore(now);
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

export function isAfterOrSame({
  dateEnd,
  dateToCheck,
}: {
  dateEnd: Date | dayjs.Dayjs | string;
  dateToCheck: Date | dayjs.Dayjs | string;
}): boolean {
  const parsedDate1 = dayjs(dateToCheck);
  const parsedDate2 = dayjs(dateEnd);

  return parsedDate1.isAfter(parsedDate2) || parsedDate1.isSame(parsedDate2);
}
