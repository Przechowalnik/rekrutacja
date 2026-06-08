import dayjs from "dayjs";
import type { infer as ZodInfer, ZodObject, ZodRawShape } from "zod";
import { z } from "zod";

import { formNames, type T_FormNames } from "~/lib/zodFormValidator";
import { E_ListingUtilityOption } from "~/models/enums";

import { isNumberOrBooleanAndConvert } from "./functions.server";
import {
  E_BugEnvironmentServer,
  E_BugPriorityServer,
  E_BugStatusServer,
  E_CompanyWorkerPermissionsServer,
  E_CompanyWorkerRolesWithoutOwnerServer,
  E_CountryCodeServer,
  E_CountryServer,
  E_LanguagesServer,
  E_ListingAccessServer,
  E_ListingCategoryServer,
  E_ListingComfortOptionServer,
  E_ListingConditionServer,
  E_ListingContainerTypeServer,
  E_ListingContractTypeServer,
  E_ListingDeleteReasonServer,
  E_ListingEntryOptionServer,
  E_ListingParkingTypeServer,
  E_ListingPlotTypeServer,
  E_ListingSecurityOptionServer,
  E_ListingStatusServer,
  E_ListingTypeServer,
  E_ListingUnitTypeServer,
  E_ListingUsageOptionServer,
  E_ReportTypeServer,
  E_TaxCountryServer,
} from "./models.server";
import type { T_Messages, T_ResponseOnFailure } from "./response.server";

const hasNumber = (value: string) => /\d/.test(value);
const hasUppercase = (value: string) => /[A-Z]/.test(value);
const hasLowercase = (value: string) => /[a-z]/.test(value);
const hasSpecialCharacter = (value: string) =>
  /[!"#$%&'()*+,./:;<=>?@[\\\]^_{|}-]/.test(value);
const isNotEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(value);
};
const isPostalCode = (value: string): boolean => {
  const regex = /^\d{2}-\d{3}$/;
  return regex.test(value);
};
const isValidDate = (value: string): boolean => {
  const parsedDate = dayjs(value);
  return parsedDate.isValid();
};
const isValidFileImage2MB = (value: Blob | File): boolean => {
  if (value instanceof File || value instanceof Blob) {
    const fileSize = value.size;
    const fileType = value.type;

    return (
      (fileType === "image/jpeg" ||
        fileType === "image/png" ||
        fileType === "image/webp") &&
      fileSize <= 2 * 1024 * 1024
    );
  }

  return false;
};

const isValidFileImage5MB = (value: Blob | File): boolean => {
  if (value instanceof File || value instanceof Blob) {
    const fileSize = value.size;
    const fileType = value.type;

    return (
      (fileType === "image/jpeg" ||
        fileType === "image/png" ||
        fileType === "image/webp") &&
      fileSize <= 5 * 1024 * 1024
    );
  }

  return false;
};

const isValidFileVideo100MB = (value: Blob | File): boolean => {
  if (value instanceof File || value instanceof Blob) {
    const videoFormat = value.type;
    const videoSize = value.size;

    return videoFormat === "video/mp4" && videoSize <= 100 * 1024 * 1024;
  }

  return false;
};

const isPaymentMethodId = (paymentMethodId: string): boolean => {
  const paymentMethodIdPattern = /^pm_[\dA-Za-z]{24,}$/;
  return paymentMethodIdPattern.test(paymentMethodId);
};
const stringToDate = (value: string): Date => {
  const parsedDate = dayjs(value);
  return parsedDate.toDate();
};
const stringToStartDate = (value: string): Date => {
  const parsedDate = dayjs(value).startOf("day");
  return parsedDate.toDate();
};
const stringToEndDate = (value: string): Date => {
  const parsedDate = dayjs(value).endOf("day");
  return parsedDate.toDate();
};

function convertBlobToFile({
  blob,
  filename,
}: {
  blob: Blob;
  filename: string;
}) {
  return new File([blob], filename, { type: blob.type });
}

function getFileNameFromMimeType(blob: Blob): string {
  const mimeType = blob.type;
  let extension = "";

  switch (mimeType) {
    case "image/png": {
      extension = "png";

      break;
    }
    case "image/jpeg": {
      extension = "jpg";

      break;
    }
    case "image/webp": {
      extension = "webp";

      break;
    }
    case "video/mp4": {
      extension = "mp4";

      break;
    }
  }

  return `file_${new Date().toISOString()}.${extension}`;
}

