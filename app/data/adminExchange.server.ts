import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { database } from "./database.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectExchange } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getExchangesAdmin = async ({
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
    const { responseError } = await getAndCheckUser({
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
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

    const foundExchanges = await database.exchange.findMany({
      orderBy: {
        points: "asc",
      },
      select: prismaSelectExchange,
    });

    return await responseOnSuccess({
      data: {
        exchanges: foundExchanges,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const getExchangeAdmin = async ({
  exchangeId,
  request,
  userId,
  userSessionVersion,
}: {
  exchangeId?: string;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    if (!exchangeId) {
      return redirectOnError;
    }

    const { responseError } = await getAndCheckUser({
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
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

    const foundExchange = await database.exchange.findUnique({
      select: prismaSelectExchange,
      where: {
        id: exchangeId,
      },
    });

    if (!foundExchange) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        exchange: foundExchange,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const createNewExchangeAdmin = async ({
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
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.checkboxExchangeActive]: zodValidator.checkbox,
        [formNames.exchangeName]: zodValidator.exchangeName,
        [formNames.exchangePoints]: zodValidator.exchangePoints,
        [formNames.exchangeSubscriptionFreeDays]:
          zodValidator.exchangeSubscriptionFreeDays,
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
      authenticator: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
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

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const {
      checkboxExchangeActive,
      exchangeName,
      exchangePoints,
      exchangeSubscriptionFreeDays,
    } = resultValidator.data;

    if (!exchangeSubscriptionFreeDays) {
      return await responseOnFailure({
        message: "exchangeMustHaveSubscriptionFreeDays",
        request,
        status: 422,
      });
    }

    const foundExchange = await database.exchange.count({
      where: {
        OR: [
          {
            subscriptionFreeDays: exchangeSubscriptionFreeDays ?? null,
          },
          {
            points: exchangePoints,
          },
        ],
      },
    });

    if (foundExchange > 0) {
      return await responseOnFailure({
        message: "exchangeExist",
        request,
        status: 422,
      });
    }

    await database.exchange.create({
      data: {
        enabledAt: checkboxExchangeActive ? dayjs().toDate() : null,
        name: exchangeName,
        points: exchangePoints,
        subscriptionFreeDays: exchangeSubscriptionFreeDays ?? null,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successCreateExchange",
      },
      redirectTo: E_Routes.adminExchanges,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const updateExchangeAdmin = async ({
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
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.checkboxExchangeActive]: zodValidator.checkbox,
        [formNames.exchangeId]: zodValidator.exchangeId,
        [formNames.exchangeName]: zodValidator.exchangeName,
        [formNames.exchangePoints]: zodValidator.exchangePoints,
        [formNames.exchangeSubscriptionFreeDays]:
          zodValidator.exchangeSubscriptionFreeDays,
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
      authenticator: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
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

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const {
      checkboxExchangeActive,
      exchangeId,
      exchangeName,
      exchangePoints,
      exchangeSubscriptionFreeDays,
    } = resultValidator.data;

    if (!exchangeSubscriptionFreeDays) {
      return await responseOnFailure({
        message: "exchangeMustHaveSubscriptionFreeDays",
        request,
        status: 422,
      });
    }

    const countFoundUpdatedExchange = await database.exchange.count({
      where: {
        id: exchangeId,
      },
    });

    if (countFoundUpdatedExchange === 0) {
      return await responseOnFailure({
        message: "exchangeNoExist",
        request,
        status: 422,
      });
    }

    const foundExchange = await database.exchange.count({
      where: {
        NOT: {
          id: exchangeId,
        },
        OR: [
          {
            subscriptionFreeDays: exchangeSubscriptionFreeDays ?? null,
          },
          {
            points: exchangePoints,
          },
        ],
      },
    });

    if (foundExchange > 0) {
      return await responseOnFailure({
        message: "exchangeExist",
        request,
        status: 422,
      });
    }

    await database.exchange.update({
      data: {
        enabledAt: checkboxExchangeActive ? dayjs().toDate() : null,
        name: exchangeName,
        points: exchangePoints,
        subscriptionFreeDays: exchangeSubscriptionFreeDays ?? null,
      },
      where: {
        id: exchangeId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateExchange",
      },
      redirectTo: E_Routes.admin,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const deleteExchangeAdmin = async ({
  exchangeId,
  request,
  userId,
  userSessionVersion,
}: {
  exchangeId: null | string | undefined;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  if (!exchangeId) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 422,
    });
  }

  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
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
      authenticator: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.ADMIN_SUPER,
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

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const foundExchange = await database.exchange.findUnique({
      select: {
        id: true,
      },
      where: {
        id: exchangeId,
      },
    });

    if (!foundExchange) {
      return await responseOnFailure({
        message: "exchangeNoExist",
        request,
        status: 422,
      });
    }

    await database.exchange.delete({
      where: {
        id: foundExchange.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successDeleteExchange",
      },
      redirectTo: E_Routes.adminExchanges,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
