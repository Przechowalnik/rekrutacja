import crypto from "node:crypto";

import dayjs from "dayjs";
import { Authenticator } from "remix-auth";
import { OAuth2Strategy } from "remix-auth-oauth2";

import { E_Routes, getRoute } from "~/constants/routes";
import { environment } from "~/data/environment.server";

import { upsertLoginIpForUser } from "./accountIpLogin.server";
import { createUserSession } from "./authSession.server";
import { database } from "./database.server";
import { isEnableCreateOrLoginCompanyServer } from "./flags.server";
import { detectLangFromRequest } from "./functions.server";
import { hashPassword } from "./hash.server";
import { getEncryptedIp } from "./ip.server";
import { isE2E } from "./isE2E.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { responseGetOnFailure } from "./response.server";

type T_GoogleProfile = {
  email: string;
  family_name: string;
  given_name: string;
  id: string;
  name: string;
  picture: string;
  verified_email: boolean;
};

async function getGoogleUserProfile(
  accessToken: string,
): Promise<null | T_GoogleProfile> {
  try {
    const response = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        method: "GET",
      },
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function getAppSecretProof(accessToken: string, appSecret: string) {
  return crypto
    .createHmac("sha256", appSecret)
    .update(accessToken)
    .digest("hex");
}

async function getFacebookUserProfile(accessToken: string) {
  try {
    const appSecret = environment("FACEBOOK_CLIENT_SECRET");
    if (!appSecret) {
      return null;
    }

    const appSecretProof = getAppSecretProof(accessToken, appSecret);

    const url = new URL("https://graph.facebook.com/me");
    url.searchParams.set("fields", "id,name,email");
    url.searchParams.set("appsecret_proof", appSecretProof);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "GET",
    });

    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      email: data.email,
      id: data.id,
      name: data.name,
    };
  } catch {
    return null;
  }
}

async function createOAuthUser({
  accessToken,
  accessTokenExpiresAt,
  email,
  firstName,
  provider,
  providerId,
  request,
}: {
  accessToken: string;
  accessTokenExpiresAt: Date | undefined;
  email: string;
  firstName: string;
  provider: "facebook" | "google";
  providerId: string;
  request: Request;
}) {
  const randomPassword = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(randomPassword);
  const newEncryptedIp = getEncryptedIp({ request });
  const lang = detectLangFromRequest(request);

  const socialsData =
    provider === "google"
      ? {
          googleAccessToken: accessToken,
          googleAccessTokenExpiresAt: accessTokenExpiresAt,
          googleId: providerId,
        }
      : {
          facebookAccessToken: accessToken,
          facebookAccessTokenExpiresAt: accessTokenExpiresAt,
          facebookId: providerId,
        };

  return database.user.create({
    data: {
      consent: {
        create: {
          newsletterAt: undefined,
          opinionAt: undefined,
          regulationAt: dayjs().toDate(),
        },
      },
      email: email.toLowerCase(),
      emailVerification: {
        create: {
          verifiedAt: dayjs().toDate(),
        },
      },
      firstName,
      isPasswordSet: false,
      lang,
      lastName: null,
      loginIps: {
        create: {
          expiresAt: dayjs().add(1, "year").toDate(),
          value: newEncryptedIp,
        },
      },
      password: passwordHash,
      points: {
        create: {
          balance: 0,
        },
      },
      role: E_RolesServer.USER,
      socials: {
        create: socialsData,
      },
    },
    select: {
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      emailVerification: {
        select: {
          verifiedAt: true,
        },
      },
      firstName: true,
      id: true,
      lang: true,
      lastName: true,
      phone: {
        select: {
          countryCodeToConfirm: true,
          numberToConfirm: true,
          verifiedAt: true,
        },
      },
      role: true,
      sessionVersion: true,
    },
  });
}

export const auth = new Authenticator();

// In E2E mode, use dummy values to avoid OAuth2Strategy initialization errors
const oauthClientId = isE2E
  ? "dummy_client_id"
  : environment("OAUTH_CLIENT_ID");
const oauthClientSecret = isE2E
  ? "dummy_client_secret"
  : environment("OAUTH_CLIENT_SECRET");
const oauthRedirectUrl = isE2E
  ? "http://localhost:3000/auth/callback"
  : environment("OAUTH_REDIRECT_URL");

