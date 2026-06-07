import { E_Routes } from "~/constants/routes";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { getCookieValue, getLastIdCookieName } from "./cookies.server";
import { database } from "./database.server";
import { sendInvoice } from "./emailsGenerator.server";
import { getInvoice } from "./fakturownia.server";
import { getGUSCompanyInfo } from "./gus.server";
import { E_RolesServer, E_TaxCountryServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  prismaSelectCompanyInvoiceData,
  prismaSelectInvoice,
} from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getCompanyInvoiceData = async ({
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
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.B2B_OWNER,
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

    if (!existingUser?.company?.id) {
      return redirectOnError;
    }

    const foundCompanyInvoiceData =
      await database.companyInvoiceData.findUnique({
        select: prismaSelectCompanyInvoiceData,
        where: {
          companyId: existingUser.company.id,
        },
      });

    if (!foundCompanyInvoiceData) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        companyInvoiceData: foundCompanyInvoiceData,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const getCompanyInvoices = async ({
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
      queryData: [formNames.limit, formNames.page],
      request,
      validator: {
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
      company: true,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: E_RolesServer.B2B_OWNER,
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

    if (!existingUser?.company?.id) {
      return redirectOnError;
    }

    const foundCompanyInvoiceData =
      await database.companyInvoiceData.findUnique({
        select: prismaSelectCompanyInvoiceData,
        where: {
          companyId: existingUser.company.id,
        },
      });

    if (!foundCompanyInvoiceData) {
      return redirectOnError;
    }

    const { limit = 10, page = 1 } = resultValidator.data;

    const lastId = getCookieValue(
      request.headers.get("cookie"),
      getLastIdCookieName(request),
    );
    const skip = (page - 1) * limit;

    const searchInvoice = {
      companyId: existingUser.company.id,
    };

    let cursorId: null | string = null;

    if (lastId) {
      const exists = await database.invoice.findFirst({
        select: { id: true },
        where: { id: lastId, ...searchInvoice },
      });

      cursorId = exists ? lastId : null;
    }

    const foundInvoices = await database.invoice.findMany({
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : { skip }),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: prismaSelectInvoice,
      take: limit,
      where: searchInvoice,
    });

    const total = await database.invoice.count({
      where: {
        companyId: existingUser.company.id,
      },
    });

    const nextPage = skip + limit < total ? page + 1 : null;
    const totalPages = Math.ceil(total / limit);

    return await responseOnSuccess({
      data: {
        companyInvoiceData: foundCompanyInvoiceData,
        invoices: foundInvoices,
        nextPage,
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

export const sendCompanyInvoiceToEmail = async ({
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
        [formNames.invoiceId]: zodValidator.invoiceId,
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
      company: true,
      prismaArguments: {
        select: {
          blockedAt: true,
          companyId: true,
          email: true,
          id: true,
          lang: true,
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

    const foundInvoices = await database.invoice.findUnique({
      select: {
        fakturowniaInvoiceId: true,
      },
      where: {
        companyId: existingUser.companyId,
        id: resultValidator.data[formNames.invoiceId],
      },
    });

    if (!foundInvoices?.fakturowniaInvoiceId) {
      return await responseOnFailure({
        message: "notFoundInvoice",
        request,
        status: 422,
      });
    }

    const invoice = await getInvoice({
      invoiceId: foundInvoices.fakturowniaInvoiceId,
    });

    await sendInvoice({
      pdfBuffer: invoice,
      request,
      toEmail: existingUser.email,
      userLanguage: existingUser.lang,
    });

    return await responseOnSuccess({
      flashData: {
        message: "invoiceSendToEmail",
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const updateCompanyInvoiceData = async ({
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
        [formNames.city]: zodValidator.city,
        [formNames.companyName]: zodValidator.companyName,
        [formNames.country]: zodValidator.country,
        [formNames.flatNumber]: zodValidator.flatNumber.optional(),
        [formNames.postalCode]: zodValidator.postalCode,
        [formNames.streetName]: zodValidator.streetName,
        [formNames.streetNumber]: zodValidator.streetNumber,
        [formNames.taxCountry]: zodValidator.taxCountry,
        [formNames.taxNumber]: zodValidator.taxNumber,
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
        select: {},
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

    const foundInvoiceData = await database.companyInvoiceData.findUnique({
      select: {
        taxNumber: true,
      },
      where: {
        companyId: existingUser.company.id,
      },
    });

    if (!foundInvoiceData) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const {
      city,
      companyName,
      country,
      flatNumber,
      postalCode,
      streetName,
      streetNumber,
      taxCountry,
      taxNumber,
    } = resultValidator.data;

    if (
      taxCountry === E_TaxCountryServer.PL &&
      taxNumber?.toString() !== foundInvoiceData.taxNumber
    ) {
      const gusInfo = await getGUSCompanyInfo({
        companyNip: taxNumber,
      });

      if (!gusInfo?.Nip) {
        return await responseOnFailure({
          message: "notFoundCompanyTaxNumber",
          request,
          status: 422,
        });
      }
    }

    await database.companyInvoiceData.update({
      data: {
        city,
        companyName: companyName,
        country,
        flatNumber,
        postalCode,
        streetName,
        streetNumber,
        taxCountry: taxCountry,
        taxNumber: taxNumber.toString(),
      },
      where: {
        companyId: existingUser.company.id,
      },
    });

    const countCompanyTax = await database.companyRegistry.count({
      where: {
        country: taxCountry,
        number: taxNumber.toString(),
      },
    });

    if (countCompanyTax === 0) {
      await database.companyRegistry.create({
        data: {
          country: taxCountry,
          number: taxNumber.toString(),
        },
      });
    }

    return await responseOnSuccess({
      flashData: {
        message: "successUpdatedInvoiceData",
      },
      redirectTo: E_Routes.companyInvoices,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
