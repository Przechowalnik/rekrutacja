import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { database } from "./database.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const updateCompanySettings = async ({
  request,
  userCompanyId,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userCompanyId: null | string | undefined;
  userId: string;
  userSessionVersion: null | number;
}) => {
  if (!userCompanyId) {
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
        [formNames.companySettingsLoginFacebook]: zodValidator.checkbox,
        [formNames.companySettingsLoginGoogle]: zodValidator.checkbox,
        [formNames.companySettingsLoginPassword]: zodValidator.checkbox,
        [formNames.companySettingsTwoFactorAuthenticationEnabled]:
          zodValidator.checkbox,
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
          companyId: userCompanyId,
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

    const {
      companySettingsLoginFacebook,
      companySettingsLoginGoogle,
      companySettingsLoginPassword,
      companySettingsTwoFactorAuthenticationEnabled,
    } = resultValidator.data;

    if (
      !companySettingsLoginFacebook &&
      !companySettingsLoginGoogle &&
      !companySettingsLoginPassword
    ) {
      return await responseOnFailure({
        message: "companySettingsRequireLoginForm",
        request,
        status: 422,
      });
    }

    await database.companySettings.update({
      data: {
        loginFacebookAt: companySettingsLoginFacebook ? dayjs().toDate() : null,
        loginGoogleAt: companySettingsLoginGoogle ? dayjs().toDate() : null,
        loginPasswordAt: companySettingsLoginPassword ? dayjs().toDate() : null,
        twoFactorAuthenticationEnabledAt:
          companySettingsTwoFactorAuthenticationEnabled
            ? dayjs().toDate()
            : null,
      },
      where: {
        companyId: userCompanyId,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateCompanySettings",
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
