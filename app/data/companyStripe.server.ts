import { database } from "./database.server";
import { E_RolesServer, type T_UserRolesServer } from "./models.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  type T_ResponseOnFailure,
} from "./response.server";
import { stripe } from "./stripe.server";

type T_AddToCompanyStripeCustomer = {
  paymentMethodId: string | undefined;
  request: Request;
  user: {
    company: {
      id: string;
      invoiceData:
        | {
            taxCountry: string;
            taxNumber: string;
          }
        | null
        | undefined;
      name: string;
      stripe:
        | {
            customerCardId: null | string | undefined;
            customerId: null | string | undefined;
          }
        | null
        | undefined;
    };
    email: string;
    id: string;
    role: T_UserRolesServer;
  };
};

type T_AddToCompanyStripeCustomerResult = {
  responseError?: T_ResponseOnFailure;
  stripeCustomerCardId?: string;
  stripeCustomerId?: string;
};

export const addToCompanyStripeCustomerAndUpdateCardIfExist = async ({
  paymentMethodId,
  request,
  user,
}: T_AddToCompanyStripeCustomer): Promise<T_AddToCompanyStripeCustomerResult> => {
  let validStripeCustomerCardId: null | string = null;
  let validStripeCustomerId: null | string = null;
  let cardLast4Numbers: null | string = null;

  if (!user?.company?.stripe || !user?.company?.invoiceData) {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 422,
      },
    };
  }

  if (user.role !== E_RolesServer.B2B_OWNER) {
    return {
      responseError: {
        message: "somethingWentWrong",
        request,
        status: 401,
      },
    };
  }

  if (user?.company?.stripe?.customerId) {
    const stripeCustomerId = user?.company?.stripe?.customerId;

    if (user?.company?.stripe?.customerCardId && !paymentMethodId) {
      validStripeCustomerCardId = user?.company?.stripe?.customerCardId;
    } else {
      if (!paymentMethodId) {
        return {
          responseError: {
            message: "somethingWentWrong",
            request,
            status: 422,
          },
        };
      }

      const resultStripeCard = await stripe.paymentMethods.attach(
        paymentMethodId,
        {
          customer: stripeCustomerId,
        },
      );

      if (resultStripeCard.card?.last4) {
        cardLast4Numbers = resultStripeCard.card?.last4;
      }

      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      const allUserPaymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card",
      });

      for (const userPaymentMethod of allUserPaymentMethods.data) {
        if (userPaymentMethod.id !== paymentMethodId) {
          await stripe.paymentMethods.detach(userPaymentMethod.id);
        }
      }

      await database.companyStripe.update({
        data: {
          costumerCardLast4Numbers: cardLast4Numbers,
          customerCardId: resultStripeCard.id,
        },
        where: {
          companyId: user.company.id,
        },
      });
      validStripeCustomerCardId = resultStripeCard.id;
    }

    validStripeCustomerId = stripeCustomerId;
  } else {
    if (!paymentMethodId) {
      return {
        responseError: {
          message: "somethingWentWrong",
          request,
          status: 422,
        },
      };
    }

    const newCustomer = await stripe.customers.create({
      email: user.email,
      invoice_settings: {
        custom_fields: [
          {
            name: "tax",
            value: `${user.company.invoiceData?.taxCountry}${user.company.invoiceData?.taxNumber}`,
          },
        ],
        default_payment_method: paymentMethodId,
      },
      metadata: {
        userId: user.id,
      },
      name: user?.company?.name,
      payment_method: paymentMethodId,
      preferred_locales: ["pl"],
    });

    const resultStripeCard = await stripe.paymentMethods.attach(
      paymentMethodId,
      {
        customer: newCustomer.id,
      },
    );

    if (resultStripeCard.card?.last4) {
      cardLast4Numbers = resultStripeCard.card?.last4;
    }

    await stripe.customers.update(newCustomer.id, {
      invoice_settings: {
        default_payment_method: resultStripeCard.id,
      },
    });

    await database.companyStripe.update({
      data: {
        costumerCardLast4Numbers: cardLast4Numbers,
        customerCardId: resultStripeCard.id,
        customerId: newCustomer.id,
      },
      where: {
        companyId: user.company.id,
      },
    });

    validStripeCustomerId = newCustomer.id;
    validStripeCustomerCardId = resultStripeCard.id;
  }

  return {
    stripeCustomerCardId: validStripeCustomerCardId,
    stripeCustomerId: validStripeCustomerId,
  };
};

export const responseCatchErrorWithStripeCard = async ({
  error,
  request,
}: {
  error: unknown;
  request: Request;
}) => {
  const validError: { code?: string; message?: string; statusCode?: number } =
    error as {
      code?: string;
      message?: string;
      statusCode?: number;
    };

  switch (validError?.code) {
    case "card_declined": {
      return await responseOnFailure({
        message: "cardDeclined",
        request,
        status: 422,
      });
    }
    case "expired_card": {
      return await responseOnFailure({
        message: "cardExpired",
        request,
        status: 422,
      });
    }
    case "incorrect_cvc": {
      return await responseOnFailure({
        message: "cardIncorrectCvc",
        request,
        status: 422,
      });
    }
    case "processing_error": {
      return await responseOnFailure({
        message: "cardProcessingError",
        request,
        status: 422,
      });
    }
    case "authentication_required": {
      return await responseOnFailure({
        message: "cardAuthenticationRequired",
        request,
        status: 422,
      });
    }
    default: {
      return await responseOnFailureServer({ error, request });
    }
  }
};
