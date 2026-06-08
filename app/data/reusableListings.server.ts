import { randomUUID } from "node:crypto";

import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import {
  checkListingCityWithDistrictAndNearestCity,
  T_CheckListingCityResult,
} from "./city.server";
import { convertToCorrectSlug } from "./functions.server";
import { getGeolocation } from "./geolocation.server";
import { manageFilesInStorage } from "./images.server";
import {
  E_CompanyWorkerPermissionsServer,
  E_ListingInteractionTypeServer,
  E_ListingPaymentStatusServer,
  E_ListingStatusServer,
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
      arrayData: [formNames.listingImagesNew, formNames.listingImagesToRemove],
      request,
      validator: {
        [formNames.checkboxAcceptRegulations]: zodValidator.checkboxChecked,
        [formNames.checkboxCreateListing]: zodValidator.checkboxChecked,
        [formNames.country]: zodValidator.country,
        [formNames.flatNumber]: zodValidator.flatNumber.optional(),
        [formNames.listingAvailableFrom]: zodValidator.date.optional(),
        [formNames.listingCategory]: zodValidator.listingCategory,
        [formNames.listingCity]: zodValidator.listingCity,
        [formNames.listingDescription]: zodValidator.listingDescription,
        [formNames.listingDistrict]: zodValidator.listingDistrict.optional(),
        [formNames.listingImagesNew]: zodValidator.listingImagesToRemove
          .array()
          .optional(),
        [formNames.listingImagesToRemove]: zodValidator.listingImagesToRemove
          .array()
          .optional(),
        [formNames.listingSalaryFrom]: zodValidator.listingSalaryFrom,
        [formNames.listingSalaryTo]: zodValidator.listingSalaryTo,
        [formNames.listingShowEmail]: zodValidator.checkbox,
        [formNames.listingShowPhone]: zodValidator.checkbox,
        [formNames.listingTitle]: zodValidator.listingTitle,
        [formNames.listingWorkMode]: zodValidator.listingWorkMode,
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
      country,
      flatNumber,
      listingAvailableFrom,
      listingCategory,
      listingCity,
      listingDescription,
      listingDistrict,
      listingImagesNew,
      listingImagesToRemove,
      listingSalaryFrom,
      listingSalaryTo,
      listingShowEmail,
      listingShowPhone,
      listingTitle,
      listingWorkMode,
      postalCode,
      streetName,
      streetNumber,
      uploadImagesGroupId,
    } = resultValidator.data;

    if (!checkboxAcceptRegulations || !checkboxCreateListing) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    if (listingSalaryFrom > listingSalaryTo) {
      return await responseOnFailure({
        message: "badListingSalary",
        request,
        status: 422,
      });
    }

    if (!listingShowPhone && !listingShowEmail) {
      return await responseOnFailure({
        message: "noListingContactMethod",
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
        availableFrom: listingAvailableFrom ?? null,
        category: listingCategory,
        companyId: isCompany ? existingUser.company.id : null,
        description: listingDescription,
        expiresAt,
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
        payments: {
          create: {
            expiresAtAfterAdd: expiresAt,
            free: true,
            monthsToAdd: FREE_LISTING_DURATION_MONTHS,
            status: E_ListingPaymentStatusServer.FREE,
          },
        },
        salaryFrom: listingSalaryFrom,
        salaryTo: listingSalaryTo,
        showEmail: listingShowEmail,
        showPhone: listingShowPhone,
        slug: `temp-${randomUUID()}`,
        status,
        title: listingTitle,
        userId: isCompany ? undefined : existingUser.id,
        workMode: listingWorkMode,
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
      arrayData: [formNames.listingImagesNew, formNames.listingImagesToRemove],
      request,
      validator: {
        [formNames.country]: zodValidator.country.optional(),
        [formNames.flatNumber]: zodValidator.flatNumber.optional(),
        [formNames.listingAvailableFrom]: zodValidator.date.optional(),
        [formNames.listingCategory]: zodValidator.listingCategory,
        [formNames.listingCity]: zodValidator.listingCity.optional(),
        [formNames.listingDescription]: zodValidator.listingDescription,
        [formNames.listingDistrict]: zodValidator.listingDistrict.optional(),
        [formNames.listingImagesNew]: zodValidator.listingImagesToRemove
          .array()
          .optional(),
        [formNames.listingImagesToRemove]: zodValidator.listingImagesToRemove
          .array()
          .optional(),
        [formNames.listingSalaryFrom]: zodValidator.listingSalaryFrom,
        [formNames.listingSalaryTo]: zodValidator.listingSalaryTo,
        [formNames.listingShowEmail]: zodValidator.checkbox,
        [formNames.listingShowPhone]: zodValidator.checkbox,
        [formNames.listingTitle]: zodValidator.listingTitle,
        [formNames.listingWorkMode]: zodValidator.listingWorkMode,
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
      country,
      flatNumber,
      listingAvailableFrom,
      listingCategory,
      listingCity,
      listingDescription,
      listingDistrict,
      listingImagesNew,
      listingImagesToRemove,
      listingSalaryFrom,
      listingSalaryTo,
      listingShowEmail,
      listingShowPhone,
      listingTitle,
      listingWorkMode,
      postalCode,
      streetName,
      streetNumber,
    } = resultValidator.data;

    if (listingSalaryFrom > listingSalaryTo) {
      return await responseOnFailure({
        message: "badListingSalary",
        request,
        status: 422,
      });
    }

    if (!listingShowPhone && !listingShowEmail) {
      return await responseOnFailure({
        message: "noListingContactMethod",
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
        availableFrom: listingAvailableFrom ?? null,
        category: listingCategory,
        description: listingDescription,
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
        salaryFrom: listingSalaryFrom,
        salaryTo: listingSalaryTo,
        showEmail: listingShowEmail,
        showPhone: listingShowPhone,
        slug: `${convertToCorrectSlug(listingTitle)}-${foundListing.listingIndex}`,
        title: listingTitle,
        workMode: listingWorkMode,
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
