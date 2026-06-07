import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { addToCompanyStripeCustomerAndUpdateCardIfExist } from "./companyStripe.server";
import { E_RolesServer, E_SubscriptionStatusServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { stripe } from "./stripe.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const updateCompanyCard = async ({
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
        [formNames.paymentMethodId]: zodValidator.paymentMethodId,
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
          company: {
            select: {
              freeTrial: {
                select: {
                  id: true,
                },
              },
              invoiceData: {
                select: {
                  taxCountry: true,
                  taxNumber: true,
                },
              },
              name: true,
              stripe: {
                select: {
                  accountId: true,
                  customerCardId: true,
                  customerId: true,
                },
              },
            },
          },
          email: true,
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

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (!existingUser?.company?.stripe) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
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

    const { paymentMethodId } = resultValidator.data;

    if (!paymentMethodId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    await addToCompanyStripeCustomerAndUpdateCardIfExist({
      paymentMethodId,
      request,
      user: existingUser,
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdatedCard",
        refetchUserSession: true,
      },
      redirectTo: E_Routes.company,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const deleteCompanyCard = async ({
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
          company: {
            select: {
              stripe: {
                select: {
                  customerCardId: true,
                },
              },
            },
          },
        },
        where: {
          company: {
            stripe: {
              NOT: {
                customerCardId: null,
              },
            },
          },
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

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const foundActiveSubscriptions = await database.subscription.count({
      where: {
        companyId: existingUser.company.id,
        status: {
          notIn: [E_SubscriptionStatusServer.CANCELLED],
        },
      },
    });

    if (foundActiveSubscriptions) {
      return await responseOnFailure({
        message: "errorOnDeleteCompanyCardCompanyHasActiveSubscription",
        request,
        status: 422,
      });
    }

    if (
      !existingUser?.company ||
      !existingUser?.company?.stripe?.customerCardId
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
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

    await stripe.paymentMethods.detach(
      existingUser?.company?.stripe.customerCardId,
    );

    await database.companyStripe.update({
      data: {
        costumerCardLast4Numbers: null,
        customerCardId: null,
      },
      where: {
        companyId: existingUser.company.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdatedCard",
      },
      redirectTo: E_Routes.account,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