function isSocialMediaUrl({
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

  return regex.test(url);
}

export const Z_Password = z
  .string({
    message: "badAuthenticator",
  })
  .min(6, {
    message: "tooSmall",
  })
  .max(40, {
    message: "tooLong",
  })
  .refine(hasUppercase, {
    message: "noHasUppercase",
  })
  .refine(hasLowercase, {
    message: "noHasLowercase",
  })
  .refine(hasSpecialCharacter, {
    message: "noHasSpecialCharacter",
  })
  .refine(hasNumber, {
    message: "noHasNumber",
  })
  .refine(isNotEmail, {
    message: "canNotBeEmail",
  });

export const Z_AuthenticatorCode = z
  .number({
    message: "noNumber",
  })
  .min(100_000, {
    message: "badAuthenticator",
  })
  .max(999_999, {
    message: "badAuthenticator",
  });

export const zodValidator = {
  authenticator: Z_AuthenticatorCode.or(Z_Password),
  autocompleteAddress: z
    .string({
      message: "noString",
    })
    .trim()
    .max(100, {
      message: "tooLong",
    })
    .transform((value: string) => value.trim().toLowerCase()),
  autocompletePlaceId: z
    .string({
      message: "noString",
    })
    .trim()
    .min(3)
    .max(200, {
      message: "tooLong",
    }),
  autocompleteSessionToken: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "tooLong",
    }),
  bugActionsBeforeError: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(1000, {
      message: "tooLong",
    }),
  bugAnswer: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(1000, {
      message: "tooLong",
    }),
  bugDescription: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(1000, {
      message: "tooLong",
    }),
  bugEnvironment: z.nativeEnum(E_BugEnvironmentServer, {
    message: "badBugEnvironment",
  }),
  bugErrorMessage: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(50, {
      message: "tooLong",
    })
    .or(
      z
        .number({
          message: "noNumber",
        })
        .min(100, {
          message: "bugErrorMessage",
        })
        .max(999, {
          message: "bugErrorMessage",
        }),
    ),
  bugExpectedBehavior: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(500, {
      message: "tooLong",
    }),
  bugId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badBugId",
    }),
  bugPriority: z.nativeEnum(E_BugPriorityServer, {
    message: "badBugPriority",
  }),
  bugStatus: z.nativeEnum(E_BugStatusServer, {
    message: "badBugStatus",
  }),
  checkbox: z.boolean({
    message: "noCheckedCheckbox",
  }),
  checkboxChecked: z.boolean({
    message: "noCheckedCheckbox",
  }),
  checkboxQuery: z
    .string({
      message: "noCheckedCheckbox",
    })
    .transform((value: string) => value === "true"),
  city: z
    .string({
      message: "noString",
    })
    .trim()
    .min(3, {
      message: "tooSmall",
    })
    .max(50, {
      message: "tooLong",
    })
    .transform((value: string) => value.trim()),
  code: z
    .number({
      message: "noNumber",
    })
    .min(100_000, {
      message: "tooSmall",
    })
    .max(999_999, {
      message: "tooLong",
    }),
  codeRecoveryPassword: z
    .string({
      message: "noString",
    })
    .trim()
    .min(16, {
      message: "tooSmall",
    })
    .max(16, {
      message: "tooLong",
    }),
  codeReset2FA: z
    .string({
      message: "noString",
    })
    .trim()
    .min(6, {
      message: "tooSmall",
    })
    .max(50, {
      message: "tooLong",
    }),
  companyDescription: z
    .string({
      message: "noString",
    })
    .trim()
    .max(1000, {
      message: "tooLong",
    }),
  companyId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badCompanyId",
    }),
  companyName: z
    .string({
      message: "noString",
    })
    .trim()
    .min(6, {
      message: "tooSmall",
    })
    .max(50, {
      message: "tooLong",
    })
    .refine(isNotEmail, {
      message: "canNotBeEmail",
    })
    .transform((value: string) => value.trim()),
  companyWorkerPermission: z
    .nativeEnum(E_CompanyWorkerPermissionsServer, {
      message: "badCompanyWorkerPermission",
    })
    .array(),
  companyWorkerRole: z.nativeEnum(E_CompanyWorkerRolesWithoutOwnerServer, {
    message: "badCompanyWorkerRole",
  }),
  companyWorkerSettingsId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badCompanyWorkerSettingsId",
    }),
  companyWorkersIds: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badCompanyWorkersIds",
    })
    .array(),
  companyWorkersSettingsIds: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badCompanyWorkersSettingsIds",
    })
    .array(),
  country: z.nativeEnum(E_CountryServer, {
    message: "badCountry",
  }),
  couponAmountOff: z
    .number({
      message: "noNumber",
    })
    .min(0, {
      message: "tooSmall",
    })
    .max(99, {
      message: "tooLong",
    }),
  couponDurationInMonths: z
    .number({
      message: "noNumber",
    })
    .min(0, {
      message: "tooSmall",
    })
    .max(12, {
      message: "tooLong",
    }),
  couponId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badCouponId",
    }),
  couponMaxRedemptions: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(9999, {
      message: "tooLong",
    }),
  couponMinimumAmount: z
    .number({
      message: "noNumber",
    })
    .min(10, {
      message: "tooSmall",
    })
    .max(999, {
      message: "tooLong",
    }),
  couponName: z
    .string({
      message: "noString",
    })
    .trim()
    .min(3, {
      message: "tooSmall",
    })
    .max(40, {
      message: "tooLong",
    }),
  couponPercentOff: z
    .number({
      message: "noNumber",
    })
    .min(0, {
      message: "tooSmall",
    })
    .max(99, {
      message: "tooLong",
    }),
  couponPromotionCode: z
    .string({
      message: "noString",
    })
    .trim()
    .min(5, {
      message: "tooSmall",
    })
    .max(20, {
      message: "tooLong",
    })
    .transform((value: string) => value.trim().toUpperCase()),
  date: z
    .string({
      message: "noString",
    })
    .trim()
    .refine(value => isValidDate(value), {
      message: "noDate",
    })
    .transform((value: string) => stringToDate(value)),
  dateEnd: z
    .string({
      message: "noString",
    })
    .trim()
    .refine(value => isValidDate(value), {
      message: "noDate",
    })
    .transform((value: string) => stringToEndDate(value)),
  dateStart: z
    .string({
      message: "noString",
    })
    .trim()
    .refine(value => isValidDate(value), {
      message: "noDate",
    })
    .transform((value: string) => stringToStartDate(value)),
  day: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(31, {
      message: "tooLong",
    }),
  district: z
    .string({
      message: "noString",
    })
    .trim()
    .min(3, {
      message: "tooSmall",
    })
    .max(30, {
      message: "tooLong",
    })
    .transform((value: string) => value.trim()),
  email: z
    .string({
      message: "noString",
    })
    .trim()
    .email({
      message: "noEmail",
    })
    .transform((value: string) => value.trim().toLowerCase()),
  exchangeId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badExchangeId",
    }),
  exchangeName: z
    .string({
      message: "noString",
    })
    .trim()
    .min(3, {
      message: "tooSmall",
    })
    .max(100, {
      message: "tooLong",
    }),
  exchangePoints: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(999, {
      message: "tooLong",
    }),
  exchangeSubscriptionFreeDays: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(9999, {
      message: "tooLong",
    }),
  fileImage2MB: z
    .custom(value => value instanceof Blob || value instanceof File, {
      message: "noFile",
    })
    .refine(
      value => {
        const file =
          value instanceof File
            ? value
            : convertBlobToFile({
                blob: value as Blob,
                filename: getFileNameFromMimeType(value as Blob),
              });
        return isValidFileImage2MB(file);
      },
      {
        message: "noFileImage2MB",
      },
    )
    .transform(value => value as Blob),
  fileImage5MB: z
    .custom(value => value instanceof Blob || value instanceof File, {
      message: "noFile",
    })
    .refine(
      value => {
        const file =
          value instanceof File
            ? value
            : convertBlobToFile({
                blob: value as Blob,
                filename: getFileNameFromMimeType(value as Blob),
              });
        return isValidFileImage5MB(file);
      },
      {
        message: "noFileImage5MB",
      },
    )
    .transform(value => value as Blob),
  fileVideo100MB: z
    .custom(value => value instanceof Blob || value instanceof File, {
      message: "noFile",
    })
    .refine(
      value => {
        const file =
          value instanceof File
            ? value
            : convertBlobToFile({
                blob: value as Blob,
                filename: getFileNameFromMimeType(value as Blob),
              });
        return isValidFileVideo100MB(file);
      },
      {
        message: "noFileVideo100MB",
      },
    )
    .transform(value => value as Blob),
  flatNumber: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(30, {
      message: "tooLong",
    })
    .or(
      z.number({
        message: "noNumber",
      }),
    )
    .transform((value: number | string) =>
      value.toString().trim().toLowerCase(),
    ),
  freeTrialCompanyMonthsCount: z
    .number({
      message: "noNumber",
    })
    .min(0, {
      message: "tooSmall",
    })
    .max(6, {
      message: "tooLong",
    }),
  freeTrialMaxListings: z
    .number({
      message: "noNumber",
    })
    .min(0, {
      message: "tooSmall",
    })
    .max(20, {
      message: "tooLong",
    }),
  invoiceId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badInvoiceId",
    }),
  isMobile: z.boolean(),
  isMobileQuery: z
    .string({
      message: "noString",
    })
    .trim()
    .refine(value => value === "true" || value === "false", {
      message: "noBoolean",
    })
    .transform(value => value === "true"),
  language: z.nativeEnum(E_LanguagesServer, {
    message: "badLanguages",
  }),
  lastId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "noString",
    }),
  limit: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(2, {
      message: "tooLong",
    })
    .transform(Number)
    .pipe(z.number().int().min(1).max(50)),
  limitNumber: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(2, {
      message: "tooLong",
    }),
  listingAccess: z.nativeEnum(E_ListingAccessServer, {
    message: "badListingAccess",
  }),
  listingArea: z
    .number({
      message: "noNumber",
    })
    .min(0, {
      message: "tooSmall",
    })
    .max(999_999_999, {
      message: "tooLong",
    }),
  listingCategory: z.nativeEnum(E_ListingCategoryServer, {
    message: "badListingCategory",
  }),
  listingCity: z
    .string({
      message: "badListingCity",
    })
    .trim()
    .min(3, {
      message: "badListingCity",
    })
    .max(50, {
      message: "badListingCity",
    }),
  listingCityId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badUserId",
    }),
  listingComfortOption: z
    .nativeEnum(E_ListingComfortOptionServer, {
      message: "badListingComfortOptions",
    })
    .array(),
  listingCondition: z.nativeEnum(E_ListingConditionServer, {
    message: "badListingCondition",
  }),
  listingContainerType: z.nativeEnum(E_ListingContainerTypeServer, {
    message: "badListingContainerType",
  }),
  listingContractType: z.nativeEnum(E_ListingContractTypeServer, {
    message: "badListingContractType",
  }),
  listingDeleteReason: z.nativeEnum(E_ListingDeleteReasonServer, {
    message: "badListingDeleteReason",
  }),
  listingDescription: z
    .string({
      message: "noString",
    })
    .trim()
    .min(10, {
      message: "tooSmall",
    })
    .max(5000, {
      message: "tooLong",
    }),
  listingDistrict: z
    .string({
      message: "badListingDistrict",
    })
    .trim()
    .min(3, {
      message: "badListingDistrict",
    })
    .max(50, {
      message: "badListingDistrict",
    }),
  listingDistrictId: z
    .string({
      message: "noString",
    })
    .trim()
    .cuid({
      message: "badDistrictId",
    }),
  listingEntryOption: z
    .nativeEnum(E_ListingEntryOptionServer, {
      message: "badListingEntryOptions",
    })
    .array(),
  listingExtension: z.coerce
    .number({
      message: "noNumber",
    })
    .min(0, {
      message: "tooSmall",
    })
    .max(12, {
      message: "tooLong",
    }),
  listingFloorLevel: z.coerce
    .number({
      message: "noNumber",
    })
    .min(-4, {
      message: "tooSmall",
    })
    .max(12, {
      message: "tooLong",
    }),
  listingId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badListingId",
    }),
  listingImagesToRemove: z
    .string({
      message: "noString",
    })
    .trim()
    .url({
      message: "noUrl",
    }),
  listingMinimumRentalDays: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(100, {
      message: "tooLong",
    }),
  listingParkingType: z.nativeEnum(E_ListingParkingTypeServer, {
    message: "badListingParkingType",
  }),
  listingPlotType: z.nativeEnum(E_ListingPlotTypeServer, {
    message: "badListingPlotType",
  }),
  listingPrice: z
    .number({
      message: "noNumber",
    })
    .min(0, {
      message: "tooSmall",
    })
    .max(100_000_000, {
      message: "tooLong",
    }),
  listingRentalDays: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(1000, {
      message: "tooLong",
    })
    .transform(Number),
  listingSecurityOption: z
    .nativeEnum(E_ListingSecurityOptionServer, {
      message: "badListingSecurityOptions",
    })
    .array(),
  listingStatus: z.nativeEnum(E_ListingStatusServer, {
    message: "badListingStatus",
  }),
  listingTitle: z
    .string({
      message: "noString",
    })
    .trim()
    .min(3, {
      message: "tooSmall",
    })
    .max(100, {
      message: "tooLong",
    }),
  listingType: z.nativeEnum(E_ListingTypeServer, {
    message: "badListingCity",
  }),
  listingUnitType: z.nativeEnum(E_ListingUnitTypeServer, {
    message: "badListingUnitType",
  }),
  listingUsageOption: z
    .nativeEnum(E_ListingUsageOptionServer, {
      message: "badListingUsageOptions",
    })
    .array(),
  listingUtilityOption: z
    .nativeEnum(E_ListingUtilityOption, {
      message: "badListingUtilityOptions",
    })
    .array(),
  locationRadius: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(30, {
      message: "tooLong",
    })
    .transform(Number),
  mapLocationEast: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(20, {
      message: "tooLong",
    })
    .transform(Number),
  mapLocationNorth: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(20, {
      message: "tooLong",
    })
    .transform(Number),
  mapLocationSouth: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(20, {
      message: "tooLong",
    })
    .transform(Number),
  mapLocationWest: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(20, {
      message: "tooLong",
    })
    .transform(Number),
  mapZoom: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(2, {
      message: "tooLong",
    })
    .transform(Number),
  month: z
    .number({
      message: "noNumber",
    })
    .min(0, {
      message: "tooSmall",
    })
    .max(11, {
      message: "tooLong",
    }),
  monthStringToNumber: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(2, {
      message: "tooLong",
    })
    .transform(Number),
  page: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(2, {
      message: "tooLong",
    })
    .transform(Number)
    .pipe(z.number().int().min(1).max(99)),
  pageNumber: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(2, {
      message: "tooLong",
    }),
  password: Z_Password,
  paymentMethodId: z
    .string({
      message: "noString",
    })
    .trim()
    .refine(value => isPaymentMethodId(value), {
      message: "badPaymentMethodId",
    }),
  phoneCountryCode: z
    .number({
      message: "noNumber",
    })
    .refine(
      value =>
        Object.values(E_CountryCodeServer).includes(
          value.toString() as E_CountryCodeServer,
        ),
      {
        message: "badPhoneCountryCode",
      },
    ),
  phoneNumber: z
    .number({
      message: "noNumber",
    })
    .min(450_000_000, { message: "badPhoneNumber" })
    .max(900_000_000, { message: "badPhoneNumber" }),
  planDescription: z
    .string({
      message: "noString",
    })
    .trim()
    .min(3, {
      message: "tooSmall",
    })
    .max(100, {
      message: "tooLong",
    }),
  planId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badPlanId",
    }),
  planIntervalCount: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(8, {
      message: "tooLong",
    }),
  planListingDurationMonths: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(12, {
      message: "tooLong",
    }),
  planMaximumListingsInMonth: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(100, {
      message: "tooLong",
    }),
  planName: z
    .string({
      message: "noString",
    })
    .trim()
    .min(3, {
      message: "tooSmall",
    })
    .max(40, {
      message: "tooLong",
    }),
  planPrice: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(999, {
      message: "tooLong",
    }),
  pointsBigBug: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(100, {
      message: "tooLong",
    }),
  pointsMediumBug: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(100, {
      message: "tooLong",
    }),
  pointsReferralCompany: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(99, {
      message: "tooLong",
    }),
  pointsReferralUser: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(99, {
      message: "tooLong",
    }),
  pointsSmallBug: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(100, {
      message: "tooLong",
    }),
  postalCode: z
    .string({
      message: "noString",
    })
    .trim()
    .min(6, {
      message: "tooSmall",
    })
    .refine(isPostalCode, {
      message: "badPostalCode",
    })
    .transform((value: string) => value.trim().toLowerCase()),
  productPoints_1: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(9999, {
      message: "tooLong",
    }),
  productPoints_2_5: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(9999, {
      message: "tooLong",
    }),
  productPoints_6_plus: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(9999, {
      message: "tooLong",
    }),
  productPrice_1: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(999, {
      message: "tooLong",
    }),
  productPrice_2_5: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(999, {
      message: "tooLong",
    }),
  productPrice_6_plus: z
    .number({
      message: "noNumber",
    })
    .min(1, {
      message: "tooSmall",
    })
    .max(999, {
      message: "tooLong",
    }),
  recaptcha: z
    .string({
      message: "noCheckedRecaptcha",
    })
    .min(100, {
      message: "noCheckedRecaptcha",
    }),
  referralCode: z
    .string({
      message: "noNumber",
    })
    .min(12, {
      message: "tooSmall",
    })
    .max(12, {
      message: "tooLong",
    })
    .transform((value: string) => value.trim().toUpperCase()),
  reportDescription: z
    .string({
      message: "noString",
    })
    .trim()
    .min(6, {
      message: "tooSmall",
    })
    .max(100, {
      message: "tooLong",
    }),
  reportType: z.nativeEnum(E_ReportTypeServer, {
    message: "badReportType",
  }),
  streetName: z
    .string({
      message: "noString",
    })
    .trim()
    .min(3, {
      message: "tooSmall",
    })
    .max(50, {
      message: "tooLong",
    })
    .transform((value: string) => value.trim()),
  streetNumber: z
    .string({
      message: "noString",
    })
    .trim()
    .min(1, {
      message: "tooSmall",
    })
    .max(30, {
      message: "tooLong",
    })
    .or(
      z.number({
        message: "noNumber",
      }),
    )
    .transform((value: number | string) =>
      value.toString().trim().toLowerCase(),
    ),
  subscriptionId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badSubscriptionId",
    }),
  taxCountry: z.nativeEnum(E_TaxCountryServer, {
    message: "badTaxCountry",
  }),
  taxNumber: z
    .number({
      message: "noNumber",
    })
    .min(100_000_000, {
      message: "tooSmall",
    })
    .max(999_999_999_999, {
      message: "tooLong",
    }),
  uploadImagesGroupId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badUploadImagesGroupId",
    }),
  urlFacebook: z
    .string({
      message: "noString",
    })
    .trim()
    .url({
      message: "noUrl",
    })
    .refine(
      value => isSocialMediaUrl({ socialMedia: "facebook", url: value }),
      {
        message: "badUrlFacebook",
      },
    ),
  urlInstagram: z
    .string({
      message: "noString",
    })
    .trim()
    .url({
      message: "noUrl",
    })
    .refine(
      value => isSocialMediaUrl({ socialMedia: "instagram", url: value }),
      {
        message: "badUrlInstagram",
      },
    ),
  urlTiktok: z
    .string({
      message: "noString",
    })
    .trim()
    .url({
      message: "noUrl",
    })
    .refine(value => isSocialMediaUrl({ socialMedia: "tiktok", url: value }), {
      message: "badUrlTikTok",
    }),
  userFirstName: z
    .string({
      message: "noString",
    })
    .trim()
    .min(2, {
      message: "tooSmall",
    })
    .max(30, {
      message: "tooLong",
    })
    .refine(isNotEmail, {
      message: "canNotBeEmail",
    })
    .transform((value: string) => value.trim()),
  userId: z
    .string({
      message: "noString",
    })
    .trim()
    .uuid({
      message: "badUserId",
    }),
  userLastName: z
    .string({
      message: "noString",
    })
    .trim()
    .min(2, {
      message: "tooSmall",
    })
    .max(30, {
      message: "tooLong",
    })
    .refine(isNotEmail, {
      message: "canNotBeEmail",
    })
    .transform((value: string) => value.trim()),
  year: z
    .number({
      message: "noNumber",
    })
    .min(2020, {
      message: "tooSmall",
    }),
  yearStringToNumber: z
    .string({
      message: "noString",
    })
    .trim()
    .min(4, {
      message: "tooSmall",
    })
    .max(4, {
      message: "tooLong",
    })
    .transform(Number),
};

