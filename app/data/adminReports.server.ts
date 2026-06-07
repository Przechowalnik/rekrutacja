import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { getCookieValue, getLastIdCookieName } from "./cookies.server";
import { hashPassword } from "./hash.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectReport } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getReportsAdmin = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const resultValidator = await checkZodValidator({
      queryData: [formNames.limit, formNames.page, formNames.email],
      request,
      validator: {
        [formNames.email]: zodValidator.email.optional(),
        [formNames.limit]: zodValidator.limit.optional(),
        [formNames.page]: zodValidator.page.optional(),
      },
    });

    if (resultValidator?.responseError) {
      return redirectOnError;
    }

    if (!resultValidator?.data) {
      return redirectOnError;
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    const { email, limit = 10, page = 1 } = resultValidator.data;

    const lastId = getCookieValue(
      request.headers.get("cookie"),
      getLastIdCookieName(request),
    );
    const skip = (page - 1) * limit;

    const hashedEmail = email ? await hashPassword(email) : null;

    const whereReport = {
      OR: email
        ? [
            {
              targetCompany: {
                workers: {
                  some: {
                    email,
                  },
                },
              },
            },
            {
              targetUserEmailHash: hashedEmail,
            },
            {
              user: {
                email,
              },
            },
            {
              targetUser: {
                email,
              },
            },
          ]
        : undefined,
    };

    let cursorId: null | string = null;

    if (lastId) {
      const exists = await database.report.findFirst({
        select: { id: true },
        where: { id: lastId, ...whereReport },
      });

      cursorId = exists ? lastId : null;
    }

    const reports = await database.report.findMany({
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : { skip }),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: prismaSelectReport,
      take: limit,
      where: whereReport,
    });

    const total = await database.report.count({
      where: whereReport,
    });

    const nextPage = skip + limit < total ? page + 1 : null;
    const totalPages = Math.ceil(total / limit);

    return await responseOnSuccess({
      data: {
        nextPage,
        reports,
        totalPages,
        totalResults: total,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};
