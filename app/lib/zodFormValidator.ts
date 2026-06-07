import type localesCommonPL from "~/locales/pl/common.json";
import type localesNotificationsPL from "~/locales/pl/notifications.json";
import {
  isInBugEnvironment,
  isInBugPriority,
  isInBugStatus,
  isInCompanyWorkerPermissions,
  isInCompanyWorkerRoles,
  isInCountries,
  isInCountriesCode,
  isInLanguages,
  isInListingAccess,
  isInListingCategory,
  isInListingComfortOptions,
  isInListingConditions,
  isInListingContainerType,
  isInListingContractType,
  isInListingEntryOptions,
  isInListingParkingType,
  isInListingPlotTypes,
  isInListingSecurityOptions,
  isInListingStatus,
  isInListingTypes,
  isInListingUnitTypes,
  isInListingUsageOptions,
  isInListingUtilityOptions,
  isInPlanIntervals,
  isInPlanTypes,
  isInReportType,
  isInTaxCountries,
} from "~/models/enums";
import { isDate } from "~/utilities/date";
import { isNumber, isSocialMediaUrl, isValidUrl } from "~/utilities/functions";

import {
  isFile,
  isValidPostalCode,
  validatePaymentMethodId,
  validDate,
  validEmail,
  validNumberInRange,
  validPassword,
  validStringIsNumberMinAndMaxLength,
  validStringMinAndMaxLength,
  validStringMinLength,
} from "./validations";

const getBase64PaddingSize = (base64: string): number => {
  if (base64.endsWith("==")) {
    return 2;
  }
  if (base64.endsWith("=")) {
    return 1;
  }
  return 0;
};

