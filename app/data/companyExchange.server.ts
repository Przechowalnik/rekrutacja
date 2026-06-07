import dayjs from "dayjs";

import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { database } from "./database.server";
import { E_RolesServer, E_SubscriptionStatusServer } from "./models.server";
import { subtractPoints } from "./points.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectExchange } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { stripe } from "./stripe.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getExchangesCompany = async ({
  request,
}: {
  request: Request;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const foundExchanges = await database.exchange.findMany({
      orderBy: {
        points: "asc",
      },
      select: prismaSelectExchange,
      where: {
        NOT: {
          enabledAt: null,
        },
      },
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

export const exchangePointsToSubscription = async ({
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
        [formNames.exchangeId]: zodValidator.exchangeId,
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
      company: true,
      prismaArguments: {
        select: {
          companyId: true,
          role: true,
        },
        where: {
          id: userId,
          role: E_RolesServer.B2B_OWNER,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser?.company?.id) {
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

    const { exchangeId } = resultValidator.data;

    const foundExchange = await database.exchange.findUnique({
      select: {
        id: true,
        points: true,
        subscriptionFreeDays: true,
      },
      where: {
        id: exchangeId,
        NOT: {
          enabledAt: null,
        },
      },
    });

    if (!foundExchange) {
      return await responseOnFailure({
        message: "exchangeNoExist",
        request,
        status: 422,
      });
    }

    const resultSubtractPoints = await subtractPoints({
      companyIdSubtractPoints: existingUser.company?.id,
      pointsToSubtract: foundExchange.points,
      request,
    });

    if (resultSubtractPoints?.responseError) {
      return await responseOnFailure(resultSubtractPoints?.responseError);
    }

    if (foundExchange.subscriptionFreeDays) {
      if (!existingUser?.companyId) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const currentDate = dayjs().toDate();

      const countCompanyFreeTrial = await database.companyFreeTrial.count({
        where: {
          companyId: existingUser.companyId,
          endDate: {
            gt: currentDate,
          },
        },
      });

      if (countCompanyFreeTrial > 0) {
        return await responseOnFailure({
          message: "noNeedActiveFreeTrial",
          request,
          status: 422,
        });
      }

      const foundCompanyActiveSubscription =
        await database.subscription.findFirst({
          select: {
            extraFreeDaysInCurrentPeriod: true,
            stripeSubscriptionId: true,
          },
          where: {
            companyId: existingUser.companyId,
            status: E_SubscriptionStatusServer.ACTIVE,
          },
        });

      if (!foundCompanyActiveSubscription?.stripeSubscriptionId) {
        return await responseOnFailure({
          message: "accountNoHaveActiveSubscriptions",
          request,
          status: 422,
        });
      }

      if (foundCompanyActiveSubscription?.extraFreeDaysInCurrentPeriod) {
        return await responseOnFailure({
          message: "exchangeSubscriptionOnlyOneInMonth",
          request,
          status: 422,
        });
      }

      const subscriptionStripe = await stripe.subscriptions.retrieve(
        foundCompanyActiveSubscription.stripeSubscriptionId,
      );

      const currentTime = dayjs().local();
      const currentPeriodEnd = dayjs
        .unix(subscriptionStripe.current_period_end)
        .local();

      const remainingTimeInSeconds = currentPeriodEnd.diff(
        currentTime,
        "seconds",
      );

      const resumeDate = dayjs(currentTime)
        .add(foundExchange.subscriptionFreeDays, "day")
        .add(remainingTimeInSeconds, "second");

      await stripe.subscriptions.update(
        foundCompanyActiveSubscription.stripeSubscriptionId,
        {
          proration_behavior: "none",
          trial_end: resumeDate.unix(),
        },
      );

      const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
        subscription: foundCompanyActiveSubscription.stripeSubscriptionId,
      });

      const nextPaymentAttempt = upcomingInvoice.next_payment_attempt
        ? dayjs.unix(upcomingInvoice.next_payment_attempt).local().toISOString()
        : null;

      await database.subscription.update({
        data: {
          endDateExchangeFreeDays: resumeDate.toISOString(),
          extraFreeDaysInCurrentPeriod: {
            increment: foundExchange.subscriptionFreeDays,
          },
          nextPaymentAttempt,
        },
        select: {
          id: true,
        },
        where: {
          companyId: existingUser.companyId,
          stripeSubscriptionId:
            foundCompanyActiveSubscription.stripeSubscriptionId,
        },
      });
    }

    return await responseOnSuccess({
      flashData: {
        message: "successExchange",
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