const auth0Strategy = new OAuth2Strategy(
  {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    clientId: oauthClientId,
    clientSecret: oauthClientSecret,
    redirectURI: oauthRedirectUrl,
    scopes: ["openid", "email", "profile"],
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    tokenRevocationEndpoint: "https://oauth2.googleapis.com/revoke",
  },
  async ({ request, tokens }) => {
    const redirectOnError = await responseGetOnFailure({
      redirectPath: E_Routes.errorAccountNotFound,
      request,
    });

    try {
      const accessToken = tokens.accessToken();
      const userProfile = await getGoogleUserProfile(accessToken);

      if (!userProfile) {
        return redirectOnError;
      }

      const { existingUser, responseError } = await getAndCheckUser({
        checkUserSessionVersion: false,
        company: true,
        prismaArguments: {
          select: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            emailVerification: {
              select: {
                verifiedAt: true,
              },
            },
            firstName: true,
            lang: true,
            lastName: true,
            phone: {
              select: {
                countryCodeToConfirm: true,
                numberToConfirm: true,
                verifiedAt: true,
              },
            },
            role: true,
          },
          where: {
            email: userProfile?.email?.toLowerCase(),
            NOT: {
              role: {
                in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
              },
            },
          },
        },
        request,
        respectCompanyIfCompanyPropsIsTrue: false,
        userSessionVersion: null,
      });

      if (
        responseError &&
        responseError?.message !== "notFoundUserWithoutMessage"
      ) {
        return redirectOnError;
      }

      if (!existingUser) {
        const newUser = await createOAuthUser({
          accessToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt(),
          email: userProfile.email,
          firstName: userProfile.given_name ?? userProfile.name ?? "",
          provider: "google",
          providerId: userProfile.id,
          request,
        });

        return createUserSession({
          flashData: {
            message: "successRegistrationUser",
            messageStatus: "success",
            modal: "setPassword",
            refetchUserSession: true,
          },
          redirectPath: getRoute({
            route: E_Routes.home,
          }),
          request,
          userCompanyId: null,
          userCompanyName: null,
          userEmailVerification: newUser.emailVerification,
          userFirstName: newUser.firstName,
          userId: newUser.id,
          userLang: newUser.lang,
          userLastName: newUser.lastName,
          userPhoneVerification: newUser.phone,
          userRole: newUser.role,
          userSessionVersion: newUser.sessionVersion,
        });
      }

      if (existingUser?.company?.id) {
        if (!isEnableCreateOrLoginCompanyServer()) {
          return redirectOnError;
        }

        const foundCompanySettings = await database.companySettings.findUnique({
          select: {
            loginGoogleAt: true,
          },
          where: {
            companyId: existingUser.company.id,
          },
        });

        if (!foundCompanySettings) {
          const redirectOnErrorStandard = await responseGetOnFailure({
            redirectPath: E_Routes.error,
            request,
          });
          return redirectOnErrorStandard;
        }

        if (!foundCompanySettings.loginGoogleAt) {
          const redirectOnErrorNoStandard = await responseGetOnFailure({
            redirectPath: E_Routes.errorLoginFromGoogle,
            request,
          });
          return redirectOnErrorNoStandard;
        }
      }

      await database.userSocials.update({
        data: {
          googleAccessToken: accessToken,
          googleAccessTokenExpiresAt: tokens.accessTokenExpiresAt(),
          googleId: userProfile.id,
        },
        where: {
          userId: existingUser.id,
        },
      });

      await upsertLoginIpForUser({
        request,
        userId: existingUser.id,
      });

      return createUserSession({
        flashData: {
          message: "userLoggedToSite",
          messageStatus: "success",
          refetchUserSession: true,
        },
        redirectPath: getRoute({
          route: E_Routes.home,
        }),
        request,
        userCompanyId: existingUser?.company?.id ?? null,
        userCompanyName: existingUser?.company?.name ?? null,
        userEmailVerification: existingUser.emailVerification,
        userFirstName: existingUser.firstName,
        userId: existingUser.id,
        userLang: existingUser.lang,
        userLastName: existingUser.lastName,
        userPhoneVerification: existingUser.phone,
        userRole: existingUser.role,
        userSessionVersion: existingUser.sessionVersion,
      });
    } catch {
      return redirectOnError;
    }
  },
);

// In E2E mode, use dummy values for Facebook OAuth
const facebookClientId = isE2E
  ? "dummy_facebook_client_id"
  : environment("FACEBOOK_CLIENT_ID");
const facebookClientSecret = isE2E
  ? "dummy_facebook_client_secret"
  : environment("FACEBOOK_CLIENT_SECRET");
const facebookRedirectUrl = isE2E
  ? "http://localhost:3000/auth/facebook/callback"
  : environment("FACEBOOK_REDIRECT_URL");