export type T_ResultZodError = {
  field: T_FormNames;
  message: T_Messages;
};

type T_CheckZodValidator<V extends ZodRawShape> = {
  arrayData?: T_FormNames[];
  arrayDataWithObjects?: T_FormNames[];
  queryData?: T_FormNames[];
  request: Request;
  showLogs?: boolean;
  validator: V;
};

type T_CheckZodValidatorResult<V extends ZodRawShape> = {
  data?: ZodInfer<ZodObject<V>>;
  responseError?: T_ResponseOnFailure;
};

type T_Data = {
  [key: string]: FormDataEntryValue | FormDataEntryValue[] | null | object[];
};

export const checkZodValidator = async <V extends ZodRawShape>({
  arrayData = [],
  arrayDataWithObjects = [],
  queryData = [],
  request,
  showLogs,
  validator,
}: T_CheckZodValidator<V>): Promise<
  T_CheckZodValidatorResult<V> | undefined
> => {
  const data: T_Data = {};
  if (queryData.length > 0) {
    const url = new URL(request.url);
    const searchParameters = new URLSearchParams(url.search);

    for (const key of queryData) {
      const values = searchParameters.getAll(key);
      if (arrayData.includes(key)) {
        data[key] = values;
      } else if (values.length === 1) {
        data[key] = values[0] === undefined ? null : (values[0] ?? null);
      } else if (values.length > 1) {
        data[key] = values;
      }
    }
  }

  if (showLogs) {
    console.warn("data query", data);
  }

  const validatorKeysInQueryData = Object.keys(validator) as T_FormNames[];
  const allKeysInQueryData = validatorKeysInQueryData.every(key =>
    queryData.includes(key),
  );

  if (!allKeysInQueryData) {
    const formData = await request.formData();
    for (const key of validatorKeysInQueryData) {
      if (!queryData.includes(key) && formData.has(key)) {
        data[key] = arrayData.includes(key)
          ? [...formData.getAll(key)].map(item => {
              const isObjectInArray = arrayDataWithObjects.includes(key);
              return isObjectInArray
                ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  JSON.parse(item)
                : isNumberOrBooleanAndConvert(item);
            })
          : isNumberOrBooleanAndConvert(formData.get(key));
      }
    }
  }

  if (showLogs) {
    console.warn("data all", data);
  }

  const Z_Validator = z.object(validator);
  const resultZod = await Z_Validator.safeParseAsync(data);
  if (!resultZod.success) {
    const fieldErrors: T_ResultZodError[] = resultZod.error.errors.map(
      error => {
        return {
          field: error.path[0],
          message: error.message,
        } as T_ResultZodError;
      },
    );

    return {
      responseError: {
        formErrors: fieldErrors,
        message: null,
        request,
        status: 422,
      },
    };
  }

  type T_ValidatorSchema = z.infer<typeof Z_Validator>;
  const validatorKeys = Object.keys(Z_Validator.shape) as Array<
    keyof T_ValidatorSchema
  >;

  const hasPassword = validatorKeys.includes(formNames.password);
  const hasPasswordRepeat = validatorKeys.includes(formNames.passwordRepeat);

  if (hasPassword && hasPasswordRepeat) {
    const resultZodValidatorPassword = await Z_Validator.refine(
      ({ password, passwordRepeat }) => password === passwordRepeat,
      {
        message: "badPasswordRepeat",
        path: [formNames.passwordRepeat],
      },
    ).safeParseAsync(data);

    if (!resultZodValidatorPassword.success) {
      const fieldErrors: T_ResultZodError[] | undefined =
        resultZodValidatorPassword.error?.errors?.map(error => {
          return {
            field: error.path[0],
            message: error.message,
          } as T_ResultZodError;
        });

      if (fieldErrors) {
        return {
          responseError: {
            formErrors: fieldErrors,
            message: null,
            request,
            status: 422,
          },
        };
      }
    }
  }

  return {
    data: resultZod.data,
  };
};
