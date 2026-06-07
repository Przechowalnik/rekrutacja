import { randomUUID } from "node:crypto";

import dayjs from "dayjs";
import { TFunction } from "i18next";

import { namespaces } from "~/constants/namespaces";
import { queryKey, queryValue } from "~/constants/queryAndHashes";
import { E_Routes, getRoute, routesExtra } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";
import i18next from "~/localization/i18n.server";
import { allListingCategoryRent, allListingCategorySale } from "~/models/enums";

import {
  checkListingCityWithDistrictAndNearestCity,
  T_CheckListingCityResult,
} from "./city.server";
import { isFreeListingsServer } from "./flags.server";
import {
  calculatePointsFromMonths,
  convertToCorrectSlug,
  getLocalizedRedirectPath,
} from "./functions.server";
import { getGeolocation } from "./geolocation.server";
import { manageFilesInStorage } from "./images.server";
import { fireMetaInitiateCheckoutEvent } from "./metaCapi.server";
import {
  E_CompanyWorkerPermissionsServer,
  E_ListingCategoryServer,
  E_ListingContractTypeServer,
  E_ListingInteractionTypeServer,
  E_ListingPaymentStatusServer,
  E_ListingStatusServer,
  E_ListingTypeServer,
  E_RolesServer,
  E_SubscriptionStatusServer,
  T_ListingStatusServer,
} from "./models.server";
import { subtractPoints } from "./points.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  prismaSelectCompanyFreeTrial,
  prismaSelectListingForOwner,
  prismaSelectProduct,
  prismaSelectSubscription,
} from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { CURRENCY, formatAmountForStripe, stripe } from "./stripe.server";
import { getCompanyActivePlan } from "./subscription.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

function resolvePaymentCreateData(parameters: {
  companyHasFreeListing: boolean;
  companyListingDurationMonths: number;
  isCompany: boolean;
  isFreeListing: boolean;
  newDateExpiresAt: Date;
  newDateExpiresAtFreeListing: Date;
}) {
  const {
    companyHasFreeListing,
    companyListingDurationMonths,
    isCompany,
    isFreeListing,
    newDateExpiresAt,
    newDateExpiresAtFreeListing,
  } = parameters;

  const isFreePayment = isFreeListing || (isCompany && companyHasFreeListing);

  let expiresAtAfterAdd: Date | null = null;
  let monthsToAdd: null | number = null;

  if (isFreeListing) {
    expiresAtAfterAdd = newDateExpiresAtFreeListing;
    monthsToAdd = 1;
  } else if (isCompany && companyHasFreeListing) {
    expiresAtAfterAdd = newDateExpiresAt;
    monthsToAdd = companyListingDurationMonths;
  }

  return {
    expiresAtAfterAdd,
    free: isFreePayment,
    monthsToAdd,
    status: isFreePayment
      ? E_ListingPaymentStatusServer.FREE
      : E_ListingPaymentStatusServer.UNPAID,
  };
}