export const formNames = {
  authenticator: "authenticator",
  authenticatorPassword: "authenticatorPassword",
  autocompleteAddress: "autocompleteAddress",
  autocompletePlaceId: "autocompletePlaceId",
  autocompleteSessionToken: "autocompleteSessionToken",
  blogPostContent: "blogPostContent",
  blogPostDescription: "blogPostDescription",
  blogPostDescriptionSeo: "blogPostDescriptionSeo",
  blogPostId: "blogPostId",
  blogPostSlug: "blogPostSlug",
  blogPostTitle: "blogPostTitle",
  blogPostTitleSeo: "blogPostTitleSeo",
  bugActionsBeforeError: "bugActionsBeforeError",
  bugAnswer: "bugAnswer",
  bugDescription: "bugDescription",
  bugEnvironment: "bugEnvironment",
  bugErrorMessage: "bugErrorMessage",
  bugExpectedBehavior: "bugExpectedBehavior",
  bugId: "bugId",
  bugImages: "bugImages",
  bugIsReproducible: "bugIsReproducible",
  bugPointsPaidAt: "bugPointsPaidAt",
  bugPriority: "bugPriority",
  bugShowClosed: "bugShowClosed",
  bugStatus: "bugStatus",
  bugTimestamp: "bugTimestamp",
  bugVideo: "bugVideo",
  checkboxAcceptNewsletter: "checkboxAcceptNewsletter",
  checkboxAcceptPrivacyPolicyLink: "checkboxAcceptPrivacyPolicyLink",
  checkboxAcceptRegulations: "checkboxAcceptRegulations",
  checkboxAcceptRegulationsText: "checkboxAcceptRegulationsText",
  checkboxAuthenticator2FA: "checkboxAuthenticator2FA",
  checkboxAuthenticatorEmailOTP: "checkboxAuthenticatorEmailOTP",
  checkboxConsentNewsletter: "checkboxConsentNewsletter",
  checkboxConsentOpinion: "checkboxConsentOpinion",
  checkboxCouponActive: "checkboxCouponActive",
  checkboxCreateListing: "checkboxCreateListing",
  checkboxExchangeActive: "checkboxExchangeActive",
  checkboxListingLongTerm: "checkboxListingLongTerm",
  checkboxListingNegotiable: "checkboxListingNegotiable",
  checkboxListingShortTerm: "checkboxListingShortTerm",
  checkboxListingUseCompanyCard: "checkboxListingUseCompanyCard",
  checkboxListingUsePoints: "checkboxListingUsePoints",
  checkboxPlanActive: "checkboxPlanActive",
  checkboxSubscriptionDeleteImmediately:
    "checkboxSubscriptionDeleteImmediately",
  checkboxSwitchCard: "checkboxSwitchCard",
  city: "city",
  code: "code",
  codeReset2FA: "codeReset2FA",
  companyDescription: "companyDescription",
  companyId: "companyId",
  companyName: "companyName",
  companyPhoneCountryCode: "companyPhoneCountryCode",
  companyPhoneNumber: "companyPhoneNumber",
  companySettingsLoginFacebook: "companySettingsLoginFacebook",
  companySettingsLoginGoogle: "companySettingsLoginGoogle",
  companySettingsLoginPassword: "companySettingsLoginPassword",
  companySettingsTwoFactorAuthenticationEnabled:
    "companySettingsTwoFactorAuthenticationEnabled",
  companyWorkerPermission: "companyWorkerPermission",
  companyWorkerRole: "companyWorkerRole",
  companyWorkerSettingsId: "companyWorkerSettingsId",
  companyWorkersIds: "companyWorkersIds",
  companyWorkersSettingsIds: "companyWorkersSettingsIds",
  country: "country",
  couponAmountOff: "couponAmountOff",
  couponDurationInMonths: "couponDurationInMonths",
  couponEndDate: "couponEndDate",
  couponFirstTimeTransaction: "couponFirstTimeTransaction",
  couponId: "couponId",
  couponMaxRedemptions: "couponMaxRedemptions",
  couponMinimumAmount: "couponMinimumAmount",
  couponName: "couponName",
  couponPercentOff: "couponPercentOff",
  couponPromotionCode: "couponPromotionCode",
  date: "date",
  day: "day",
  dayEnd: "dayEnd",
  dayStart: "dayStart",
  district: "district",
  email: "email",
  exchangeId: "exchangeId",
  exchangeName: "exchangeName",
  exchangePoints: "exchangePoints",
  exchangeSubscriptionFreeDays: "exchangeSubscriptionFreeDays",
  fileImage2MB: "fileImage2MB",
  fileImage2MBBase64: "fileImage2MBBase64",
  fileImage5MB: "fileImage5MB",
  fileImage5MBBase64: "fileImage5MBBase64",
  fileImages2MB: "fileImages2MB",
  fileImages2MBBase64: "fileImages2MBBase64",
  fileImages5MB: "fileImages5MB",
  fileImages5MBBase64: "fileImages5MBBase64",
  fileVideo100MB: "fileVideo100MB",
  flatNumber: "flatNumber",
  freeTrialCompanyMonthsCount: "freeTrialCompanyMonthsCount",
  freeTrialMaxListings: "freeTrialMaxListings",
  image: "image",
  invoiceId: "invoiceId",
  isMobile: "isMobile",
  language: "language",
  lastId: "lastId",
  limit: "limit",
  listingAccess: "listingAccess",
  listingArea: "listingArea",
  listingAvailableFrom: "listingAvailableFrom",
  listingAvailableTo: "listingAvailableTo",
  listingCategories: "listingCategories",
  listingCategory: "listingCategory",
  listingCity: "listingCity",
  listingCityId: "listingCityId",
  listingComfortOption: "listingComfortOption",
  listingCondition: "listingCondition",
  listingContainerType: "listingContainerType",
  listingContainerTypes: "listingContainerTypes",
  listingContractType: "listingContractType",
  listingDeleteReason: "listingDeleteReason",
  listingDescription: "listingDescription",
  listingDistrict: "listingDistrict",
  listingDistrictId: "listingDistrictId",
  listingEntryOption: "listingEntryOption",
  listingExtension: "listingExtension",
  listingFloorLevel: "listingFloorLevel",
  listingHasAvailableDistricts: "listingHasAvailableDistricts",
  listingId: "listingId",
  listingImagesNew: "listingImagesNew",
  listingImagesToRemove: "listingImagesToRemove",
  listingLongTerm: "listingLongTerm",
  listingMinimumRentalDays: "listingMinimumRentalDays",
  listingParkingType: "listingParkingType",
  listingParkingTypes: "listingParkingTypes",
  listingPlotType: "listingPlotType",
  listingPlotTypes: "listingPlotTypes",
  listingPrice: "listingPrice",
  listingRentalDays: "listingRentalDays",
  listingSecurityOption: "listingSecurityOption",
  listingShortTerm: "listingShortTerm",
  listingStatus: "listingStatus",
  listingTitle: "listingTitle",
  listingType: "listingType",
  listingUnitType: "listingUnitType",
  listingUnitTypes: "listingUnitTypes",
  listingUsageOption: "listingUsageOption",
  listingUtilityOption: "listingUtilityOption",
  locationRadius: "locationRadius",
  mapLocationEast: "mapLocationEast",
  mapLocationNorth: "mapLocationNorth",
  mapLocationSouth: "mapLocationSouth",
  mapLocationWest: "mapLocationWest",
  mapZoom: "mapZoom",
  month: "month",
  page: "page",
  password: "password",
  passwordRepeat: "passwordRepeat",
  paymentMethodId: "paymentMethodId",
  phoneCountryCode: "phoneCountryCode",
  phoneNumber: "phoneNumber",
  planDescription: "planDescription",
  planId: "planId",
  planInterval: "planInterval",
  planIntervalCount: "planIntervalCount",
  planListingDurationMonths: "planListingDurationMonths",
  planMaximumListingsInMonth: "planMaximumListingsInMonth",
  planName: "planName",
  planPrice: "planPrice",
  plansId: "plansId",
  planType: "planType",
  pointsBigBug: "pointsBigBug",
  pointsMediumBug: "pointsMediumBug",
  pointsReferralCompany: "pointsReferralCompany",
  pointsReferralUser: "pointsReferralUser",
  pointsSmallBug: "pointsSmallBug",
  postalCode: "postalCode",
  productPoints_1: "productPoints_1",
  productPoints_2_5: "productPoints_2_5",
  productPoints_6_plus: "productPoints_6_plus",
  productPrice_1: "productPrice_1",
  productPrice_2_5: "productPrice_2_5",
  productPrice_6_plus: "productPrice_6_plus",
  recaptcha: "recaptcha",
  referralCode: "referralCode",
  reportDescription: "reportDescription",
  reportType: "reportType",
  search: "search",
  streetName: "streetName",
  streetNumber: "streetNumber",
  subscriptionId: "subscriptionId",
  taxCountry: "taxCountry",
  taxNumber: "taxNumber",
  uploadImagesGroupId: "uploadImagesGroupId",
  urlFacebook: "urlFacebook",
  urlInstagram: "urlInstagram",
  urlTiktok: "urlTiktok",
  userFirstName: "userFirstName",
  userId: "userId",
  userLastName: "userLastName",
  year: "year",
} as const;

export type T_FormNames = keyof typeof formNames;

export type T_ResultZodError = {
  field: T_FormNames;
  message: keyof typeof localesNotificationsPL;
};

export type T_MessagesFormValidator =
  keyof typeof localesCommonPL.formValidator;

