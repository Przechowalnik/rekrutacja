import dayjs from "dayjs";

import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import { generateRandomDigits } from "./functions.server";
import { checkPassword, hashPassword } from "./hash.server";
import { sendVerifiedSMS } from "./hostedSms.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import {
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const deleteNewPhoneCompanyToConfirm = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              phone: {
                select: {
                  code: true,
                  countryCode: true,
                  countryCodeToConfirm: true,
                  number: true,
                  numberToConfirm: true,
                  verifiedAt: true,
                },
              },
            },
          },
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
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

    if (
      !existingUser?.emailVerification?.verifiedAt ||
      !existingUser?.company?.phone?.numberToConfirm ||
      !existingUser?.company?.phone?.countryCodeToConfirm ||
      !existingUser?.company?.phone?.code ||
      !existingUser?.company?.phone?.number ||
      !existingUser?.company?.phone?.countryCode
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    await database.companyPhone.update({
      data: {
        code: null,
        countryCodeToConfirm: null,
        numberToConfirm: null,
      },
      where: {
        companyId: existingUser.company.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successRollBackCompanyPhoneToVerified",
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const confirmCompanyNewPhone = async ({
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
        [formNames.code]: zodValidator.code,
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
          company: {
            select: {
              phone: {
                select: {
                  code: true,
                  countryCodeToConfirm: true,
                  numberToConfirm: true,
                  verifiedAt: true,
                },
              },
            },
          },
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
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

    if (
      !existingUser?.emailVerification?.verifiedAt ||
      !existingUser?.company?.phone?.numberToConfirm ||
      !existingUser?.company?.phone?.countryCodeToConfirm ||
      !existingUser?.company?.phone?.code
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const isCorrectPhoneCode = await checkPassword(
      resultValidator.data[formNames.code].toString(),
      existingUser.company?.phone.code,
    );

    if (!isCorrectPhoneCode) {
      return await responseOnFailure({
        message: "errorCodeOnVerifiedPhone",
        request,
        status: 422,
      });
    }

    await database.companyPhone.update({
      data: {
        code: null,
        codeExpires: dayjs().add(1, "day").toDate(),
        countryCode: existingUser.company.phone.countryCodeToConfirm,
        countryCodeToConfirm: null,
        number: existingUser.company.phone.numberToConfirm,
        numberToConfirm: null,
        verifiedAt: dayjs().toDate(),
      },
      where: {
        companyId: existingUser.company.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successOnVerifiedSMS",
        modal: existingUser.company.phone?.verifiedAt
          ? undefined
          : "createdAccountWorker",
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const getCompanySMSToVerifiedPhone = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      company: true,
      prismaArguments: {
        select: {
          company: {
            select: {
              phone: {
                select: {
                  code: true,
                  codeExpires: true,
                  countryCodeToConfirm: true,
                  numberToConfirm: true,
                  verifiedAt: true,
                },
              },
            },
          },
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
          lang: true,
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

    if (
      !existingUser?.company?.phone?.numberToConfirm ||
      !existingUser?.company?.phone?.countryCodeToConfirm
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    if (existingUser?.company?.phone?.codeExpires) {
      const isCorrectDateExpires = dayjs().isBefore(
        dayjs(existingUser?.company?.phone?.codeExpires),
      );

      if (isCorrectDateExpires) {
        return await responseOnFailure({
          message: "limitSendPhoneCode",
          request,
          status: 422,
        });
      }
    }

    const generatedPhoneCode = generateRandomDigits(6);
    const hashedPhoneCode = await hashPassword(generatedPhoneCode);

    await database.companyPhone.update({
      data: {
        code: hashedPhoneCode,
        codeExpires: dayjs().add(1, "day").toDate(),
      },
      where: {
        companyId: existingUser.company.id,
      },
    });

    const resultSendVerifiedSMS = await sendVerifiedSMS({
      codePhone: generatedPhoneCode,
      phone: {
        countryCodeToConfirm: existingUser.company.phone.countryCodeToConfirm,
        numberToConfirm: existingUser.company.phone.numberToConfirm,
      },
      request,
      userLanguage: existingUser.lang,
    });

    if (!resultSendVerifiedSMS.successSendSMS) {
      return await responseOnFailure({
        message: "errorOnSendSMS",
        request,
        status: 422,
      });
    }

    return await responseOnSuccess({
      data: {
        ...resultSendVerifiedSMS,
      },
      flashData: {
        message: "successOnSendSMS",
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const updateCompanyPhone = async ({
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
        [formNames.companyPhoneCountryCode]: zodValidator.phoneCountryCode,
        [formNames.companyPhoneNumber]: zodValidator.phoneNumber,
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
              phone: {
                select: {
                  codeExpires: true,
                  countryCode: true,
                  countryCodeToConfirm: true,
                  number: true,
                  numberToConfirm: true,
                  verifiedAt: true,
                },
              },
            },
          },
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
          lang: true,
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

    if (
      !existingUser?.company?.phone?.countryCode ||
      !existingUser?.company?.phone?.number ||
      !existingUser?.company?.phone?.verifiedAt ||
      existingUser?.company?.phone?.numberToConfirm ||
      existingUser?.company?.phone?.countryCodeToConfirm
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    if (existingUser?.company?.phone?.codeExpires) {
      const isCorrectDateExpires = dayjs().isBefore(
        dayjs(existingUser?.company?.phone?.codeExpires),
      );

      if (isCorrectDateExpires) {
        return await responseOnFailure({
          message: "limitUpdatePhoneCode",
          request,
          status: 422,
        });
      }
    }

    const contentToUpdate = {
      countryCode: Number(
        resultValidator.data[formNames.companyPhoneCountryCode],
      ),
      number: Number(resultValidator.data[formNames.companyPhoneNumber]),
    };

    const countryCodeIsTheSame =
      existingUser?.company?.phone?.countryCode?.toString() ===
      contentToUpdate.countryCode.toString();
    const numberCodeIsTheSame =
      existingUser?.company?.phone?.number?.toString() ===
      contentToUpdate.number.toString();

    if (countryCodeIsTheSame && numberCodeIsTheSame) {
      return await responseOnFailure({
        message: "newUserPhoneTheSame",
        request,
        status: 422,
      });
    }

    const generatedPhoneCode = generateRandomDigits(6);
    const hashedPhoneCode = await hashPassword(generatedPhoneCode);

    const updatedPhoneCompany = await database.companyPhone.update({
      data: {
        code: hashedPhoneCode,
        countryCodeToConfirm: contentToUpdate.countryCode,
        numberToConfirm: contentToUpdate.number,
      },
      select: {
        countryCodeToConfirm: true,
        numberToConfirm: true,
      },
      where: {
        companyId: existingUser.company.id,
      },
    });

    await sendVerifiedSMS({
      codePhone: generatedPhoneCode,
      phone: {
        countryCodeToConfirm: updatedPhoneCompany.countryCodeToConfirm,
        numberToConfirm: updatedPhoneCompany.numberToConfirm,
      },
      request,
      userLanguage: existingUser.lang,
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateCompanyPhone",
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
