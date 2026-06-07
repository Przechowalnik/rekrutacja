import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  prismaSelectProduct,
  prismaSelectProducts,
} from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { formatAmountForStripe, stripe } from "./stripe.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getProductsAdmin = async ({
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

    const foundProducts = await database.product.findMany({
      orderBy: {
        price_1: "asc",
      },
      select: prismaSelectProducts,
      where: {
        isDeletedAt: null,
      },
    });

    return await responseOnSuccess({
      data: {
        products: foundProducts,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const getProductAdmin = async ({
  productId,
  request,
  userId,
  userSessionVersion,
}: {
  productId: null | string | undefined;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  if (!productId) {
    return redirectOnError;
  }

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

    const foundProduct = await database.product.findUnique({
      select: prismaSelectProduct,
      where: {
        id: productId,
      },
    });

    if (!foundProduct) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        product: foundProduct,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const checkIfCanCreateNewProduct = async ({
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

    const foundProduct = await database.product.findFirst({
      where: {
        isDeletedAt: null,
      },
    });

    if (foundProduct) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const createNewProductAdmin = async ({
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
        [formNames.productPoints_1]: zodValidator.productPoints_1,
        [formNames.productPoints_2_5]: zodValidator.productPoints_2_5,
        [formNames.productPoints_6_plus]: zodValidator.productPoints_6_plus,
        [formNames.productPrice_1]: zodValidator.productPrice_1,
        [formNames.productPrice_2_5]: zodValidator.productPrice_2_5,
        [formNames.productPrice_6_plus]: zodValidator.productPrice_6_plus,
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
      productPoints_1,
      productPoints_2_5,
      productPoints_6_plus,
      productPrice_1,
      productPrice_2_5,
      productPrice_6_plus,
    } = resultValidator.data;

    const foundProduct = await database.product.count({
      where: {
        isDeletedAt: null,
      },
    });

    if (foundProduct) {
      return await responseOnFailure({
        message: "foundProduct",
        request,
        status: 422,
      });
    }

    const name = `Pricing ${dayjs().format("YYYY-MM-DD HH:mm")}`;

    const product = await stripe.products.create({
      name,
    });

    await database.product.create({
      data: {
        isDeletedAt: null,
        name,
        points_1: productPoints_1,
        points_2_5: productPoints_2_5,
        points_6_plus: productPoints_6_plus,
        price_1: formatAmountForStripe(productPrice_1),
        price_2_5: formatAmountForStripe(productPrice_2_5),
        price_6_plus: formatAmountForStripe(productPrice_6_plus),
        stripeProductId: product.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successCreateProduct",
      },
      redirectTo: E_Routes.adminProducts,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const editNewProductAdmin = async ({
  productId,
  request,
  userId,
  userSessionVersion,
}: {
  productId: null | string | undefined;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    if (!productId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.productPoints_1]: zodValidator.productPoints_1,
        [formNames.productPoints_2_5]: zodValidator.productPoints_2_5,
        [formNames.productPoints_6_plus]: zodValidator.productPoints_6_plus,
        [formNames.productPrice_1]: zodValidator.productPrice_1,
        [formNames.productPrice_2_5]: zodValidator.productPrice_2_5,
        [formNames.productPrice_6_plus]: zodValidator.productPrice_6_plus,
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
      productPoints_1,
      productPoints_2_5,
      productPoints_6_plus,
      productPrice_1,
      productPrice_2_5,
      productPrice_6_plus,
    } = resultValidator.data;

    const foundProduct = await database.product.findUnique({
      select: prismaSelectProduct,
      where: {
        id: productId,
      },
    });

    if (!foundProduct) {
      return await responseOnFailure({
        message: "notFoundProduct",
        request,
        status: 422,
      });
    }

    await database.product.update({
      data: {
        isDeletedAt: null,
        points_1: productPoints_1,
        points_2_5: productPoints_2_5,
        points_6_plus: productPoints_6_plus,
        price_1: formatAmountForStripe(productPrice_1),
        price_2_5: formatAmountForStripe(productPrice_2_5),
        price_6_plus: formatAmountForStripe(productPrice_6_plus),
      },
      where: {
        id: productId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateProduct",
      },
      redirectTo: E_Routes.adminProducts,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
