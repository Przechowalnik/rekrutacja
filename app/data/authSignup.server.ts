import { PrismaPromise } from "@prisma/client/runtime/client";
import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { verifyUserAuthenticators } from "~/data/checkAuthenticator.server";
import { checkRecaptcha } from "~/data/checkRecaptcha.server";
import { database } from "~/data/database.server";
import { hashPassword } from "~/data/hash.server";
import { formNames } from "~/lib/zodFormValidator";

import { sendVerifiedEmail } from "./emailsGenerator.server";
import { isEnableCreateOrLoginCompanyServer } from "./flags.server";
import { convertToCorrectSlug, generateRandomDigits } from "./functions.server";
import { getGUSCompanyInfo } from "./gus.server";
import { getEncryptedIp } from "./ip.server";
import { fireMetaRegistrationEvent } from "./metaCapi.server";
import {
  E_CountryServer,
  E_RolesServer,
  E_TaxCountryServer,
} from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  prismaSelectCompanyFreeTrial,
  prismaSelectSubscription,
} from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const signUp = async ({
  isCompanyWorkerRegistration,
  request,
  userCompanyId,
  userId,
}: {
  isCompanyWorkerRegistration: boolean;
  request: Request;
  userCompanyId?: string;
  userId?: string;
}) => {
  if (!isEnableCreateOrLoginCompanyServer() && isCompanyWorkerRegistration) {
    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
      status: 401,
    });
  }

  try {
    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator.optional(),
        [formNames.checkboxAcceptNewsletter]: zodValidator.checkbox,
        [formNames.checkboxAcceptRegulations]: zodValidator.checkboxChecked,
        [formNames.companyId]: zodValidator.companyId.optional(),
        [formNames.email]: zodValidator.email,
        [formNames.language]: zodValidator.language,
        [formNames.password]: zodValidator.password,
        [formNames.passwordRepeat]: zodValidator.password,
        [formNames.phoneCountryCode]: zodValidator.phoneCountryCode.optional(),
        [formNames.phoneNumber]: zodValidator.phoneNumber.optional(),
        [formNames.recaptcha]: zodValidator.recaptcha.optional(),
        [formNames.referralCode]: zodValidator.referralCode.optional(),
        [formNames.userFirstName]: zodValidator.userFirstName,
        [formNames.userLastName]: zodValidator.userLastName.optional(),
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

    const {
      authenticator,
      checkboxAcceptNewsletter,
      checkboxAcceptRegulations,
      companyId,
      email,
      language,
      password,
      passwordRepeat,
      phoneCountryCode,
      phoneNumber,
      recaptcha,
      referralCode,
      userFirstName,
      userLastName = null,
    } = resultValidator.data;

    if (isCompanyWorkerRegistration) {
      if (
        !authenticator ||
        recaptcha ||
        referralCode ||
        !userCompanyId ||
        !userId
      ) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const { existingUser, responseError } = await getAndCheckUser({
        authenticator: true,
        checkUserSessionVersion: false,
        company: true,
        prismaArguments: {
          select: {
            company: {
              select: {
                freeTrial: {
                  select: prismaSelectCompanyFreeTrial,
                },
                subscriptions: {
                  select: prismaSelectSubscription,
                },
              },
            },
          },
          where: {
            companyId: userCompanyId,
            id: userId,
          },
        },
        request,
        userSessionVersion: null,
      });

      const redirectOnError = await responseGetOnFailure({ request });

      if (responseError || !existingUser) {
        return redirectOnError;
      }

      const resultVerifyUser2FACode = await verifyUserAuthenticators({
        authenticator: authenticator,
        authenticator2FA: existingUser.authenticator2FA,
        authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
        password: existingUser.password,
        request,
        userId: existingUser.id,
      });

      if (resultVerifyUser2FACode?.responseError) {
        return await responseOnFailure(resultVerifyUser2FACode.responseError);
      }
    } else {
      if (authenticator || !recaptcha || userCompanyId || userId) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      const isCorrectCaptcha = await checkRecaptcha(recaptcha);

      if (!isCorrectCaptcha) {
        return await responseOnFailure({
          message: "badRecaptcha",
          request,
          status: 422,
        });
      }

      if (companyId) {
        const foundCompany = await database.company.count({
          where: {
            id: companyId,
          },
        });

        if (foundCompany === 0) {
          return await responseOnFailure({
            message: "notFoundCompanyId",
            request,
            status: 422,
          });
        }
      }
    }

    if (password !== passwordRepeat) {
      return await responseOnFailure({
        message: "badPasswordRepeat",
        request,
        status: 422,
      });
    }
    const generatedEmailCode = generateRandomDigits(6);

    const [passwordHash, hashedEmailCode] = await Promise.all([
      hashPassword(password),
      hashPassword(generatedEmailCode),
    ]);

    const countExistingUser = await database.user.count({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (countExistingUser > 0) {
      return await responseOnFailure({
        message: "userExisting",
        request,
        status: 422,
      });
    }

    const foundCompanyReferral =
      referralCode && !isCompanyWorkerRegistration && !companyId
        ? await database.referral.findUnique({
            select: {
              companyId: true,
            },
            where: {
              code: referralCode.toUpperCase(),
            },
          })
        : null;

    if (
      referralCode &&
      !isCompanyWorkerRegistration &&
      !companyId &&
      !foundCompanyReferral
    ) {
      return await responseOnFailure({
        message: "notFoundReferral",
        request,
        status: 422,
      });
    }

    const newEncryptedIp = getEncryptedIp({
      request,
    });

    const currentDate = dayjs().toDate();

    const newUser = await database.user.create({
      data: {
        blockedAt: null,
        companyId: isCompanyWorkerRegistration
          ? userCompanyId
          : (companyId ?? null),
        consent: {
          create: {
            newsletterAt: checkboxAcceptNewsletter ? currentDate : undefined,
            opinionAt: checkboxAcceptNewsletter ? currentDate : undefined,
            regulationAt: checkboxAcceptRegulations ? currentDate : undefined,
          },
        },
        createdFromReferralCode:
          referralCode && foundCompanyReferral
            ? referralCode.toUpperCase()
            : null,
        email: email.toLowerCase(),
        emailVerification: {
          create: {
            code: hashedEmailCode,
            verifiedAt: null,
          },
        },
        firstName: userFirstName,
        lang: language,
        lastName: userLastName ?? null,
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
        role:
          isCompanyWorkerRegistration || companyId
            ? E_RolesServer.B2B_WORKER
            : E_RolesServer.USER,
        socials: {
          create: {},
        },
        ...(isCompanyWorkerRegistration && userCompanyId
          ? {
              workerSettings: {
                create: {
                  companyId: userCompanyId,
                  permissions: [],
                },
              },
            }
          : {}),
        ...(companyId
          ? {
              workerSettings: {
                create: {
                  companyId: companyId,
                  permissions: [],
                },
              },
            }
          : {}),
        ...(phoneCountryCode && phoneNumber
          ? {
              phone: {
                create: {
                  countryCodeToConfirm: Number(phoneCountryCode),
                  numberToConfirm: Number(phoneNumber),
                },
              },
            }
          : {}),
      },
      select: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        email: true,
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

    await sendVerifiedEmail({
      codeEmail: generatedEmailCode,
      request,
      toEmail: newUser.email,
      userLanguage: newUser.lang,
    });

    fireMetaRegistrationEvent({
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      registrationType: isCompanyWorkerRegistration ? "companyWorker" : "user",
      request,
      userId: newUser.id,
    });

    return isCompanyWorkerRegistration
      ? responseOnSuccess({
          data: {
            message: "successRegistrationCompanyWorker",
            redirectTo: E_Routes.companyWorkers,
            refetchUserSession: true,
          },
          request,
          status: 200,
        })
      : responseOnSuccess({
          data: {
            message: "successRegistrationUser",
            redirectTo: E_Routes.home,
            refetchUserSession: true,
          },
          newUserSession: {
            userCompanyId: newUser?.company?.id ?? null,
            userCompanyName: newUser?.company?.name ?? null,
            userEmailVerification: newUser.emailVerification,
            userFirstName: newUser.firstName,
            userId: newUser.id,
            userLang: newUser.lang,
            userLastName: newUser.lastName,
            userPhoneVerification: newUser.phone,
            userRole: newUser.role,
            userSessionVersion: newUser.sessionVersion,
          },
          request,
        });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const signUpCompany = async ({ request }: { request: Request }) => {
  try {
    if (!isEnableCreateOrLoginCompanyServer()) {
      return await responseOnFailure({
        message: "errorOnRegisterCompany",
        request,
        status: 401,
      });
    }

    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.checkboxAcceptNewsletter]: zodValidator.checkbox,
        [formNames.checkboxAcceptRegulations]: zodValidator.checkboxChecked,
        [formNames.companyName]: zodValidator.companyName,
        [formNames.companyPhoneCountryCode]: zodValidator.phoneCountryCode,
        [formNames.companyPhoneNumber]: zodValidator.phoneNumber,
        [formNames.email]: zodValidator.email,
        [formNames.language]: zodValidator.language,
        [formNames.password]: zodValidator.password,
        [formNames.passwordRepeat]: zodValidator.password,
        [formNames.phoneCountryCode]: zodValidator.phoneCountryCode.optional(),
        [formNames.phoneNumber]: zodValidator.phoneNumber.optional(),
        [formNames.recaptcha]: zodValidator.recaptcha,
        [formNames.referralCode]: zodValidator.referralCode.optional(),
        [formNames.taxCountry]: zodValidator.taxCountry,
        [formNames.taxNumber]: zodValidator.taxNumber,
        [formNames.userFirstName]: zodValidator.userFirstName,
        [formNames.userLastName]: zodValidator.userLastName.optional(),
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

    const {
      checkboxAcceptNewsletter,
      checkboxAcceptRegulations,
      companyName,
      companyPhoneCountryCode,
      companyPhoneNumber,
      email,
      language,
      password,
      passwordRepeat,
      phoneCountryCode,
      phoneNumber,
      recaptcha,
      referralCode,
      taxCountry,
      taxNumber,
      userFirstName,
      userLastName = null,
    } = resultValidator.data;

    const isCorrectCaptcha = await checkRecaptcha(recaptcha);

    if (!isCorrectCaptcha) {
      return await responseOnFailure({
        message: "badRecaptcha",
        request,
        status: 422,
      });
    }

    if (password !== passwordRepeat) {
      return await responseOnFailure({
        message: "badPasswordRepeat",
        request,
        status: 422,
      });
    }

    if (!checkboxAcceptRegulations) {
      return await responseOnFailure({
        message: "noCheckedCheckboxRegulations",
        request,
        status: 422,
      });
    }

    const countExistingUser = await database.user.count({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (countExistingUser > 0) {
      return await responseOnFailure({
        message: "userExisting",
        request,
        status: 422,
      });
    }

    const countFindCompanyName = await database.company.count({
      where: {
        name: {
          equals: companyName,
          mode: "insensitive",
        },
      },
    });

    if (countFindCompanyName > 0) {
      return await responseOnFailure({
        message: "companyNameAlreadyExist",
        request,
        status: 422,
      });
    }

    const generatedEmailCode = generateRandomDigits(6);
    const generatedPhoneCode = generateRandomDigits(6);

    const [passwordHash, hashedEmailCode, hashedPhoneCode] = await Promise.all([
      hashPassword(password),
      hashPassword(generatedEmailCode),
      hashPassword(generatedPhoneCode),
    ]);

    if (taxCountry !== E_TaxCountryServer.PL) {
      return await responseOnFailure({
        message: "notFoundCompanyTaxNumber",
        request,
        status: 422,
      });
    }

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

    const foundPlatformSettings = await database.platformSetting.findFirst({
      select: {
        freeTrialCompanyMonthsCount: true,
        planIdFreeTrialCompany: true,
      },
    });

    if (!foundPlatformSettings) {
      console.error("No detected platform settings");
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 500,
      });
    }

    const foundCompanyReferral = referralCode
      ? await database.referral.findUnique({
          select: {
            companyId: true,
          },
          where: {
            code: referralCode.toUpperCase(),
          },
        })
      : null;

    if (referralCode && !foundCompanyReferral) {
      return await responseOnFailure({
        message: "notFoundReferral",
        request,
        status: 422,
      });
    }

    const countCompanyTax = await database.companyRegistry.count({
      where: {
        country: taxCountry,
        number: taxNumber.toString(),
      },
    });

    const newEncryptedIp = getEncryptedIp({
      request,
    });

    const currentDate = dayjs().toDate();

    const newCompanyAndUser = await database.user.create({
      data: {
        blockedAt: null,
        company: {
          create: {
            blockedAt: null,
            createdFromReferralCode:
              referralCode && foundCompanyReferral
                ? referralCode.toUpperCase()
                : null,
            freeTrial:
              foundPlatformSettings && countCompanyTax === 0
                ? {
                    create: {
                      endDate: dayjs()
                        .add(
                          foundPlatformSettings.freeTrialCompanyMonthsCount,
                          "month",
                        )
                        .toDate(),
                      planId: foundPlatformSettings?.planIdFreeTrialCompany,
                      startDate: dayjs().toDate(),
                    },
                  }
                : undefined,
            invoiceData: {
              create: {
                city: gusInfo.Miejscowosc,
                companyName: gusInfo.Nazwa,
                country: E_CountryServer.POLAND,
                flatNumber: gusInfo.NrLokalu,
                postalCode: gusInfo.KodPocztowy,
                streetName: gusInfo.Ulica,
                streetNumber: gusInfo.NrNieruchomosci,
                taxCountry: taxCountry,
                taxNumber: taxNumber.toString(),
              },
            },
            name: companyName,
            phone: {
              create: {
                code: hashedPhoneCode,
                countryCodeToConfirm: Number(companyPhoneCountryCode),
                numberToConfirm: Number(companyPhoneNumber),
                verifiedAt: null,
              },
            },
            points: {
              create: {
                balance: 0,
              },
            },
            settings: {
              create: {
                loginFacebookAt: currentDate,
                loginGoogleAt: currentDate,
                loginPasswordAt: currentDate,
              },
            },
            stripe: {
              create: {
                accountId: null,
                accountOnboardingActiveAt: null,
                costumerCardLast4Numbers: null,
                customerCardId: null,
                customerId: null,
              },
            },
          },
        },
        consent: {
          create: {
            newsletterAt: checkboxAcceptNewsletter ? currentDate : undefined,
            opinionAt: checkboxAcceptNewsletter ? currentDate : undefined,
            regulationAt: checkboxAcceptRegulations ? currentDate : undefined,
          },
        },
        email: email.toLowerCase(),
        emailVerification: {
          create: {
            code: hashedEmailCode,
            verifiedAt: null,
          },
        },
        firstName: userFirstName,
        lang: language,
        lastName: userLastName ?? null,
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
        role: E_RolesServer.B2B_OWNER,
        socials: {
          create: {},
        },
        ...(phoneCountryCode && phoneNumber
          ? {
              phone: {
                create: {
                  countryCodeToConfirm: Number(phoneCountryCode),
                  numberToConfirm: Number(phoneNumber),
                },
              },
            }
          : {}),
      },
      select: {
        company: {
          select: {
            id: true,
            idnumber: true,
            name: true,
          },
        },
        email: true,
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

    const promises: PrismaPromise<unknown>[] = [];

    if (countCompanyTax === 0) {
      promises.push(
        database.companyRegistry.create({
          data: {
            country: taxCountry,
            number: taxNumber.toString(),
          },
        }),
      );
    }

    if (!newCompanyAndUser?.company?.id || !newCompanyAndUser?.company) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const slugCompany = convertToCorrectSlug(
      `${newCompanyAndUser.company.idnumber}-${newCompanyAndUser.company.name}`,
    );

    promises.push(
      database.company.update({
        data: {
          slug: slugCompany,
        },
        where: {
          id: newCompanyAndUser.company.id,
        },
      }),
      database.companyWorkerSettings.create({
        data: {
          companyId: newCompanyAndUser.company.id,
          permissions: [],
          userId: newCompanyAndUser.id,
        },
      }),
    );

    await database.$transaction(promises);

    await sendVerifiedEmail({
      codeEmail: generatedEmailCode,
      request,
      toEmail: newCompanyAndUser.email,
      userLanguage: newCompanyAndUser.lang,
    });

    fireMetaRegistrationEvent({
      email: newCompanyAndUser.email,
      firstName: newCompanyAndUser.firstName,
      lastName: newCompanyAndUser.lastName,
      registrationType: "company",
      request,
      userId: newCompanyAndUser.id,
    });

    return responseOnSuccess({
      data: {
        message: "successRegistrationCompany",
        redirectTo: E_Routes.home,
        refetchUserSession: true,
      },
      newUserSession: {
        userCompanyId: newCompanyAndUser.company.id,
        userCompanyName: newCompanyAndUser?.company?.name ?? null,
        userEmailVerification: newCompanyAndUser.emailVerification,
        userFirstName: newCompanyAndUser.firstName,
        userId: newCompanyAndUser.id,
        userLang: newCompanyAndUser.lang,
        userLastName: newCompanyAndUser.lastName,
        userPhoneVerification: newCompanyAndUser.phone,
        userRole: newCompanyAndUser.role,
        userSessionVersion: newCompanyAndUser.sessionVersion,
      },
      request,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