const facebookStrategy = new OAuth2Strategy(
  {
    authorizationEndpoint: "https://www.facebook.com/v21.0/dialog/oauth",
    clientId: facebookClientId,
    clientSecret: facebookClientSecret,
    redirectURI: facebookRedirectUrl,
    scopes: ["email", "public_profile"],
    tokenEndpoint: "https://graph.facebook.com/v21.0/oauth/access_token",
    tokenRevocationEndpoint: "https://graph.facebook.com/v21.0/me/permissions",
  },
  async ({ request, tokens }) => {
    const redirectOnError = await responseGetOnFailure({
      redirectPath: E_Routes.errorAccountNotFound,
      request,
    });

    try {
      const accessToken = tokens.accessToken();
      const userProfile = await getFacebookUserProfile(accessToken);

      if (!userProfile) {
        return redirectOnError;
      }

      const { existingUser, responseError } = await getAndCheckUser({
        checkUserSessionVersion: false,
        company: true,
        prismaArguments: {
          select: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            emailVerification: {
              select: {
                verifiedAt: true,
              },
            },
            firstName: true,
            lang: true,
            lastName: true,
            phone: {
              select: {
                countryCodeToConfirm: true,
                numberToConfirm: true,
                verifiedAt: true,
              },
            },
            role: true,
          },
          where: {
            email: userProfile?.email?.toLowerCase(),
            NOT: {
              role: {
                in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
              },
            },
          },
        },
        request,
        respectCompanyIfCompanyPropsIsTrue: false,
        userSessionVersion: null,
      });

      if (
        responseError &&
        responseError?.message !== "notFoundUserWithoutMessage"
      ) {
        return redirectOnError;
      }

      if (!existingUser) {
        const newUser = await createOAuthUser({
          accessToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt(),
          email: userProfile.email,
          firstName: userProfile.name ?? "",
          provider: "facebook",
          providerId: userProfile.id,
          request,
        });

        return createUserSession({
          flashData: {
            message: "successRegistrationUser",
            messageStatus: "success",
            modal: "setPassword",
            refetchUserSession: true,
          },
          redirectPath: getRoute({
            route: E_Routes.home,
          }),
          request,
          userCompanyId: null,
          userCompanyName: null,
          userEmailVerification: newUser.emailVerification,
          userFirstName: newUser.firstName,
          userId: newUser.id,
          userLang: newUser.lang,
          userLastName: newUser.lastName,
          userPhoneVerification: newUser.phone,
          userRole: newUser.role,
          userSessionVersion: newUser.sessionVersion,
        });
      }

      if (existingUser?.company?.id) {
        if (!isEnableCreateOrLoginCompanyServer()) {
          return redirectOnError;
        }

        const foundCompanySettings = await database.companySettings.findUnique({
          select: {
            loginFacebookAt: true,
          },
          where: {
            companyId: existingUser.company.id,
          },
        });

        if (!foundCompanySettings) {
          const redirectOnErrorStandard = await responseGetOnFailure({
            redirectPath: E_Routes.error,
            request,
          });
          return redirectOnErrorStandard;
        }

        if (!foundCompanySettings.loginFacebookAt) {
          const redirectOnErrorNoStandard = await responseGetOnFailure({
            redirectPath: E_Routes.errorLoginFromFacebook,
            request,
          });
          return redirectOnErrorNoStandard;
        }
      }

      await database.userSocials.update({
        data: {
          facebookAccessToken: accessToken,
          facebookAccessTokenExpiresAt: tokens.accessTokenExpiresAt(),
          facebookId: userProfile.id,
        },
        where: {
          userId: existingUser.id,
        },
      });

      await upsertLoginIpForUser({
        request,
        userId: existingUser.id,
      });

      return createUserSession({
        flashData: {
          message: "userLoggedToSite",
          messageStatus: "success",
          refetchUserSession: true,
        },
        redirectPath: getRoute({
          route: E_Routes.home,
        }),
        request,
        userCompanyId: existingUser?.company?.id ?? null,
        userCompanyName: existingUser?.company?.name ?? null,
        userEmailVerification: existingUser.emailVerification,
        userFirstName: existingUser.firstName,
        userId: existingUser.id,
        userLang: existingUser.lang,
        userLastName: existingUser.lastName,
        userPhoneVerification: existingUser.phone,
        userRole: existingUser.role,
        userSessionVersion: existingUser.sessionVersion,
      });
    } catch {
      return redirectOnError;
    }
  },
);

auth.use(auth0Strategy, "google");
auth.use(facebookStrategy, "facebook");
