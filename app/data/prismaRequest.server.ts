/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Prisma } from "generated/prisma/client";

import { database } from "~/data/database.server";

import type { T_ResponseOnFailure } from "./response.server";

type T_GetAndCheckResult<
  T extends Prisma.UserFindUniqueArgs,
  A extends boolean,
  C extends boolean,
  D extends boolean,
  E extends boolean,
> = {
  existingUser?: (Prisma.UserGetPayload<T> & {
    blockedAt: Date | null;
    company?: C extends true
      ? {
          blockedAt: Date | null;
          id: string;
        } & (E extends true
          ? {
              phone: {
                countryCode: null | number;
                number: bigint | null | number;
                verifiedAt: Date | null;
              };
            }
          : unknown)
      : undefined;
    id: string;
    sessionVersion: number;
  }) &
    (A extends true
      ? {
          authenticator2FA: {
            enabledAt: Date | null;
            secret: string;
          };
          authenticatorEmailOTP: {
            code: string;
            enabledAt: Date | null;
            expiresAt: Date | null;
          };
          password: string;
        }
      : unknown) &
    (D extends true
      ? {
          phone: {
            countryCode: null | number;
            number: bigint | null | number;
            verifiedAt: Date | null;
          };
        }
      : unknown);
  responseError?: T_ResponseOnFailure;
};

type T_GetAndCheckUser<
  T extends Prisma.UserFindUniqueArgs,
  A extends boolean,
  C extends boolean,
  D extends boolean,
  E extends boolean,
> = {
  authenticator?: A;
  checkUserSessionVersion?: boolean;
  company?: C;
  prismaArguments: Prisma.SelectSubset<T, Prisma.UserFindUniqueArgs>;
  request: Request;
  respectCompanyIfCompanyPropsIsTrue?: boolean;
  respectCompanyPhoneVerification?: E;
  respectUserPhoneVerification?: D;
  userSessionVersion: null | number;
};

export const getAndCheckUser = async <
  T extends Prisma.UserFindUniqueArgs,
  A extends boolean,
  C extends boolean,
  D extends boolean,
  E extends boolean,
>({
  authenticator,
  checkUserSessionVersion = true,
  company,
  prismaArguments,
  request,
  respectCompanyIfCompanyPropsIsTrue = true,
  respectCompanyPhoneVerification,
  respectUserPhoneVerification,
  userSessionVersion,
}: T_GetAndCheckUser<T, A, C, D, E>): Promise<
  T_GetAndCheckResult<T, A, C, D, E>
> => {
  if (!prismaArguments || (!userSessionVersion && checkUserSessionVersion)) {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 422,
      },
    };
  }

  try {
    const dynamicSelect = {
      ...prismaArguments.select,
      blockedAt: true,
      id: true,
      sessionVersion: true,
      ...(authenticator
        ? {
            authenticator2FA:
              typeof prismaArguments?.select?.authenticator2FA === "boolean"
                ? prismaArguments?.select?.authenticator2FA
                : {
                    select: {
                      enabledAt: true,
                      secret: true,
                      //@ts-ignore
                      ...prismaArguments.select?.authenticatorEmailOTP?.select,
                    },
                  },
            authenticatorEmailOTP:
              typeof prismaArguments?.select?.authenticatorEmailOTP ===
              "boolean"
                ? prismaArguments?.select?.authenticatorEmailOTP
                : {
                    select: {
                      code: true,
                      enabledAt: true,
                      expiresAt: true,
                      // @ts-ignore
                      ...prismaArguments.select?.authenticatorEmailOTP?.select,
                    },
                  },
            password: true,
          }
        : {}),
      ...(respectUserPhoneVerification
        ? {
            phone: {
              select: {
                countryCode: true,
                number: true,
                verifiedAt: true,
              },
            },
          }
        : {}),
      ...(company
        ? {
            company: {
              select: {
                blockedAt: true,
                id: true,
                ...(typeof prismaArguments?.select?.company === "boolean"
                  ? {}
                  : prismaArguments.select?.company?.select),
                ...(respectCompanyPhoneVerification
                  ? {
                      phone: {
                        select: {
                          countryCode: true,
                          number: true,
                          verifiedAt: true,
                        },
                      },
                    }
                  : {}),
              },
            },
          }
        : {
            company: false,
          }),
    };

    const existingUser = await database.user.findUnique({
      select: dynamicSelect,
      where: prismaArguments.where,
    });

    if (!existingUser) {
      return {
        responseError: {
          message: "notFoundUserWithoutMessage",
          request,
          status: 422,
        },
      };
    }

    if (existingUser.blockedAt) {
      return {
        responseError: {
          message: "userIsBlocked",
          request,
          status: 404,
        },
      };
    }

    if (
      checkUserSessionVersion &&
      existingUser.sessionVersion !== userSessionVersion
    ) {
      return {
        responseError: {
          message: "sessionExpired",
          request,
          status: 401,
        },
      };
    }

    if (
      authenticator &&
      !existingUser.authenticator2FA &&
      !existingUser.authenticatorEmailOTP &&
      !existingUser.password
    ) {
      return {
        responseError: {
          message: "somethingWentWrong",
          request,
          status: 404,
        },
      };
    }

    if (
      respectUserPhoneVerification &&
      (!existingUser?.phone?.number ||
        !existingUser?.phone?.countryCode ||
        !existingUser?.phone?.verifiedAt)
    ) {
      return {
        responseError: {
          message: "noActivePhoneNumber",
          request,
          status: 404,
        },
      };
    }

    if (company && respectCompanyIfCompanyPropsIsTrue) {
      if (!existingUser?.company?.id) {
        return {
          responseError: {
            message: "notFoundUserWithoutMessage",
            request,
            status: 422,
          },
        };
      }

      if (existingUser?.company?.blockedAt) {
        return {
          responseError: {
            message: "userIsBlocked",
            request,
            status: 404,
          },
        };
      }

      if (
        respectCompanyPhoneVerification &&
        // @ts-ignore
        (!existingUser?.company?.phone?.number ||
          // @ts-ignore
          !existingUser?.company?.phone?.countryCode ||
          // @ts-ignore
          !existingUser?.company?.phone?.verifiedAt)
      ) {
        return {
          responseError: {
            message: "noActivePhoneNumberCompany",
            request,
            status: 404,
          },
        };
      }
    }

    return {
      existingUser: existingUser as unknown as T_GetAndCheckResult<
        T,
        A,
        C,
        D,
        E
      >["existingUser"],
    };
  } catch {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 500,
      },
    };
  }
};
