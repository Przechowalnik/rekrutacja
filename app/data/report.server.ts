import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { hashPassword } from "./hash.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const createReport = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.listingId]: zodValidator.listingId,
        [formNames.reportDescription]:
          zodValidator.reportDescription.optional(),
        [formNames.reportType]: zodValidator.reportType,
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
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const { listingId, reportDescription, reportType } = resultValidator.data;

    const foundListing = await database.listing.findFirst({
      select: {
        company: {
          select: {
            id: true,
            workers: {
              select: {
                email: true,
                id: true,
              },
              where: {
                role: E_RolesServer.B2B_OWNER,
              },
            },
          },
        },
        user: {
          select: {
            email: true,
            id: true,
          },
        },
      },
      where: {
        id: listingId,
      },
    });

    if (!foundListing) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const hasInvalidContactData =
      (foundListing?.company &&
        (!foundListing.company.workers?.at(0)?.id ||
          !foundListing.company.workers?.at(0)?.email)) ||
      (!foundListing?.company &&
        (!foundListing?.user?.id || !foundListing?.user?.email));

    if (hasInvalidContactData) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const foundSameReport = await database.report.count({
      where: {
        listingId,
        userId: existingUser.id,
      },
    });

    if (foundSameReport > 0) {
      return await responseOnFailure({
        message: "errorReportAlreadyExists",
        request,
        status: 422,
      });
    }

    await database.report.create({
      data: {
        ...(foundListing?.company
          ? {
              targetCompanyId: foundListing.company?.id,
              targetUserEmailHash: await hashPassword(
                foundListing?.company?.workers?.at(0)?.email?.toLowerCase() ??
                  "",
              ),
            }
          : {
              targetUserEmailHash: await hashPassword(
                foundListing?.user?.email?.toLowerCase() ?? "",
              ),
              targetUserId: foundListing?.user?.id,
            }),
        description: reportDescription,
        listingId,
        type: reportType,
        userId: existingUser.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successReportCreate",
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
