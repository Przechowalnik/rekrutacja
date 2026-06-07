import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isLeapYear from "dayjs/plugin/isLeapYear";
import isoWeek from "dayjs/plugin/isoWeek";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { z } from "zod";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);
dayjs.extend(isSameOrBefore);

export function zodDateValidator() {
  return z.union([
    z.date(),
    z.string().refine(value => !Number.isNaN(Date.parse(value)), {
      message: "Invalid date string",
    }),
  ]);
}

export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const capitalizeFirstAllLetter = (text: string) => {
  return text
    .split(" ")
    .map(item => capitalizeFirstLetter(item))
    .join(" ");
};

const validLengthDateNumber = (value: number) => {
  return value < 10 ? `0${value}` : value;
};

export const replaceDateToYearMonthInWordsDay = (date: string) => {
  const dateInDayjs = dayjs(date).format("D-MMMM-YYYY");
  const splitDate = dateInDayjs.split("-");
  const [day, month, year] = splitDate;

  if (!day || !month || !year) {
    return "";
  }

  return `${day} ${capitalizeFirstLetter(month)} ${year}`;
};

export const replaceDateToYearMonthHoursMinutesInWordsDay = ({
  date,
  withNbsp = true,
}: {
  date: string;
  withNbsp?: boolean;
}) => {
  const currentDate = dayjs(date);
  const dateInDayjs = currentDate.format("D-MMMM-YYYY");
  const splitDate = dateInDayjs.split("-");
  const [day, month, year] = splitDate;

  if (!day || !month || !year) {
    return "";
  }

  const validNbsp = withNbsp ? "&nbsp;" : " ";

  return `${day}${validNbsp}${capitalizeFirstLetter(
    month,
  )}${validNbsp}${year},${validNbsp}${validLengthDateNumber(
    currentDate.hour(),
  )}:${validLengthDateNumber(currentDate.minute())}`;
};

export const correctDateNumber = (dateNumber: number) => {
  return dateNumber >= 10 ? dateNumber : `0${dateNumber}`;
};

export const replaceDateToYearMonthDay = (date: string) => {
  const dateInDayjs = dayjs(date);

  const day = correctDateNumber(dateInDayjs.date());
  const month = correctDateNumber(dateInDayjs.month() + 1);

  return `${day}-${month}-${dateInDayjs.year()}`;
};

export const replaceDateInDayjsToYearMonthDay = (date: Dayjs) => {
  const day = correctDateNumber(date.date());
  const month = correctDateNumber(date.month() + 1);

  return `${day}-${month}-${date.year()}`;
};

export const replaceDateToYearMonth = (date: string) => {
  const dateInDayjs = dayjs(date);

  const month = correctDateNumber(dateInDayjs.month() + 1);

  return `${month}-${dateInDayjs.year()}`;
};

export function hasDateExpired(endDateToValid: string): boolean {
  const now = dayjs();
  const endDate = dayjs(endDateToValid);

  return endDate.isBefore(now);
}

export function isExpiringIn({
  days = 0,
  expirationDate,
  months = 0,
}: {
  days?: number;
  expirationDate: Date | string;
  months?: number;
}): boolean {
  const now = dayjs();
  const expiresAt = dayjs(expirationDate);

  const threshold = now.add(days, "day").add(months, "month");

  return expiresAt.isBefore(threshold);
}

export function formatToHourMinute(date: Dayjs): string {
  return date.format("HH:mm");
}

export const findMinMaxDates = (
  dates: Dayjs[],
): { maxDate: Dayjs | null; minDate: Dayjs | null } => {
  if (dates.length === 0) {
    return { maxDate: null, minDate: null };
  }

  let minDate = dates[0] ?? null;
  let maxDate = dates[0] ?? null;

  for (const date of dates) {
    if (date.isBefore(minDate)) {
      minDate = date;
    }
    if (date.isAfter(maxDate)) {
      maxDate = date;
    }
  }

  return { maxDate, minDate };
};

export function isValidDateString(
  dateString: string,
  format: string = "YYYY-MM-DD",
): boolean {
  return dayjs(dateString, format, true).isValid();
}

export const isDateInRange = ({
  date,
  maxDate,
  minDate,
  same = true,
}: {
  date: Dayjs | null;
  maxDate: Dayjs | null;
  minDate: Dayjs | null;
  same?: boolean;
}): boolean => {
  if (!date || !maxDate || !minDate) {
    return false;
  }

  return same
    ? date.isSame(minDate) ||
        date.isSame(maxDate) ||
        (date.isAfter(minDate) && date.isBefore(maxDate))
    : date.isAfter(minDate) && date.isBefore(maxDate);
};

type T_Date = Date | dayjs.Dayjs | string;

export function isBefore({
  dateEnd,
  dateToCheck,
}: {
  dateEnd: T_Date;
  dateToCheck: T_Date;
}): boolean {
  const parsedDate1 = dayjs(dateToCheck);
  const parsedDate2 = dayjs(dateEnd);

  return parsedDate1.isBefore(parsedDate2);
}
export function isBeforeOrSame({
  dateEnd,
  dateToCheck,
}: {
  dateEnd: T_Date;
  dateToCheck: T_Date;
}): boolean {
  const parsedDate1 = dayjs(dateToCheck);
  const parsedDate2 = dayjs(dateEnd);

  return parsedDate1.isBefore(parsedDate2) || parsedDate1.isSame(parsedDate2);
}

export function isAfter({
  dateEnd,
  dateToCheck,
}: {
  dateEnd: T_Date;
  dateToCheck: T_Date;
}): boolean {
  const parsedDate1 = dayjs(dateToCheck);
  const parsedDate2 = dayjs(dateEnd);

  return parsedDate1.isAfter(parsedDate2);
}

export function isAfterOrSame({
  dateEnd,
  dateToCheck,
}: {
  dateEnd: T_Date;
  dateToCheck: T_Date;
}): boolean {
  const parsedDate1 = dayjs(dateToCheck);
  const parsedDate2 = dayjs(dateEnd);

  return parsedDate1.isAfter(parsedDate2) || parsedDate1.isSame(parsedDate2);
}

export function calculateFreeDays({
  dateEnd,
  dateStart,
}: {
  dateEnd: Date | string;
  dateStart: Date | string;
}): number {
  const start = dayjs(dateStart);
  const end = dayjs(dateEnd);

  const difference = end.diff(start, "day");

  return difference >= 0 ? difference + 1 : 0;
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    // eslint-disable-next-line unicorn/prefer-add-event-listener
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
