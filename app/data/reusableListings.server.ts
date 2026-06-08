import { randomUUID } from "node:crypto";

import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";
import { allListingCategoryRent, allListingCategorySale } from "~/models/enums";

import {
  checkListingCityWithDistrictAndNearestCity,
  T_CheckListingCityResult,
} from "./city.server";
import { convertToCorrectSlug } from "./functions.server";
import { getGeolocation } from "./geolocation.server";
import { manageFilesInStorage } from "./images.server";
import {
  E_CompanyWorkerPermissionsServer,
  E_ListingCategoryServer,
  E_ListingContractTypeServer,
  E_ListingInteractionTypeServer,
  E_ListingPaymentStatusServer,
  E_ListingStatusServer,
  E_ListingTypeServer,
  E_RolesServer,
  T_ListingStatusServer,
} from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectListingForOwner } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

// All listings are free and valid for 6 months + 1 day from creation/renewal.
const FREE_LISTING_DURATION_MONTHS = 6;

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
              id: true,
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
    }

    // Listings are always free, active immediately, and valid for 6 months + 1 day.
    const expiresAt = dayjs()
      .add(FREE_LISTING_DURATION_MONTHS, "month")
      .add(1, "day")
      .toDate();

    const status: T_ListingStatusServer = E_ListingStatusServer.ACTIVE;

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
          create: {
            expiresAtAfterAdd: expiresAt,
            free: true,
            monthsToAdd: FREE_LISTING_DURATION_MONTHS,
            status: E_ListingPaymentStatusServer.FREE,
          },
        },
        plotType:
          listingCategory === E_ListingCategoryServer.PLOT && listingPlotType
            ? listingPlotType
            : null,
        price: BigInt(Math.round(listingPrice * 100)),
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

    const message = isCompany
      ? "successCreateListingCompany"
      : "successCreateListing";

    const redirectTo = isCompany
      ? E_Routes.companyListings
      : E_Routes.accountListings;

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
}: {
  isCompany: boolean;
  listingIdOrSlug: null | string | undefined;
  request: Request;
  status?: T_ListingStatusServer[];
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
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
        price: BigInt(Math.round(listingPrice * 100)),
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
    if ((!userCompanyId && isCompany) || !listingIdOrSlug) {
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
                  id: true,
                },
              },
              email: true,
              lang: true,
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