export const createListing = async ({
  isCompany,
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  isCompany: boolean;
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    if (!userCompanyId && isCompany) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const resultValidator = await checkZodValidator({
      arrayData: [
        formNames.listingSecurityOption,
        formNames.listingComfortOption,
        formNames.listingEntryOption,
        formNames.listingUsageOption,
        formNames.listingUtilityOption,
        formNames.listingImagesNew,
        formNames.listingImagesToRemove,
      ],
      request,
      validator: {
        [formNames.checkboxAcceptRegulations]: zodValidator.checkboxChecked,
        [formNames.checkboxCreateListing]: zodValidator.checkboxChecked,
        [formNames.checkboxListingNegotiable]: zodValidator.checkbox.optional(),
        [formNames.country]: zodValidator.country,
        [formNames.flatNumber]: zodValidator.flatNumber.optional(),
        [formNames.listingAccess]: zodValidator.listingAccess.optional(),
        [formNames.listingArea]: zodValidator.listingArea.optional(),
        [formNames.listingAvailableFrom]: zodValidator.date,
        [formNames.listingAvailableTo]: zodValidator.date.optional(),
        [formNames.listingCategory]: zodValidator.listingCategory,
        [formNames.listingCity]: zodValidator.listingCity,
        [formNames.listingComfortOption]:
          zodValidator.listingComfortOption.optional(),
        [formNames.listingCondition]: zodValidator.listingCondition.optional(),
        [formNames.listingContainerType]:
          zodValidator.listingContainerType.optional(),
        [formNames.listingContractType]:
          zodValidator.listingContractType.optional(),
        [formNames.listingDescription]:
          zodValidator.listingDescription.optional(),
        [formNames.listingDistrict]: zodValidator.listingDistrict.optional(),
        [formNames.listingEntryOption]:
          zodValidator.listingEntryOption.optional(),
        [formNames.listingFloorLevel]:
          zodValidator.listingFloorLevel.optional(),
        [formNames.listingImagesNew]: zodValidator.listingImagesToRemove
          .array()
          .optional(),
        [formNames.listingImagesToRemove]: zodValidator.listingImagesToRemove
          .array()
          .optional(),
        [formNames.listingMinimumRentalDays]:
          zodValidator.listingMinimumRentalDays.optional(),
        [formNames.listingParkingType]:
          zodValidator.listingParkingType.optional(),
        [formNames.listingPlotType]: zodValidator.listingPlotType.optional(),
        [formNames.listingPrice]: zodValidator.listingPrice,
        [formNames.listingSecurityOption]:
          zodValidator.listingSecurityOption.optional(),
        [formNames.listingTitle]: zodValidator.listingTitle,
        [formNames.listingType]: zodValidator.listingType,
        [formNames.listingUnitType]: zodValidator.listingUnitType.optional(),
        [formNames.listingUsageOption]:
          zodValidator.listingUsageOption.optional(),
        [formNames.listingUtilityOption]:
          zodValidator.listingUtilityOption.optional(),
        [formNames.postalCode]: zodValidator.postalCode,
        [formNames.streetName]: zodValidator.streetName,
        [formNames.streetNumber]: zodValidator.streetNumber,
        [formNames.uploadImagesGroupId]: zodValidator.uploadImagesGroupId,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: isCompany,
      prismaArguments: {
        select: {
          company: {
            select: {
              freeTrial: {
                select: prismaSelectCompanyFreeTrial,
              },
              subscriptions: {
                orderBy: {
                  createdAt: "asc",
                },
                select: prismaSelectSubscription,
                where: {
                  status: {
                    not: E_SubscriptionStatusServer.CANCELLED,
                  },
                },
              },
            },
          },
          lang: true,
          phone: {
            select: {
              countryCode: true,
              number: true,
            },
          },
          role: true,
          ...(isCompany
            ? {
                workerSettings: {
                  select: {
                    permissions: true,
                  },
                },
              }
            : {}),
        },
        where: {
          companyId: userCompanyId,
          id: userId,
        },
      },
      request,
      respectCompanyPhoneVerification: isCompany,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const {
      checkboxAcceptRegulations,
      checkboxCreateListing,
      checkboxListingNegotiable = false,
      country,
      flatNumber,
      listingAccess,
      listingArea,
      listingAvailableFrom = dayjs().startOf("day").toDate(),
      listingAvailableTo,
      listingCategory,
      listingCity,
      listingComfortOption = [],
      listingCondition,
      listingContainerType,
      listingContractType,
      listingDescription,
      listingDistrict,
      listingEntryOption = [],
      listingFloorLevel,
      listingImagesNew,
      listingImagesToRemove,
      listingMinimumRentalDays,
      listingParkingType,
      listingPlotType,
      listingPrice,
      listingSecurityOption = [],
      listingTitle,
      listingType,
      listingUnitType,
      listingUsageOption = [],
      listingUtilityOption = [],
      postalCode,
      streetName,
      streetNumber,
      uploadImagesGroupId,
    } = resultValidator.data;

    const validCondition =
      listingCategory === E_ListingCategoryServer.ROOM ||
      listingCategory === E_ListingCategoryServer.ATTIC ||
      listingCategory === E_ListingCategoryServer.BASEMENT ||
      listingCategory === E_ListingCategoryServer.WAREHOUSE ||
      listingCategory === E_ListingCategoryServer.UNIT;

    if (validCondition && !listingCondition) {
      return await responseOnFailure({
        message: "noSelectedListingCondition",
        request,
        status: 422,
      });
    }

    if (!checkboxAcceptRegulations || !checkboxCreateListing) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    let isListingCategoryInSelectedType = false;
    if (listingCategory) {
      if (listingType === E_ListingTypeServer.RENT) {
        isListingCategoryInSelectedType =
          allListingCategoryRent.includes(listingCategory);
      } else if (listingType === E_ListingTypeServer.SALE) {
        isListingCategoryInSelectedType =
          allListingCategorySale.includes(listingCategory);
      }
    }

    if (listingCategory === E_ListingCategoryServer.PLOT && !listingPlotType) {
      return await responseOnFailure({
        message: "noListingPlotType",
        request,
        status: 422,
      });
    }

    if (listingCategory === E_ListingCategoryServer.UNIT && !listingUnitType) {
      return await responseOnFailure({
        message: "noListingUnitType",
        request,
        status: 422,
      });
    }

    if (!isListingCategoryInSelectedType) {
      return await responseOnFailure({
        message: "noListingCategoryInListingType",
        request,
        status: 422,
      });
    }

    if (listingType === E_ListingTypeServer.RENT && !listingContractType) {
      return await responseOnFailure({
        message: "noListingContractType",
        request,
        status: 422,
      });
    }

    if (
      listingContractType === E_ListingContractTypeServer.SHORT_TERM &&
      !listingMinimumRentalDays
    ) {
      return await responseOnFailure({
        message: "noListingMinimumRentalDays",
        request,
        status: 422,
      });
    }

    const geolocation = await getGeolocation({
      city: listingCity,
      country,
      district: listingDistrict,
      flatNumber,
      postalCode,
      streetName,
      streetNumber,
    });

    if (!geolocation) {
      return await responseOnFailure({
        message: "locationNotFound",
        request,
        status: 422,
      });
    }

    const resultCheckLocation =
      await checkListingCityWithDistrictAndNearestCity({
        listingCity,
        listingDistrict,
        listingGeolocation: geolocation,
        request,
      });

    if (resultCheckLocation?.responseError) {
      return await responseOnFailure(resultCheckLocation?.responseError);
    }

    if (!resultCheckLocation?.city) {
      return await responseOnFailure({
        message: "locationNotFound",
        request,
        status: 422,
      });
    }

    let companyHasFreeListing = false;
    let companyListingDurationMonths = 0;

    if (isCompany) {
      if (!existingUser?.company) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 401,
        });
      }

      if (
        !existingUser?.workerSettings?.permissions?.includes(
          E_CompanyWorkerPermissionsServer.MANAGE_LISTINGS,
        ) &&
        existingUser?.role !== E_RolesServer.B2B_OWNER
      ) {
        return await responseOnFailure({
          message: "noPermission",
          request,
          status: 401,
        });
      }

      const validFreeTrial = existingUser?.company?.freeTrial
        ? {
            endDate: existingUser.company.freeTrial.endDate,
            id: existingUser.company.freeTrial.id,
            plan: existingUser.company.freeTrial.plan,
            startDate: existingUser.company.freeTrial.startDate,
          }
        : null;

      const foundActivePlan = getCompanyActivePlan({
        freeTrial: validFreeTrial,
        subscriptions: existingUser.company.subscriptions,
      });

      if (foundActivePlan) {
        const startDateToSearch = dayjs().startOf("month").toDate();
        const endDateToSearch = dayjs().endOf("month").toDate();

        const countActiveCompanyListingsInMonth =
          await database.listingPayment.count({
            where: {
              createdAt: {
                gte: startDateToSearch,
                lte: endDateToSearch,
              },
              listing: {
                companyId: existingUser?.company?.id,
              },
              status: E_ListingPaymentStatusServer.FREE,
            },
          });

        companyHasFreeListing =
          countActiveCompanyListingsInMonth <
          foundActivePlan.maximumListingsInMonth;

        companyListingDurationMonths = foundActivePlan.listingDurationMonths;
      }
    }

    const isFreeListing = isFreeListingsServer();

    const newDateExpiresAt = dayjs()
      .add(companyListingDurationMonths, "month")
      .toDate();

    const newDateExpiresAtFreeListing = dayjs()
      .add(6, "month")
      .add(1, "day")
      .toDate();

    if (isFreeListing) {
      const foundPlatformSettings = await database.platformSetting.findFirst({
        select: {
          freeTrialMaxListings: true,
        },
      });

      if (!foundPlatformSettings) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const countActiveListings = await database.listing.count({
        where: {
          ...(isCompany
            ? { companyId: existingUser.company.id }
            : { userId: existingUser.id }),
          status: E_ListingStatusServer.ACTIVE,
        },
      });

      if (countActiveListings >= foundPlatformSettings.freeTrialMaxListings) {
        return await responseOnFailure({
          message: "freeListingsLimitReached",
          request,
          status: 422,
        });
      }
    }

    let expiresAt: Date | null = null;
    if (isFreeListing) {
      expiresAt = newDateExpiresAtFreeListing;
    } else if (isCompany && companyHasFreeListing) {
      expiresAt = newDateExpiresAt;
    }

    let status: T_ListingStatusServer = E_ListingStatusServer.UNPAID;
    if (isFreeListing || (isCompany && companyHasFreeListing)) {
      status = E_ListingStatusServer.ACTIVE;
    }

    const resultImages = await manageFilesInStorage({
      delete: listingImagesToRemove,
      folder: "listings",
      move:
        listingImagesNew && listingImagesNew.length > 0
          ? {
              destinationFolder: uploadImagesGroupId,
              paths: listingImagesNew,
            }
          : undefined,
      type: "images",
    });

    if (resultImages.moveErrors.length > 0) {
      console.error("Image move errors:", resultImages.moveErrors);
      return await responseOnFailure({
        message: "failedToMoveImages",
        request,
        status: 500,
      });
    }

    if (resultImages.deleteErrors.length > 0) {
      console.error("Image delete errors:", resultImages.deleteErrors);
    }

    const imageObjects = resultImages.moved.map((item, index) => ({
      isDefault: index === 0,
      url: item.url,
    }));

    const createdListing = await database.listing.create({
      data: {
        access: listingAccess,
        area: listingArea,
        availableFrom: listingAvailableFrom,
        availableTo: listingAvailableTo ?? null,
        category: listingCategory,
        comfortOptions: listingComfortOption,
        companyId: isCompany ? existingUser.company.id : null,
        condition: listingCondition ?? null,
        containerType:
          listingCategory === E_ListingCategoryServer.CONTAINER
            ? listingContainerType
            : null,
        contractType:
          listingType === E_ListingTypeServer.RENT
            ? (listingContractType ?? null)
            : null,
        description: listingDescription,
        entryOptions: listingEntryOption,
        expiresAt,
        floorLevel: listingFloorLevel,
        images: {
          create: imageObjects,
        },
        location: {
          create: {
            cityCustom: resultCheckLocation.cityCustom ?? null,
            cityId: resultCheckLocation.cityCustom
              ? null
              : (resultCheckLocation.city?.id ?? null),
            country,
            districtId: resultCheckLocation.cityCustom
              ? null
              : (resultCheckLocation.district?.id ?? null),
            flatNumber,
            lat: geolocation.lat,
            lng: geolocation.lng,
            nearestCityId: resultCheckLocation.city.id ?? null,
            postalCode,
            streetName,
            streetNumber,
          },
        },
        minimumRentalDays:
          (listingType === E_ListingTypeServer.RENT && listingContractType) ===
          E_ListingContractTypeServer.SHORT_TERM
            ? (listingMinimumRentalDays ?? null)
            : null,
        negotiable: checkboxListingNegotiable,
        parkingType:
          listingCategory === E_ListingCategoryServer.PARKING
            ? listingParkingType
            : null,
        payments: {
          create: resolvePaymentCreateData({
            companyHasFreeListing,
            companyListingDurationMonths,
            isCompany,
            isFreeListing,
            newDateExpiresAt,
            newDateExpiresAtFreeListing,
          }),
        },
        plotType:
          listingCategory === E_ListingCategoryServer.PLOT && listingPlotType
            ? listingPlotType
            : null,
        price: formatAmountForStripe(listingPrice),
        securityOptions: listingSecurityOption,
        slug: `temp-${randomUUID()}`,
        status,
        title: listingTitle,
        type: listingType,
        unitType:
          listingCategory === E_ListingCategoryServer.UNIT && listingUnitType
            ? listingUnitType
            : null,
        usageOptions: listingUsageOption,
        userId: isCompany ? undefined : existingUser.id,
        utilityOptions: listingUtilityOption,
      },
      select: { id: true, listingIndex: true },
    });

    const listingSlug = `${convertToCorrectSlug(listingTitle)}-${createdListing.listingIndex}`;

    await database.listing.update({
      data: { slug: listingSlug },
      where: { id: createdListing.id },
    });

    const resultListing = { slug: listingSlug };

    const isFree = isFreeListing || (isCompany && companyHasFreeListing);

    let message:
      | "successCreateListing"
      | "successCreateListingCompany"
      | "successCreateListingCompanyToPay"
      | "successCreateListingToPay";

    let redirectTo: { extraPath: string; route: E_Routes } | E_Routes;

    if (isFree) {
      if (isCompany) {
        message = "successCreateListingCompany";
        redirectTo = E_Routes.companyListings;
      } else {
        message = "successCreateListing";
        redirectTo = E_Routes.accountListings;
      }
    } else {
      if (isCompany) {
        message = "successCreateListingCompanyToPay";
        redirectTo = {
          extraPath: `/${resultListing.slug}${routesExtra[E_Routes.companyListings].payments}`,
          route: E_Routes.companyListings,
        };
      } else {
        message = "successCreateListingToPay";
        redirectTo = {
          extraPath: `/${resultListing.slug}${routesExtra[E_Routes.accountListings].payments}`,
          route: E_Routes.accountListings,
        };
      }
    }

    return await responseOnSuccess({
      data: {
        message,
        redirectTo,
        refetchUserSession: isCompany,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const getReusableListing = async ({
  isCompany,
  listingIdOrSlug,
  request,
  status = [
    E_ListingStatusServer.ACTIVE,
    E_ListingStatusServer.EXPIRED,
    E_ListingStatusServer.UNPAID,
    E_ListingStatusServer.ARCHIVED,
    E_ListingStatusServer.INACTIVE,
    E_ListingStatusServer.REJECTED,
  ],
  userCompanyId,
  userId,
  userSessionVersion,
  withPlatformProduct,
}: {
  isCompany: boolean;
  listingIdOrSlug: null | string | undefined;
  request: Request;
  status?: T_ListingStatusServer[];
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
  withPlatformProduct: boolean;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });
  try {
    if ((!userCompanyId && isCompany) || !listingIdOrSlug) {
      return redirectOnError;
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: isCompany,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
        },
      },
      request,
      respectCompanyPhoneVerification: isCompany,
      userSessionVersion,
    });

    if (responseError) {
      if (responseError.status === 401) {
        return await responseGetOnFailureLogout({
          request,
        });
      }

      return redirectOnError;
    }

    if (!existingUser) {
      return redirectOnError;
    }

    const foundProduct = withPlatformProduct
      ? await database.product.findFirst({
          select: prismaSelectProduct,
          where: {
            isDeletedAt: null,
          },
        })
      : null;

    if (!foundProduct && withPlatformProduct) {
      return redirectOnError;
    }

    const foundListing = await database.listing.findFirst({
      select: prismaSelectListingForOwner,
      where: {
        OR: [{ slug: listingIdOrSlug }, { id: listingIdOrSlug }],
        ...(isCompany
          ? {
              companyId: userCompanyId,
            }
          : {
              userId: existingUser.id,
            }),
        ...(status
          ? {
              status: {
                in: status,
              },
            }
          : {}),
      },
    });

    if (!foundListing) {
      return redirectOnError;
    }

    const grouped = await database.listingInteraction.groupBy({
      _count: { _all: true },
      by: ["type"],
      where: {
        listingId: foundListing.id,
        type: {
          in: [
            E_ListingInteractionTypeServer.VIEW,
            E_ListingInteractionTypeServer.CONTACT,
          ],
        },
      },
    });

    const views =
      grouped.find(g => g.type === E_ListingInteractionTypeServer.VIEW)?._count
        ._all ?? 0;
    const contacts =
      grouped.find(g => g.type === E_ListingInteractionTypeServer.CONTACT)
        ?._count._all ?? 0;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    foundListing._count = {
      contacts,
      views,
    };

    return await responseOnSuccess({
      data: {
        listing: foundListing,
        ...(withPlatformProduct
          ? {
              product: foundProduct,
            }
          : {}),
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const updateListing = async ({
  isCompany,
  listingIdOrSlug,
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  isCompany: boolean;
  listingIdOrSlug: null | string | undefined;
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    if ((!userCompanyId && isCompany) || !listingIdOrSlug) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const resultValidator = await checkZodValidator({
      arrayData: [
        formNames.listingImagesNew,
        formNames.listingImagesToRemove,
        formNames.listingSecurityOption,
        formNames.listingComfortOption,
        formNames.listingEntryOption,
        formNames.listingUsageOption,
        formNames.listingUtilityOption,
      ],
      request,
      validator: {
        [formNames.checkboxListingNegotiable]: zodValidator.checkbox.optional(),
        [formNames.country]: zodValidator.country.optional(),
        [formNames.flatNumber]: zodValidator.flatNumber.optional(),
        [formNames.listingAccess]: zodValidator.listingAccess.optional(),
        [formNames.listingArea]: zodValidator.listingArea.optional(),
        [formNames.listingAvailableFrom]: zodValidator.date,
        [formNames.listingAvailableTo]: zodValidator.date.optional(),
        [formNames.listingCategory]: zodValidator.listingCategory,
        [formNames.listingCity]: zodValidator.listingCity.optional(),
        [formNames.listingComfortOption]:
          zodValidator.listingComfortOption.optional(),
        [formNames.listingCondition]: zodValidator.listingCondition.optional(),
        [formNames.listingContainerType]:
          zodValidator.listingContainerType.optional(),
        [formNames.listingContractType]:
          zodValidator.listingContractType.optional(),
        [formNames.listingDescription]:
          zodValidator.listingDescription.optional(),
        [formNames.listingDistrict]: zodValidator.listingDistrict.optional(),
        [formNames.listingEntryOption]:
          zodValidator.listingEntryOption.optional(),
        [formNames.listingFloorLevel]:
          zodValidator.listingFloorLevel.optional(),
        [formNames.listingImagesNew]: zodValidator.listingImagesToRemove
          .array()
          .optional(),
        [formNames.listingImagesToRemove]: zodValidator.listingImagesToRemove
          .array()
          .optional(),
        [formNames.listingMinimumRentalDays]:
          zodValidator.listingMinimumRentalDays.optional(),
        [formNames.listingParkingType]:
          zodValidator.listingParkingType.optional(),
        [formNames.listingPlotType]: zodValidator.listingPlotType.optional(),
        [formNames.listingPrice]: zodValidator.listingPrice,
        [formNames.listingSecurityOption]:
          zodValidator.listingSecurityOption.optional(),
        [formNames.listingTitle]: zodValidator.listingTitle,
        [formNames.listingType]: zodValidator.listingType,
        [formNames.listingUnitType]: zodValidator.listingUnitType.optional(),
        [formNames.listingUsageOption]:
          zodValidator.listingUsageOption.optional(),
        [formNames.listingUtilityOption]:
          zodValidator.listingUtilityOption.optional(),
        [formNames.postalCode]: zodValidator.postalCode.optional(),
        [formNames.streetName]: zodValidator.streetName.optional(),
        [formNames.streetNumber]: zodValidator.streetNumber.optional(),
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: isCompany,
      prismaArguments: {
        select: {
          phone: {
            select: {
              countryCode: true,
              number: true,
            },
          },
          role: true,
          ...(isCompany
            ? {
                workerSettings: {
                  select: {
                    permissions: true,
                  },
                },
              }
            : {}),
        },
        where: {
          ...(isCompany
            ? {
                companyId: userCompanyId,
              }
            : {}),
          id: userId,
        },
      },
      request,
      respectCompanyPhoneVerification: isCompany,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const searchListingProps = {
      OR: [{ slug: listingIdOrSlug }, { id: listingIdOrSlug }],
      ...(isCompany
        ? {
            companyId: userCompanyId,
          }
        : {
            userId: existingUser.id,
          }),
    };

    if (
      isCompany &&
      !existingUser?.workerSettings?.permissions?.includes(
        E_CompanyWorkerPermissionsServer.MANAGE_LISTINGS,
      ) &&
      existingUser?.role !== E_RolesServer.B2B_OWNER
    ) {
      return await responseOnFailure({
        message: "noPermission",
        request,
        status: 401,
      });
    }

    const foundListing = await database.listing.findFirst({
      select: {
        id: true,
        images: {
          select: {
            id: true,
            isDefault: true,
            url: true,
          },
        },
        listingIndex: true,
      },
      where: searchListingProps,
    });

    if (!foundListing) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const {
      checkboxListingNegotiable,
      country,
      flatNumber,
      listingAccess,
      listingArea,
      listingAvailableFrom,
      listingAvailableTo,
      listingCategory,
      listingCity,
      listingComfortOption,
      listingCondition,
      listingContainerType,
      listingContractType,
      listingDescription,
      listingDistrict,
      listingEntryOption,
      listingFloorLevel,
      listingImagesNew,
      listingImagesToRemove,
      listingMinimumRentalDays,
      listingParkingType,
      listingPlotType,
      listingPrice,
      listingSecurityOption,
      listingTitle,
      listingType,
      listingUnitType,
      listingUsageOption,
      listingUtilityOption,
      postalCode,
      streetName,
      streetNumber,
    } = resultValidator.data;

    const validCondition =
      listingCategory === E_ListingCategoryServer.ROOM ||
      listingCategory === E_ListingCategoryServer.ATTIC ||
      listingCategory === E_ListingCategoryServer.BASEMENT ||
      listingCategory === E_ListingCategoryServer.WAREHOUSE ||
      listingCategory === E_ListingCategoryServer.UNIT;

    if (validCondition && !listingCondition) {
      return await responseOnFailure({
        message: "noSelectedListingCondition",
        request,
        status: 422,
      });
    }

    let isListingCategoryInSelectedType = false;
    if (listingCategory) {
      if (listingType === E_ListingTypeServer.RENT) {
        isListingCategoryInSelectedType =
          allListingCategoryRent.includes(listingCategory);
      } else if (listingType === E_ListingTypeServer.SALE) {
        isListingCategoryInSelectedType =
          allListingCategorySale.includes(listingCategory);
      }
    }

    if (!isListingCategoryInSelectedType) {
      return await responseOnFailure({
        message: "noListingCategoryInListingType",
        request,
        status: 422,
      });
    }

    if (listingCategory === E_ListingCategoryServer.PLOT && !listingPlotType) {
      return await responseOnFailure({
        message: "noListingPlotType",
        request,
        status: 422,
      });
    }

    if (listingCategory === E_ListingCategoryServer.UNIT && !listingUnitType) {
      return await responseOnFailure({
        message: "noListingUnitType",
        request,
        status: 422,
      });
    }

    if (listingType === E_ListingTypeServer.RENT && !listingContractType) {
      return await responseOnFailure({
        message: "noListingContractType",
        request,
        status: 422,
      });
    }

    if (
      listingContractType === E_ListingContractTypeServer.SHORT_TERM &&
      !listingMinimumRentalDays
    ) {
      return await responseOnFailure({
        message: "noListingMinimumRentalDays",
        request,
        status: 422,
      });
    }

    let geolocation: {
      address: string;
      lat: number;
      lng: number;
    } | null = null;

    let locationCheckResult: null | T_CheckListingCityResult = null;

    if (listingCity && country) {
      geolocation = await getGeolocation({
        city: listingCity,
        country,
        district: listingDistrict,
        flatNumber,
        postalCode,
        streetName,
        streetNumber,
      });

      if (!geolocation) {
        return await responseOnFailure({
          message: "locationNotFound",
          request,
          status: 422,
        });
      }

      const resultCheckLocation =
        await checkListingCityWithDistrictAndNearestCity({
          listingCity,
          listingDistrict,
          listingGeolocation: geolocation,
          request,
        });

      if (resultCheckLocation?.responseError) {
        return await responseOnFailure(resultCheckLocation?.responseError);
      }

      if (!resultCheckLocation?.city) {
        return await responseOnFailure({
          message: "locationNotFound",
          request,
          status: 422,
        });
      }

      locationCheckResult = resultCheckLocation;
    }

    const existingImages = foundListing.images || [];

    const resultImages = await manageFilesInStorage({
      delete: listingImagesToRemove,
      folder: "listings",
      move:
        listingImagesNew && listingImagesNew.length > 0
          ? {
              destinationFolder: foundListing.id,
              paths: listingImagesNew,
            }
          : undefined,
      type: "images",
    });

    if (resultImages.moveErrors.length > 0) {
      console.error("Image move errors:", resultImages.moveErrors);
      return await responseOnFailure({
        message: "failedToMoveImages",
        request,
        status: 500,
      });
    }

    if (resultImages.deleteErrors.length > 0) {
      console.error("Image delete errors:", resultImages.deleteErrors);
    }

    if (listingImagesToRemove && listingImagesToRemove.length > 0) {
      await database.listingImage.deleteMany({
        where: {
          listingId: foundListing.id,
          url: {
            in: listingImagesToRemove,
          },
        },
      });
    }

    const newImagesToCreate: Array<{ isDefault: boolean; url: string }> =
      resultImages.moved.map(item => ({
        isDefault: false,
        url: item.url,
      }));

    // Get remaining images after deletion
    const remainingImages = existingImages.filter(
      img => !listingImagesToRemove?.includes(img.url),
    );

    // Calculate total images count
    const totalImagesCount = remainingImages.length + newImagesToCreate.length;

    if (totalImagesCount > 0 && !remainingImages.some(img => img.isDefault)) {
      if (newImagesToCreate.length > 0) {
        newImagesToCreate[0]!.isDefault = true;
      } else if (remainingImages.length > 0) {
        await database.listingImage.update({
          data: { isDefault: true },
          where: { id: remainingImages[0]!.id },
        });
      }
    }

    await database.listing.update({
      data: {
        access: listingAccess,
        area: listingArea,
        availableFrom: listingAvailableFrom,
        availableTo: listingAvailableTo ?? null,
        category: listingCategory,
        comfortOptions: listingComfortOption,
        condition: listingCondition ?? null,
        containerType:
          listingCategory === E_ListingCategoryServer.CONTAINER
            ? listingContainerType
            : null,
        contractType:
          listingType === E_ListingTypeServer.RENT
            ? (listingContractType ?? null)
            : null,
        description: listingDescription,
        entryOptions: listingEntryOption,
        floorLevel: listingFloorLevel,
        images:
          newImagesToCreate.length > 0
            ? {
                create: newImagesToCreate,
              }
            : undefined,
        location:
          geolocation && listingCity && country && locationCheckResult
            ? {
                update: {
                  cityCustom: locationCheckResult.cityCustom ?? null,
                  cityId: locationCheckResult.cityCustom
                    ? null
                    : (locationCheckResult.city?.id ?? null),
                  country,
                  districtId: locationCheckResult.cityCustom
                    ? null
                    : (locationCheckResult.district?.id ?? null),
                  flatNumber,
                  lat: geolocation.lat,
                  lng: geolocation.lng,
                  nearestCityId: locationCheckResult?.city
                    ? locationCheckResult.city.id
                    : null,
                  postalCode,
                  streetName,
                  streetNumber,
                },
              }
            : undefined,
        minimumRentalDays:
          listingType === E_ListingTypeServer.RENT &&
          listingContractType === E_ListingContractTypeServer.SHORT_TERM
            ? (listingMinimumRentalDays ?? null)
            : null,
        negotiable: checkboxListingNegotiable,
        parkingType:
          listingCategory === E_ListingCategoryServer.PARKING
            ? listingParkingType
            : null,
        plotType:
          listingCategory === E_ListingCategoryServer.PLOT && listingPlotType
            ? listingPlotType
            : null,
        price: formatAmountForStripe(listingPrice),
        securityOptions: listingSecurityOption,
        slug: `${convertToCorrectSlug(listingTitle)}-${foundListing.listingIndex}`,
        title: listingTitle,
        type: listingType,
        unitType:
          listingCategory === E_ListingCategoryServer.UNIT && listingUnitType
            ? listingUnitType
            : null,
        usageOptions: listingUsageOption,
        utilityOptions: listingUtilityOption,
      },
      where: { id: foundListing.id },
    });

    return await responseOnSuccess({
      flashData: {
        message: isCompany
          ? "successUpdateListingCompany"
          : "successUpdateListing",
      },
      redirectTo: isCompany
        ? E_Routes.companyListings
        : E_Routes.accountListings,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const extensionListing = async ({
  isCompany,
  listingIdOrSlug,
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  isCompany: boolean;
  listingIdOrSlug: null | string | undefined;
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    if ((!userCompanyId && isCompany) || !listingIdOrSlug) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.checkboxListingUseCompanyCard]:
          zodValidator.checkbox.optional(),
        [formNames.checkboxListingUsePoints]: zodValidator.checkbox.optional(),
        [formNames.listingExtension]: zodValidator.listingExtension,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }
    const {
      checkboxListingUseCompanyCard,
      checkboxListingUsePoints,
      listingExtension,
    } = resultValidator.data;

    const { existingUser, responseError } = isCompany
      ? await getAndCheckUser({
          authenticator: false,
          company: true,
          prismaArguments: {
            select: {
              company: {
                select: {
                  points: {
                    select: {
                      balance: true,
                    },
                  },
                  ...(checkboxListingUseCompanyCard
                    ? {
                        stripe: {
                          select: {
                            customerCardId: true,
                            customerId: true,
                          },
                        },
                      }
                    : {}),
                },
              },
              email: true,
              lang: true,
              points: {
                select: {
                  balance: true,
                },
              },
              role: true,
              workerSettings: {
                select: {
                  permissions: true,
                },
              },
            },
            where: {
              companyId: userCompanyId,
              id: userId,
            },
          },
          request,
          respectCompanyPhoneVerification: isCompany,
          userSessionVersion,
        })
      : await getAndCheckUser({
          authenticator: false,
          prismaArguments: {
            select: {
              email: true,
              lang: true,
              points: {
                select: {
                  balance: true,
                },
              },
              role: true,
            },
            where: {
              companyId: userCompanyId,
              id: userId,
            },
          },
          request,
          userSessionVersion,
        });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const searchListingProps = {
      OR: [{ slug: listingIdOrSlug }, { id: listingIdOrSlug }],
      ...(isCompany && existingUser?.company
        ? {
            companyId: existingUser.company.id,
          }
        : {
            userId: existingUser.id,
          }),
    };

    const foundActiveProduct = await database.product.findFirst({
      select: {
        points_1: true,
        points_2_5: true,
        points_6_plus: true,
        price_1: true,
        price_2_5: true,
        price_6_plus: true,
      },
      where: {
        isDeletedAt: null,
      },
    });

    if (!foundActiveProduct) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    if (
      isCompany &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !existingUser?.workerSettings?.permissions?.includes(
        E_CompanyWorkerPermissionsServer.MANAGE_LISTINGS,
      ) &&
      existingUser?.role !== E_RolesServer.B2B_OWNER
    ) {
      return await responseOnFailure({
        message: "noPermission",
        request,
        status: 401,
      });
    }

    const foundListing = await database.listing.findFirst({
      select: {
        expiresAt: true,
        id: true,
      },
      where: searchListingProps,
    });

    if (!foundListing) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    let amount: number;
    if (listingExtension === 1) {
      amount = Number(foundActiveProduct.price_1);
    } else if (listingExtension > 1 && listingExtension <= 5) {
      amount = Number(foundActiveProduct.price_2_5);
    } else {
      amount = Number(foundActiveProduct.price_6_plus);
    }

    const url = new URL(request.url);
    const origin = `${url.protocol}//${url.host}`;

    if (checkboxListingUsePoints) {
      const validBalance =
        isCompany && existingUser?.company && "points" in existingUser.company
          ? (existingUser?.company?.points?.balance ?? 0)
          : (existingUser?.points?.balance ?? 0);

      const pointsNeededToExtension = calculatePointsFromMonths({
        months: listingExtension,
        product: foundActiveProduct,
      });

      if (validBalance < pointsNeededToExtension) {
        return await responseOnFailure({
          message: "noEnoughPoints",
          request,
          status: 422,
        });
      }

      const resultSubtractPoints = await subtractPoints({
        companyIdSubtractPoints:
          isCompany && existingUser?.company ? existingUser.company.id : null,
        pointsToSubtract: pointsNeededToExtension,
        request,
        userIdSubtractPoints: isCompany ? null : existingUser.id,
      });

      if (resultSubtractPoints?.responseError) {
        return await responseOnFailure(resultSubtractPoints?.responseError);
      }

      const isListingCurrentlyActive = foundListing?.expiresAt
        ? dayjs(foundListing.expiresAt).isAfter(dayjs())
        : false;

      const validOldDate = isListingCurrentlyActive
        ? dayjs(foundListing?.expiresAt)
        : dayjs();

      const newDateExpiresAt = validOldDate
        .add(listingExtension ?? 0, "month")
        .toDate();

      await database.listingPayment.create({
        data: {
          expiresAtAfterAdd: newDateExpiresAt,
          expiresAtBeforeAdd: foundListing?.expiresAt,
          free: false,
          listingId: foundListing.id,
          monthsToAdd: listingExtension,
          points: pointsNeededToExtension,
          status: E_ListingPaymentStatusServer.PAID,
        },
      });

      await database.listing.update({
        data: {
          expiresAt: newDateExpiresAt,
          status: E_ListingStatusServer.ACTIVE,
        },
        where: {
          id: foundListing.id,
        },
      });

      return await responseOnSuccess({
        flashData: {
          message: "successExtensionListing",
        },
        redirectTo: {
          route: isCompany
            ? E_Routes.companyListings
            : E_Routes.accountListings,
        },
        request,
        status: 200,
      });
    }

    if (
      checkboxListingUseCompanyCard &&
      existingUser?.company &&
      "stripe" in existingUser.company &&
      existingUser?.company?.stripe?.customerId &&
      existingUser?.company?.stripe?.customerCardId
    ) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * listingExtension,
        confirm: true,
        currency: CURRENCY,
        customer: existingUser?.company?.stripe?.customerId,
        metadata: {
          context: "paymentIntents",
          ...(isCompany
            ? {
                companyId: existingUser.company.id,
              }
            : {
                userId: existingUser.id,
              }),
          quantity: listingExtension,
          unitAmount: amount,
        },
        payment_method: existingUser?.company?.stripe?.customerCardId,
        return_url: `${origin}${getLocalizedRedirectPath(
          getRoute({
            extraQuery: {
              [queryKey.message]: "successExtensionListingPaymentIntent3DS", // TODO in account and company
              [queryKey.messageStatus]: queryValue.messageStatusInformation,
            },
            route: isCompany
              ? E_Routes.companyListings
              : E_Routes.accountListings,
          }),
          request,
        )}`,
      });

      // NOSONAR
      // if (paymentIntent.status === "requires_action") {
      //   return await responseOnFailure({
      //     message: "cardRequires3DS",
      //     status: 422,
      //   });
      // }

      await database.listingPayment.create({
        data: {
          amount: amount * listingExtension,
          free: false,
          listingId: foundListing.id,
          monthsToAdd: listingExtension,
          status: E_ListingPaymentStatusServer.PENDING,
          stripePaymentIntentId: paymentIntent.id,
        },
      });

      if (paymentIntent.next_action?.redirect_to_url?.url) {
        return await responseOnSuccess({
          redirectTo: {
            customUrl: paymentIntent.next_action?.redirect_to_url?.url,
            route: null,
          },
          request,
          status: 200,
        });
      }

      return await responseOnSuccess({
        flashData: {
          message: "successExtensionListingPaymentIntent",
        },
        redirectTo: {
          route: isCompany
            ? E_Routes.companyListings
            : E_Routes.accountListings,
        },
        request,
        status: 200,
      });
    }

    const t: TFunction<"invoice", undefined> = await i18next.getFixedT(
      existingUser.lang.toLowerCase(),
      namespaces.invoice,
    );

    const sessionCheckout = await stripe.checkout.sessions.create({
      cancel_url: `${origin}${getLocalizedRedirectPath(
        getRoute({
          extraQuery: {
            [queryKey.message]: "errorExtensionListing",
            [queryKey.messageStatus]: queryValue.messageStatusFailure,
          },
          route: isCompany
            ? E_Routes.companyListings
            : E_Routes.accountListings,
        }),
        request,
      )}`,
      customer_email: existingUser.email,
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: t("listing"),
            },
            unit_amount: amount,
          },
          quantity: listingExtension,
        },
      ],
      metadata: {
        ...(isCompany && existingUser?.company
          ? {
              companyId: existingUser.company.id,
            }
          : {
              userId: existingUser.id,
            }),
        quantity: listingExtension,
        unitAmount: amount,
      },
      mode: "payment",
      payment_intent_data: {
        metadata: {
          context: "checkout",
          ...(isCompany && existingUser?.company
            ? {
                companyId: existingUser.company.id,
              }
            : {
                userId: existingUser.id,
              }),
          quantity: listingExtension,
          unitAmount: amount,
        },
      },
      payment_method_types: ["blik", "p24", "card", "paypal"],
      success_url: `${origin}${getLocalizedRedirectPath(
        getRoute({
          extraQuery: {
            [queryKey.message]: "successExtensionListing",
            [queryKey.messageStatus]: queryValue.messageStatusSuccess,
          },
          route: isCompany
            ? E_Routes.companyListings
            : E_Routes.accountListings,
        }),
        request,
      )}`,
    });

    await database.listingPayment.create({
      data: {
        amount: amount * listingExtension,
        free: false,
        listingId: foundListing.id,
        monthsToAdd: listingExtension,
        status: E_ListingPaymentStatusServer.PENDING,
        stripeCheckoutId: sessionCheckout.id,
        stripeCheckoutUrl: sessionCheckout.url,
      },
    });

    fireMetaInitiateCheckoutEvent({
      amount: amount * listingExtension,
      currency: CURRENCY,
      email: existingUser.email,
      listingId: foundListing.id,
      request,
      userId: existingUser.id,
    });

    return await responseOnSuccess({
      redirectTo: {
        customUrl: sessionCheckout.url ?? undefined,
        route: null,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const extensionFreeListingListing = async ({
  isCompany,
  listingIdOrSlug,
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  isCompany: boolean;
  listingIdOrSlug: null | string | undefined;
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    if (
      (!userCompanyId && isCompany) ||
      !listingIdOrSlug ||
      !isFreeListingsServer()
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = isCompany
      ? await getAndCheckUser({
          authenticator: false,
          company: true,
          prismaArguments: {
            select: {
              company: {
                select: {
                  points: {
                    select: {
                      balance: true,
                    },
                  },
                },
              },
              email: true,
              lang: true,
              points: {
                select: {
                  balance: true,
                },
              },
              role: true,
              workerSettings: {
                select: {
                  permissions: true,
                },
              },
            },
            where: {
              companyId: userCompanyId,
              id: userId,
            },
          },
          request,
          respectCompanyPhoneVerification: isCompany,
          userSessionVersion,
        })
      : await getAndCheckUser({
          authenticator: false,
          prismaArguments: {
            select: {
              email: true,
              lang: true,
              points: {
                select: {
                  balance: true,
                },
              },
              role: true,
            },
            where: {
              companyId: userCompanyId,
              id: userId,
            },
          },
          request,
          userSessionVersion,
        });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const foundPlatformSettings = await database.platformSetting.findFirst({
      select: {
        freeTrialMaxListings: true,
      },
    });

    if (!foundPlatformSettings) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const countActiveListings = await database.listing.count({
      where: {
        ...(isCompany
          ? { companyId: userCompanyId }
          : { userId: existingUser.id }),
        status: E_ListingStatusServer.ACTIVE,
      },
    });

    if (countActiveListings >= foundPlatformSettings.freeTrialMaxListings) {
      return await responseOnFailure({
        message: "freeListingsLimitReached",
        request,
        status: 422,
      });
    }

    if (
      isCompany &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !existingUser?.workerSettings?.permissions?.includes(
        E_CompanyWorkerPermissionsServer.MANAGE_LISTINGS,
      ) &&
      existingUser?.role !== E_RolesServer.B2B_OWNER
    ) {
      return await responseOnFailure({
        message: "noPermission",
        request,
        status: 401,
      });
    }

    const foundListing = await database.listing.findFirst({
      select: {
        expiresAt: true,
        id: true,
      },
      where: {
        OR: [{ slug: listingIdOrSlug }, { id: listingIdOrSlug }],
        ...(isCompany && existingUser?.company
          ? {
              companyId: existingUser.company.id,
            }
          : {
              userId: existingUser.id,
            }),
      },
    });

    if (!foundListing) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const isListingCurrentlyActive = foundListing?.expiresAt
      ? dayjs(foundListing.expiresAt).isAfter(dayjs())
      : false;

    const newDateExpiresAtFreeListing = (
      isListingCurrentlyActive ? dayjs(foundListing?.expiresAt) : dayjs()
    )
      .add(6, "month")
      .add(1, "day")
      .startOf("day")
      .toDate();

    await database.listing.update({
      data: {
        expiresAt: newDateExpiresAtFreeListing,
        payments: {
          create: {
            expiresAtAfterAdd: newDateExpiresAtFreeListing,
            free: true,
            monthsToAdd: 1,
            status: E_ListingPaymentStatusServer.FREE,
          },
        },
        status: E_ListingStatusServer.ACTIVE,
      },
      where: {
        id: foundListing.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: isCompany
          ? "successExtensionListingCompany"
          : "successExtensionListing",
      },
      redirectTo: isCompany
        ? E_Routes.companyListings
        : E_Routes.accountListings,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const deleteListing = async ({
  isCompany,
  listingIdOrSlug,
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  isCompany: boolean;
  listingIdOrSlug: null | string | undefined;
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    if ((!userCompanyId && isCompany) || !listingIdOrSlug) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.listingDeleteReason]: zodValidator.listingDeleteReason,
        [formNames.listingId]: zodValidator.listingId,
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: isCompany,
      prismaArguments: {
        select: isCompany
          ? {
              role: true,
              workerSettings: {
                select: {
                  permissions: true,
                },
              },
            }
          : {
              role: true,
            },
        where: {
          companyId: userCompanyId,
          id: userId,
        },
      },
      request,
      respectCompanyPhoneVerification: isCompany,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (
      isCompany &&
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      !existingUser?.workerSettings?.permissions?.includes(
        E_CompanyWorkerPermissionsServer.MANAGE_LISTINGS,
      ) &&
      existingUser?.role !== E_RolesServer.B2B_OWNER
    ) {
      return await responseOnFailure({
        message: "noPermission",
        request,
        status: 401,
      });
    }

    const foundListing = await database.listing.findFirst({
      select: {
        id: true,
        images: {
          select: {
            id: true,
            isDefault: true,
            url: true,
          },
        },
      },
      where: {
        OR: [{ slug: listingIdOrSlug }, { id: listingIdOrSlug }],
        status: E_ListingStatusServer.ACTIVE,
        ...(isCompany
          ? {
              companyId: userCompanyId,
            }
          : {
              userId: existingUser.id,
            }),
      },
    });

    if (!foundListing) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const existingImages = foundListing.images || [];

    if (existingImages.length > 0) {
      const resultImages = await manageFilesInStorage({
        delete: existingImages.map(img => img.url),
        folder: null,
        type: null,
      });

      if (resultImages.deleteErrors.length > 0) {
        console.error("Image delete errors:", resultImages.deleteErrors);
      }

      await database.listingImage.deleteMany({
        where: {
          listingId: foundListing.id,
        },
      });
    }

    await database.listing.update({
      data: {
        deleteReason:
          resultValidator.data[formNames.listingDeleteReason] ?? null,
        status: E_ListingStatusServer.DELETED,
      },
      where: {
        id: foundListing.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: isCompany
          ? "successDeleteListingCompany"
          : "successDeleteListing",
      },
      redirectTo: isCompany
        ? E_Routes.companyListings
        : E_Routes.accountListings,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
