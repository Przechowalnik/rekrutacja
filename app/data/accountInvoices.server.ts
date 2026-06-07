import { formNames } from "~/lib/zodFormValidator";

import { getCookieValue, getLastIdCookieName } from "./cookies.server";
import { database } from "./database.server";
import { sendInvoice } from "./emailsGenerator.server";
import { getInvoice } from "./fakturownia.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectInvoice } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getAccountInvoices = async ({
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

    const { responseError } = await getAndCheckUser({
      authenticator: false,
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

    const { limit = 10, page = 1 } = resultValidator.data;

    const lastId = getCookieValue(
      request.headers.get("cookie"),
      getLastIdCookieName(request),
    );
    const skip = (page - 1) * limit;

    const searchInvoice = {
      userId,
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
        userId,
      },
    });

    const nextPage = skip + limit < total ? page + 1 : null;
    const totalPages = Math.ceil(total / limit);

    return await responseOnSuccess({
      data: {
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

export const sendAccountInvoiceToEmail = async ({
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
      prismaArguments: {
        select: {
          email: true,
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
          lang: true,
        },
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

    if (!existingUser?.emailVerification?.verifiedAt) {
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
        id: resultValidator.data[formNames.invoiceId],
        userId,
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