export const checkFormValidator = ({
  formName,
  optional = false,
  value,
}: {
  formName: T_FormNames;
  optional?: boolean;
  value:
    | { count: number; id: string }[]
    | { label: string; value: string }
    | { label: string; value: string }[]
    | boolean
    | Date
    | File
    | File[]
    | null
    | number
    | string
    | string[];
}): null | T_MessagesFormValidator => {
  if (
    optional &&
    !value &&
    (typeof value !== "number" || (Array.isArray(value) && value.length === 0))
  ) {
    return null;
  }

  switch (formName) {
    case "email": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validEmail(value);
      if (!isValid) {
        return "badEmail";
      }
      return null;
    }

    case "authenticatorPassword":
    case "password": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validPassword(value);
      if (!isValid) {
        return "badPassword";
      }
      return null;
    }

    case "fileImage2MBBase64": {
      let selectedBase64: null | string = null;

      if (Array.isArray(value)) {
        if (optional && value.length === 0) {
          return null;
        } else if (value.length > 1) {
          return "badFileImage2MBBase64";
        } else {
          const foundFirstBase64 = value.at(0);
          if (foundFirstBase64 && typeof foundFirstBase64 === "string") {
            selectedBase64 = foundFirstBase64;
          } else {
            return "badFileImage2MBBase64";
          }
        }
      } else {
        if (optional && value === "") {
          return null;
        }

        if (typeof value === "string") {
          selectedBase64 = value;
        } else {
          return "badFileImage2MBBase64";
        }
      }

      if (selectedBase64) {
        const isValidImage =
          selectedBase64.startsWith("data:image/jpeg") ||
          selectedBase64.startsWith("data:image/png") ||
          selectedBase64.startsWith("data:image/webp");

        let base64PaddingBytes = 0;

        if (selectedBase64.endsWith("==")) {
          base64PaddingBytes = 2;
        } else if (selectedBase64.endsWith("=")) {
          base64PaddingBytes = 1;
        }

        const imageSize = selectedBase64.length * (3 / 4) - base64PaddingBytes;

        return isValidImage && imageSize <= 2_097_152
          ? null
          : "badFileImage2MBBase64";
      } else {
        return "badFileImage2MBBase64";
      }
    }

    case "fileImage5MBBase64": {
      let selectedBase64: null | string = null;

      if (Array.isArray(value)) {
        if (optional && value.length === 0) {
          return null;
        } else {
          if (value.length > 1) {
            return "badFileImage5MBBase64";
          }

          const foundFirstBase64 = value.at(0);
          if (foundFirstBase64 && typeof foundFirstBase64 === "string") {
            selectedBase64 = foundFirstBase64;
          } else {
            return "badFileImage5MBBase64";
          }
        }
      } else {
        if (optional && value === "") {
          return null;
        }

        if (typeof value === "string") {
          selectedBase64 = value;
        } else {
          return "badFileImage5MBBase64";
        }
      }

      if (selectedBase64) {
        const isValidImage =
          selectedBase64.startsWith("data:image/jpeg") ||
          selectedBase64.startsWith("data:image/png") ||
          selectedBase64.startsWith("data:image/webp");

        let base64PaddingBytes = 0;

        if (selectedBase64.endsWith("==")) {
          base64PaddingBytes = 2;
        } else if (selectedBase64.endsWith("=")) {
          base64PaddingBytes = 1;
        }

        const imageSize = selectedBase64.length * (3 / 4) - base64PaddingBytes;

        return isValidImage && imageSize <= 5_242_880
          ? null
          : "badFileImage5MBBase64";
      } else {
        return "badFileImage5MBBase64";
      }
    }

    case "fileImage2MB": {
      let selectedFile: Blob | File | null = null;
      if (Array.isArray(value)) {
        if (optional && value.length === 0) {
          return null;
        } else {
          if (value.length > 1) {
            return "badFileImage2MB";
          }

          const foundFirstFile = value.at(0);
          if (
            foundFirstFile &&
            (foundFirstFile instanceof File || foundFirstFile instanceof Blob)
          ) {
            selectedFile = foundFirstFile;
          } else {
            return "badFileImage2MB";
          }
        }
      } else {
        if (optional && value === "") {
          return null;
        }

        if (value && (value instanceof File || value instanceof Blob)) {
          selectedFile = value;
        } else {
          return "badFileImage2MB";
        }
      }

      if (
        selectedFile &&
        (selectedFile instanceof File || selectedFile instanceof Blob)
      ) {
        if (selectedFile.type.startsWith("image/")) {
          return (selectedFile.type === "image/jpeg" ||
            selectedFile.type === "image/png" ||
            selectedFile.type === "image/webp") &&
            selectedFile.size <= 2_097_152
            ? null
            : "badFileImage2MB";
        } else {
          return "badFileImage2MB";
        }
      } else {
        return "badFileImage2MB";
      }
    }

    case "fileImage5MB": {
      let selectedFile: Blob | File | null = null;
      if (Array.isArray(value)) {
        if (optional && value.length === 0) {
          return null;
        } else {
          if (value.length > 1) {
            return "badFileImage5MB";
          }

          const foundFirstFile = value.at(0);
          if (
            foundFirstFile &&
            (foundFirstFile instanceof File || foundFirstFile instanceof Blob)
          ) {
            selectedFile = foundFirstFile;
          } else {
            return "badFileImage5MB";
          }
        }
      } else {
        if (optional && value === "") {
          return null;
        }

        if (value && (value instanceof File || value instanceof Blob)) {
          selectedFile = value;
        } else {
          return "badFileImage5MB";
        }
      }

      if (
        selectedFile &&
        (selectedFile instanceof File || selectedFile instanceof Blob)
      ) {
        if (selectedFile.type.startsWith("image/")) {
          return (selectedFile.type === "image/jpeg" ||
            selectedFile.type === "image/png" ||
            selectedFile.type === "image/webp") &&
            selectedFile.size <= 5_242_880
            ? null
            : "badFileImage5MB";
        } else {
          return "badFileImage5MB";
        }
      } else {
        return "badFileImage5MB";
      }
    }

    case "fileImages2MB": {
      if (value && Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badFileImages2MB";
        }

        for (const file of value) {
          if (!(file instanceof File)) {
            return "badFileImages2MB";
          }

          if (
            !file.type.startsWith("image/") ||
            !(
              file.type === "image/jpeg" ||
              file.type === "image/png" ||
              file.type === "image/webp"
            ) ||
            file.size > 2_097_152
          ) {
            return "badFileImages2MB";
          }
        }
        return null;
      } else {
        return "badFileImages2MB";
      }
    }

    case "fileImages2MBBase64": {
      if (value && Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badFileImages2MBBase64";
        }

        for (const base64 of value) {
          if (typeof base64 !== "string") {
            return "badFileImages2MBBase64";
          }

          const isValidImage =
            base64.startsWith("data:image/jpeg") ||
            base64.startsWith("data:image/png") ||
            base64.startsWith("data:image/webp");

          const imageSize =
            base64.length * (3 / 4) - getBase64PaddingSize(base64);

          if (!isValidImage || imageSize > 2_097_152) {
            return "badFileImages2MBBase64";
          }
        }
        return null;
      } else {
        return "badFileImages2MBBase64";
      }
    }

    case "fileImages5MBBase64": {
      if (value && Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badFileImages5MBBase64";
        }

        for (const base64 of value) {
          if (typeof base64 !== "string") {
            return "badFileImages5MBBase64";
          }

          const isValidImage =
            base64.startsWith("data:image/jpeg") ||
            base64.startsWith("data:image/png") ||
            base64.startsWith("data:image/webp");

          const imageSize =
            base64.length * (3 / 4) - getBase64PaddingSize(base64);

          if (!isValidImage || imageSize > 5_242_880) {
            return "badFileImages5MBBase64";
          }
        }
        return null;
      } else {
        return "badFileImages5MBBase64";
      }
    }

    case "bugImages":
    case "fileImages5MB": {
      if (value && Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badFileImages5MB";
        }

        for (const file of value) {
          if (!(file instanceof File)) {
            return "badFileImages5MB";
          }

          if (
            !file.type.startsWith("image/") ||
            !(
              file.type === "image/jpeg" ||
              file.type === "image/png" ||
              file.type === "image/webp"
            ) ||
            file.size > 5_242_880
          ) {
            return "badFileImages5MB";
          }
        }
        return null;
      } else {
        return "badFileImages5MB";
      }
    }

    case "bugVideo":
    case "fileVideo100MB": {
      let selectedFile: File | null = null;
      if (Array.isArray(value)) {
        if (optional && value.length === 0) {
          return null;
        } else {
          if (value.length > 1) {
            return "badFileVideo100MB";
          }

          const foundFirstFile = value.at(0);
          if (foundFirstFile && foundFirstFile instanceof File) {
            selectedFile = foundFirstFile;
          } else {
            return "badFileVideo100MB";
          }
        }
      } else {
        if (optional && value === "") {
          return null;
        }

        if (value && value instanceof File) {
          selectedFile = value;
        } else {
          return "badFileVideo100MB";
        }
      }

      if (selectedFile && selectedFile instanceof File) {
        if (selectedFile.type === "video/mp4") {
          return selectedFile.size <= 100 * 1024 * 1024
            ? null
            : "badFileVideo100MB";
        } else {
          return "badFileVideo100MB";
        }
      } else {
        return "badFileVideo100MB";
      }
    }

    case "passwordRepeat": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validPassword(value);
      if (!isValid) {
        return "badPasswordRepeat";
      }
      return null;
    }

    case "autocompleteAddress": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 100,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badAddress";
      }
      return null;
    }

    case "userFirstName": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 30,
        minLength: 2,
        value,
      });
      if (!isValid) {
        return "badUserFirstName";
      }
      return null;
    }

    case "urlFacebook": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = isSocialMediaUrl({
        socialMedia: "facebook",
        url: value,
      });

      if (!isValid) {
        return "badUrlFacebook";
      }
      return null;
    }

    case "urlInstagram": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = isSocialMediaUrl({
        socialMedia: "instagram",
        url: value,
      });

      if (!isValid) {
        return "badUrlInstagram";
      }
      return null;
    }

    case "urlTiktok": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = isSocialMediaUrl({
        socialMedia: "tiktok",
        url: value,
      });

      if (!isValid) {
        return "badUrlTiktok";
      }
      return null;
    }

    case "listingImagesNew":
    case "listingImagesToRemove": {
      if (!Array.isArray(value) || !value.every(v => typeof v === "string")) {
        return "somethingWentWrong";
      }

      const allValid = value.every(url => isValidUrl(url));

      if (!allValid) {
        return "badImageUrl";
      }

      return null;
    }

    case "userLastName": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 30,
        minLength: 2,
        value,
      });
      if (!isValid) {
        return "badUserLastName";
      }
      return null;
    }

    case "bugActionsBeforeError": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 1000,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBugActionsBeforeError";
      }
      return null;
    }

    case "bugAnswer": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 1000,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBugAnswer";
      }
      return null;
    }

    case "blogPostTitle": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 100,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBlogPostTitle";
      }
      return null;
    }

    case "blogPostTitleSeo": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 55,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBlogPostTitle";
      }
      return null;
    }

    case "blogPostContent": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 10_000,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBlogPostContent";
      }
      return null;
    }

    case "blogPostDescription": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 200,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBlogPostDescription";
      }
      return null;
    }

    case "blogPostSlug": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 100,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBlogPostSlug";
      }
      return null;
    }

    case "blogPostDescriptionSeo": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 155,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBlogPostDescription";
      }
      return null;
    }

    case "bugDescription": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 1000,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBugDescription";
      }
      return null;
    }

    case "bugExpectedBehavior": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 500,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBugExpectedBehavior";
      }
      return null;
    }

    case "bugErrorMessage": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 50,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badBugErrorMessage";
      }
      return null;
    }

    case "bugPointsPaidAt": {
      if (!value) {
        return "noData";
      }

      let isValid = false;
      if (typeof value === "string" || typeof value === "number") {
        isValid = validDate(String(value));
      } else if (value instanceof Date) {
        isValid = validDate(value.toISOString());
      }

      if (!isValid) {
        return "badBugPointsPaidAt";
      }
      return null;
    }

    case "bugTimestamp": {
      if (!value) {
        return "noData";
      }

      let isValid = false;

      if (typeof value === "string" || typeof value === "number") {
        isValid = validDate(String(value));
      } else if (value instanceof Date) {
        isValid = validDate(value.toISOString());
      }

      if (!isValid) {
        return "badBugTimestamp";
      }
      return null;
    }

    case "listingAvailableFrom": {
      if (!value) {
        return "noData";
      }

      let isValid = false;

      if (typeof value === "string" || typeof value === "number") {
        isValid = validDate(String(value));
      } else if (value instanceof Date) {
        isValid = validDate(value.toISOString());
      }

      if (!isValid) {
        return "badListingAvailableFrom";
      }
      return null;
    }

    case "listingAvailableTo": {
      if (!value) {
        return "noData";
      }

      let isValid = false;

      if (typeof value === "string" || typeof value === "number") {
        isValid = validDate(String(value));
      } else if (value instanceof Date) {
        isValid = validDate(value.toISOString());
      }

      if (!isValid) {
        return "badListingAvailableTo";
      }
      return null;
    }

    case "language": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInLanguages(validValue);
      if (!isValid) {
        return "badLanguage";
      }
      return null;
    }

    case "bugEnvironment": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInBugEnvironment(validValue);
      if (!isValid) {
        return "badBugEnvironment";
      }
      return null;
    }

    case "companyWorkerRole": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInCompanyWorkerRoles(validValue);
      if (!isValid) {
        return "badCompanyWorkerRole";
      }
      return null;
    }

    case "bugPriority": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInBugPriority(validValue);
      if (!isValid) {
        return "badBugPriority";
      }
      return null;
    }

    case "bugStatus": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInBugStatus(validValue);
      if (!isValid) {
        return "badBugStatus";
      }
      return null;
    }

    case "reportType": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInReportType(validValue);
      if (!isValid) {
        return "badReportType";
      }
      return null;
    }

    case "reportDescription": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 100,
        minLength: 6,
        value,
      });

      if (!isValid) {
        return "badReportDescription";
      }
      return null;
    }

    case "companyName": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 50,
        minLength: 6,
        value,
      });
      if (!isValid) {
        return "badCompanyName";
      }
      return null;
    }

    case "district": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 30,
        minLength: 3,
        value,
      });
      if (!isValid) {
        return "badDistrict";
      }
      return null;
    }

    case "taxNumber": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value === "number") {
        const isValid = validStringMinAndMaxLength({
          maxLength: 12,
          minLength: 9,
          value: value.toString(),
        });
        if (!isValid) {
          return "badTaxNumber";
        }
        return null;
      } else if (typeof value === "string") {
        const isValid = validStringMinAndMaxLength({
          maxLength: 12,
          minLength: 9,
          value: value,
        });
        if (!isValid) {
          return "badTaxNumber";
        }
        return null;
      } else {
        return "somethingWentWrong";
      }
    }

    case "taxCountry": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInTaxCountries(validValue);
      if (!isValid) {
        return "badTaxCountry";
      }
      return null;
    }

    case "country": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInCountries(validValue);
      if (!isValid) {
        return "badCountry";
      }
      return null;
    }

    case "image": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = isFile(value);
      if (!isValid) {
        return "badImage";
      }
      return null;
    }

    case "recaptcha": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinLength({
        minLength: 100,
        value,
      });
      if (!isValid) {
        return "badRecaptcha";
      }
      return null;
    }

    case "companyPhoneCountryCode":
    case "phoneCountryCode": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInCountriesCode(validValue);
      if (!isValid) {
        return "badPhoneCountryCode";
      }
      return null;
    }

    case "mapZoom":
    case "page":
    case "limit": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 2,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "somethingWentWrong";
      }
      return null;
    }

    case "locationRadius": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 30,
        min: 1,
        value,
      });

      if (!isValid) {
        return "somethingWentWrong";
      }
      return null;
    }

    case "mapLocationNorth":
    case "mapLocationSouth":
    case "mapLocationWest":
    case "mapLocationEast": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 10,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "somethingWentWrong";
      }
      return null;
    }

    case "date": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validDate(value);

      if (!isValid) {
        return "badDate";
      }
      return null;
    }

    case "day": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 31,
        min: 1,
        value,
      });

      if (!isValid) {
        return "badDay";
      }
      return null;
    }

    case "dayStart": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 31,
        min: 1,
        value,
      });

      if (!isValid) {
        return "badDayStart";
      }
      return null;
    }

    case "dayEnd": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 31,
        min: 1,
        value,
      });

      if (!isValid) {
        return "badDayEnd";
      }
      return null;
    }

    case "month": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 11,
        min: 0,
        value,
      });

      if (!isValid) {
        return "badMonth";
      }
      return null;
    }

    case "freeTrialCompanyMonthsCount": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 6,
        min: 0,
        value,
      });

      if (!isValid) {
        return "badFreeTrialCompanyMonthsCount";
      }
      return null;
    }

    case "freeTrialMaxListings": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 20,
        min: 0,
        value,
      });

      if (!isValid) {
        return "badFreeTrialMaxListings";
      }
      return null;
    }

    case "year": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 4,
        minLength: 4,
        value: value.toString(),
      });

      if (!isValid) {
        return "badYear";
      }
      return null;
    }

    case "companyPhoneNumber": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 9,
        minLength: 9,
        value: value.toString(),
      });

      if (!isValid) {
        return "badCompanyPhoneNumber";
      }

      const firstTwoDigits = Number(value.toString().slice(0, 2));
      if (firstTwoDigits < 45 || firstTwoDigits > 89) {
        return "badCompanyPhoneNumber";
      }

      return null;
    }

    case "phoneNumber": {
      if (optional && value === "") {
        return null;
      }

      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 9,
        minLength: 9,
        value: value.toString(),
      });

      if (!isValid) {
        return "badPhoneNumber";
      }

      const firstTwoDigits = Number(value.toString().slice(0, 2));
      if (firstTwoDigits < 45 || firstTwoDigits > 89) {
        return "badCompanyPhoneNumber";
      }

      return null;
    }

    case "flatNumber": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 30,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badFlatNumber";
      }
      return null;
    }

    case "city": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 50,
        minLength: 3,
        value,
      });
      if (!isValid) {
        return "badCity";
      }
      return null;
    }

    case "streetName": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 50,
        minLength: 3,
        value,
      });
      if (!isValid) {
        return "badStreetName";
      }
      return null;
    }

    case "streetNumber": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 30,
        minLength: 1,
        value,
      });
      if (!isValid) {
        return "badStreetNumber";
      }
      return null;
    }

    case "postalCode": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = isValidPostalCode(value);
      if (!isValid) {
        return "badPostalCode";
      }
      return null;
    }

    case "authenticator": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 40,
        minLength: 6,
        value,
      });

      if (!isValid) {
        return "badAuthenticator";
      }
      return null;
    }

    case "plansId": {
      if (typeof value === "string") {
        return "somethingWentWrong";
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badPlansId";
        }

        const hasBadValuesInArray = value.some(item => {
          if (!(typeof item === "string" || "value" in item)) {
            return "badPlansId";
          }

          const validValue = typeof item === "string" ? item : item.value;
          const isValid = validStringMinAndMaxLength({
            maxLength: 36,
            minLength: 36,
            value: validValue,
          });

          return !isValid;
        });

        if (hasBadValuesInArray) {
          return "badPlansId";
        }

        return null;
      } else {
        return "somethingWentWrong";
      }
    }

    case "uploadImagesGroupId":
    case "lastId":
    case "autocompletePlaceId":
    case "autocompleteSessionToken":
    case "blogPostId":
    case "listingId":
    case "invoiceId":
    case "subscriptionId":
    case "couponId":
    case "companyId":
    case "companyWorkerSettingsId":
    case "userId": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 36,
        minLength: 36,
        value,
      });
      if (!isValid) {
        return "somethingWentWrong";
      }
      return null;
    }

    case "companyWorkersIds": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "noSelectedCompanyWorkersIds";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValidId = validStringMinAndMaxLength({
              maxLength: 36,
              minLength: 36,
              value: item,
            });

            if (!isValidId) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValidId = validStringMinAndMaxLength({
            maxLength: 36,
            minLength: 36,
            value: item.value,
          });

          if (!isValidId) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "noSelectedCompanyWorkersIds";
        }
      } else {
        return "noSelectedCompanyWorkersIds";
      }

      return null;
    }

    case "companyWorkersSettingsIds": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "noSelectedCompanyWorkersSettings";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValidId = validStringMinAndMaxLength({
              maxLength: 36,
              minLength: 36,
              value: item,
            });

            if (!isValidId) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValidId = validStringMinAndMaxLength({
            maxLength: 36,
            minLength: 36,
            value: item.value,
          });

          if (!isValidId) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "noSelectedCompanyWorkersSettings";
        }
      } else {
        return "noSelectedCompanyWorkersSettings";
      }

      return null;
    }

    case "exchangeId": {
      let validValue: null | string = null;
      if (typeof value === "string" || value === null) {
        if (!value) {
          return "noSelectedExchange";
        }
        validValue = value;
      } else if (
        Array.isArray(value) ||
        typeof value === "boolean" ||
        typeof value === "number"
      ) {
        return "noSelectedExchange";
      } else if ("value" in value) {
        validValue = value.value;
      } else {
        return "noSelectedExchange";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 36,
        minLength: 36,
        value: validValue,
      });
      if (!isValid) {
        return "somethingWentWrong";
      }
      return null;
    }

    case "planId": {
      let validValue: null | string = null;
      if (typeof value === "string" || value === null) {
        if (!value) {
          return "noSelectedPlan";
        }
        validValue = value;
      } else if (
        Array.isArray(value) ||
        typeof value === "boolean" ||
        typeof value === "number"
      ) {
        return "noSelectedPlan";
      } else if ("value" in value) {
        validValue = value.value;
      } else {
        return "noSelectedPlan";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 36,
        minLength: 36,
        value: validValue,
      });
      if (!isValid) {
        return "somethingWentWrong";
      }
      return null;
    }

    case "bugId": {
      let validValue: null | string = null;
      if (typeof value === "string" || value === null) {
        if (!value) {
          return "noSelectedBug";
        }
        validValue = value;
      } else if (
        Array.isArray(value) ||
        typeof value === "boolean" ||
        typeof value === "number"
      ) {
        return "noSelectedBug";
      } else if ("value" in value) {
        validValue = value.value;
      } else {
        return "noSelectedBug";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 36,
        minLength: 36,
        value: validValue,
      });
      if (!isValid) {
        return "somethingWentWrong";
      }
      return null;
    }

    case "code": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 6,
        minLength: 6,
        value,
      });

      if (!isValid) {
        return "badAuthenticator";
      }
      return null;
    }

    case "referralCode": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 12,
        minLength: 12,
        value,
      });

      if (!isValid) {
        return "badReferralCode";
      }
      return null;
    }

    case "codeReset2FA": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 50,
        minLength: 6,
        value,
      });

      if (!isValid) {
        return "badCodeReset2FA";
      }
      return null;
    }

    case "exchangePoints": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 3,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badExchangePoints";
      }
      return null;
    }

    case "exchangeSubscriptionFreeDays": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 3,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badExchangeSubscriptionFreeDays";
      }
      return null;
    }

    case "exchangeName": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 100,
        minLength: 3,
        value,
      });

      if (!isValid) {
        return "badExchangeName";
      }
      return null;
    }

    case "planPrice": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 3,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badPlanPrice";
      }
      return null;
    }

    case "productPrice_1": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 3,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badProductPrice_1";
      }
      return null;
    }

    case "productPrice_2_5": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 3,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badProductPrice_2_5";
      }
      return null;
    }

    case "productPrice_6_plus": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 3,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badProductPrice_6_plus";
      }
      return null;
    }

    case "productPoints_1": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 4,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badProductPoints_1";
      }
      return null;
    }

    case "productPoints_2_5": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 4,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badProductPoints_2_5";
      }
      return null;
    }

    case "productPoints_6_plus": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 4,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badProductPoints_6_plus";
      }
      return null;
    }

    case "pointsReferralCompany": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 3,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badPointsReferralCompany";
      }
      return null;
    }

    case "pointsSmallBug":
    case "pointsMediumBug":
    case "pointsBigBug": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 3,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badPointsBugs";
      }
      return null;
    }

    case "pointsReferralUser": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 3,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badPointsReferralUser";
      }
      return null;
    }

    case "couponName": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 40,
        minLength: 3,
        value,
      });

      if (!isValid) {
        return "badCouponName";
      }
      return null;
    }

    case "couponPromotionCode": {
      if (typeof value !== "string") {
        return "noCouponPromotionCodeName";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 20,
        minLength: 5,
        value,
      });

      if (!isValid) {
        return "badCouponPromotionCodeName";
      }
      return null;
    }

    case "couponPercentOff": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 2,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badCouponPercentOff";
      }
      return null;
    }

    case "couponAmountOff": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 2,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badCouponAmountOff";
      }
      return null;
    }

    case "couponMinimumAmount": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 3,
        minLength: 2,
        value: value.toString(),
      });

      if (!isValid) {
        return "badCouponMinimumAmount";
      }
      return null;
    }

    case "couponDurationInMonths": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 12,
        min: 1,
        value,
      });

      if (!isValid) {
        return "badCouponDurationInMonths";
      }
      return null;
    }

    case "couponMaxRedemptions": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 4,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badCouponMaxRedemptions";
      }
      return null;
    }

    case "couponEndDate": {
      if (!value) {
        return "noData";
      }

      let isValid = false;

      if (typeof value === "string" || typeof value === "number") {
        isValid = validDate(String(value));
      } else if (value instanceof Date) {
        isValid = validDate(value.toISOString());
      }

      if (!isValid) {
        return "badCouponEndDate";
      }
      return null;
    }

    case "planName": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 40,
        minLength: 3,
        value,
      });

      if (!isValid) {
        return "badPlanName";
      }
      return null;
    }

    case "planDescription": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 100,
        minLength: 3,
        value,
      });

      if (!isValid) {
        return "badPlanDescription";
      }
      return null;
    }

    case "companyWorkerPermission": {
      if (typeof value === "string") {
        return "somethingWentWrong";
      }

      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badCompanyWorkerPermission";
        }

        const hasBadValuesInArray = value.some(item => {
          if (!(typeof item === "string" || "value" in item)) {
            return "badCompanyWorkerPermission";
          }

          const validValue = typeof item === "string" ? item : item.value;
          const isValid = isInCompanyWorkerPermissions(validValue);

          return !isValid;
        });

        if (hasBadValuesInArray) {
          return "badCompanyWorkerPermission";
        }

        return null;
      } else {
        return "somethingWentWrong";
      }
    }

    case "planType": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInPlanTypes(validValue);
      if (!isValid) {
        return "badPlanType";
      }
      return null;
    }

    case "planInterval": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInPlanIntervals(validValue);
      if (!isValid) {
        return "badPlanInterval";
      }
      return null;
    }

    case "planListingDurationMonths": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 100,
        min: 1,
        value,
      });

      if (!isValid) {
        return "badPlanListingDurationMonths";
      }
      return null;
    }

    case "planMaximumListingsInMonth": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 100,
        min: 1,
        value,
      });

      if (!isValid) {
        return "badPlanMaximumListingsInMonth";
      }
      return null;
    }

    case "companyDescription": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 1000,
        minLength: 0,
        value,
      });

      if (!isValid) {
        return "badCompanyDescription";
      }

      return null;
    }

    case "planIntervalCount": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validStringIsNumberMinAndMaxLength({
        maxLength: 1,
        minLength: 1,
        value: value.toString(),
      });

      if (!isValid) {
        return "badPlanIntervalCount";
      }
      return null;
    }

    case "listingExtension": {
      if (optional && value === "") {
        return null;
      }

      if (!isNumber(value)) {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 24,
        min: 1,
        value: Number(value),
      });

      if (!isValid) {
        return "badListingExtension";
      }
      return null;
    }

    case "listingMinimumRentalDays": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 100,
        min: 1,
        value,
      });

      if (!isValid) {
        return "badListingMinimumRentalDays";
      }
      return null;
    }

    case "listingRentalDays": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 1000,
        min: 1,
        value,
      });

      if (!isValid) {
        return "badListingRentalDays";
      }
      return null;
    }

    case "listingArea": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 999_999_999,
        min: 0,
        value,
      });

      if (!isValid) {
        return "badListingArea";
      }
      return null;
    }

    case "listingPrice": {
      if (optional && value === "") {
        return null;
      }
      if (typeof value !== "number") {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 100_000_000,
        min: 0,
        value,
      });

      if (!isValid) {
        return "badListingPrice";
      }
      return null;
    }

    case "listingCity": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "badCity";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = validStringMinAndMaxLength({
        maxLength: 50,
        minLength: 3,
        value: validValue,
      });

      if (!isValid) {
        return "badCity";
      }
      return null;
    }

    case "listingCategory": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingCategory(validValue);
      if (!isValid) {
        return "badListingCategory";
      }
      return null;
    }

    case "listingParkingTypes": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingParkingTypes";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingParkingType(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingParkingType(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingParkingTypes";
        }
      } else {
        return "badListingParkingTypes";
      }

      return null;
    }

    case "listingContainerTypes": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingContainerTypes";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingContainerType(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingContainerType(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingContainerTypes";
        }
      } else {
        return "badListingContainerTypes";
      }

      return null;
    }

    case "listingContainerType": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingContainerType(validValue);
      if (!isValid) {
        return "badListingContainerType";
      }
      return null;
    }

    case "listingPlotTypes": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingPlotTypes";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingPlotTypes(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingPlotTypes(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingPlotTypes";
        }
      } else {
        return "badListingPlotTypes";
      }

      return null;
    }

    case "listingUnitTypes": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingUnitTypes";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingUnitTypes(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingUnitTypes(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingUnitTypes";
        }
      } else {
        return "badListingUnitTypes";
      }

      return null;
    }

    case "listingCategories": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingCategories";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingCategory(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingCategory(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingCategories";
        }
      } else {
        return "badListingCategories";
      }

      return null;
    }

    case "listingStatus": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingStatus(validValue);
      if (!isValid) {
        return "badListingStatus";
      }
      return null;
    }

    case "listingDistrict": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "badListingDistrict";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = validStringMinAndMaxLength({
        maxLength: 50,
        minLength: 3,
        value: validValue,
      });

      if (!isValid) {
        return "badListingDistrict";
      }
      return null;
    }

    case "listingType": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingTypes(validValue);
      if (!isValid) {
        return "badListingType";
      }
      return null;
    }

    case "listingParkingType": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingParkingType(validValue);
      if (!isValid) {
        return "badListingParkingType";
      }
      return null;
    }

    case "listingUsageOption": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingUsageOption";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingUsageOptions(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingUsageOptions(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingUsageOption";
        }
      } else {
        return "badListingUsageOption";
      }

      return null;
    }

    case "listingEntryOption": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingEntryOption";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingEntryOptions(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingEntryOptions(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingEntryOption";
        }
      } else {
        return "badListingEntryOption";
      }

      return null;
    }

    case "listingUtilityOption": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingUtilityOption";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingUtilityOptions(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingUtilityOptions(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingUtilityOption";
        }
      } else {
        return "badListingUtilityOption";
      }

      return null;
    }

    case "listingComfortOption": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingComfortOption";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingComfortOptions(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingComfortOptions(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingComfortOption";
        }
      } else {
        return "badListingComfortOption";
      }

      return null;
    }

    case "listingSecurityOption": {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return optional ? null : "badListingSecurityOption";
        }

        const hasInvalidValue = value?.some(item => {
          if (!item) {
            return true;
          }

          if (typeof item === "boolean" || typeof item === "number") {
            return true;
          }

          if (typeof item === "string") {
            const isValid = isInListingSecurityOptions(item);

            if (!isValid) {
              return true;
            }

            return false;
          }

          if (!(typeof item === "string" || "value" in item)) {
            return true;
          }

          if (!item?.value || !item.label) {
            return true;
          }

          const isValid = isInListingSecurityOptions(item.value);

          if (!isValid) {
            return true;
          }

          return false;
        });

        if (hasInvalidValue) {
          return "badListingSecurityOption";
        }
      } else {
        return "badListingSecurityOption";
      }

      return null;
    }

    case "listingCondition": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingConditions(validValue);
      if (!isValid) {
        return "badListingCondition";
      }
      return null;
    }

    case "listingPlotType": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingPlotTypes(validValue);
      if (!isValid) {
        return "badListingPlotType";
      }
      return null;
    }

    case "listingUnitType": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingUnitTypes(validValue);
      if (!isValid) {
        return "badListingUnitType";
      }
      return null;
    }

    case "listingAccess": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingAccess(validValue);
      if (!isValid) {
        return "badListingAccess";
      }
      return null;
    }

    case "listingFloorLevel": {
      if (
        typeof value === "number" ||
        typeof value === "boolean" ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "badListingFloorLevel";
      }

      let validValue: null | string = null;
      if (typeof value === "string") {
        validValue = value;
      } else if (
        value !== null &&
        typeof value === "object" &&
        "value" in value &&
        typeof value.value === "string"
      ) {
        validValue = value.value;
      }

      if (!isNumber(validValue)) {
        return "somethingWentWrong";
      }

      const isValid = validNumberInRange({
        max: 12,
        min: -4,
        value: Number(validValue),
      });

      if (!isValid) {
        return "badListingFloorLevel";
      }
      return null;
    }

    case "listingContractType": {
      if (
        !(typeof value === "object" || typeof value === "string") ||
        Array.isArray(value) ||
        value === null ||
        isDate(value) ||
        value instanceof File
      ) {
        return "somethingWentWrong";
      }

      let validValue = "";
      validValue = typeof value === "string" ? value : value.value;

      const isValid = isInListingContractType(validValue);
      if (!isValid) {
        return "badListingContractType";
      }
      return null;
    }

    case "listingDescription": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 5000,
        minLength: 10,
        value,
      });
      if (!isValid) {
        return "badListingDescription";
      }
      return null;
    }

    case "listingTitle": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 100,
        minLength: 3,
        value,
      });
      if (!isValid) {
        return "badListingTitle";
      }
      return null;
    }

    case "paymentMethodId": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validatePaymentMethodId(value);

      if (!isValid) {
        return "badPaymentMethodId";
      }
      return null;
    }

    case "search": {
      if (typeof value !== "string") {
        return "somethingWentWrong";
      }

      const isValid = validStringMinAndMaxLength({
        maxLength: 50,
        minLength: 1,
        value,
      });

      if (!isValid) {
        return "somethingWentWrong";
      }
      return null;
    }

    case "listingHasAvailableDistricts":
    case "listingLongTerm":
    case "listingShortTerm":
    case "bugShowClosed":
    case "checkboxAcceptNewsletter":
    case "isMobile":
    case "checkboxListingUsePoints":
    case "checkboxListingUseCompanyCard":
    case "checkboxListingLongTerm":
    case "checkboxListingShortTerm":
    case "checkboxListingNegotiable":
    case "checkboxAcceptRegulationsText":
    case "checkboxAcceptPrivacyPolicyLink":
    case "checkboxSwitchCard":
    case "checkboxExchangeActive":
    case "companySettingsTwoFactorAuthenticationEnabled":
    case "companySettingsLoginPassword":
    case "companySettingsLoginFacebook":
    case "companySettingsLoginGoogle":
    case "bugIsReproducible":
    case "checkboxSubscriptionDeleteImmediately":
    case "checkboxCouponActive":
    case "couponFirstTimeTransaction":
    case "checkboxPlanActive":
    case "checkboxAuthenticatorEmailOTP":
    case "checkboxAuthenticator2FA":
    case "checkboxConsentNewsletter":
    case "checkboxConsentOpinion": {
      if (typeof value !== "boolean") {
        return "somethingWentWrong";
      }

      return null;
    }

    case "checkboxCreateListing":
    case "checkboxAcceptRegulations": {
      if (typeof value !== "boolean") {
        return "somethingWentWrong";
      }

      if (!value) {
        return "badCheckbox";
      }
      return null;
    }

    default: {
      return null;
    }
  }
};
