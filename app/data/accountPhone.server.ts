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

export const deleteNewPhoneUserToConfirm = async ({
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
      company: false,
      prismaArguments: {
        select: {
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
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

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (
      !existingUser?.phone?.numberToConfirm ||
      !existingUser?.phone?.countryCodeToConfirm ||
      !existingUser?.phone?.code
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    await database.userPhone.update({
      data: {
        code: null,
        codeExpires: dayjs().add(1, "day").toDate(),
        countryCodeToConfirm: null,
        numberToConfirm: null,
      },
      where: {
        userId: existingUser.id,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: existingUser?.phone?.verifiedAt
          ? "successRollBackPhoneToVerified"
          : "successRollBackNewPhoneToVerified",
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const confirmUserNewPhone = async ({
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
      company: false,
      prismaArguments: {
        select: {
          companyId: true,
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
          phone: {
            select: {
              code: true,
              countryCodeToConfirm: true,
              numberToConfirm: true,
              verifiedAt: true,
            },
          },
          role: true,
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

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (
      !existingUser?.phone?.numberToConfirm ||
      !existingUser?.phone?.countryCodeToConfirm ||
      !existingUser?.phone?.code
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const isCorrectPhoneCode = await checkPassword(
      resultValidator.data[formNames.code].toString(),
      existingUser?.phone.code,
    );

    if (!isCorrectPhoneCode) {
      return await responseOnFailure({
        message: "errorCodeOnVerifiedPhone",
        request,
        status: 422,
      });
    }

    await database.userPhone.update({
      data: {
        code: null,
        codeExpires: dayjs().add(1, "day").toDate(),
        countryCode: existingUser.phone.countryCodeToConfirm,
        countryCodeToConfirm: null,
        number: existingUser.phone.numberToConfirm,
        numberToConfirm: null,
        verifiedAt: dayjs().toDate(),
      },
      where: {
        userId: existingUser.id,
      },
    });

    const modal = (() => {
      if (existingUser?.phone?.verifiedAt) {
        return;
      }

      if (existingUser.role === E_RolesServer.USER) {
        return "createdAccountUser";
      }

      if (existingUser.role === E_RolesServer.B2B_WORKER) {
        return "createdAccountWorker";
      }

      return;
    })();

    return await responseOnSuccess({
      flashData: {
        message: "successOnVerifiedSMS",
        modal,
        refetchUserSession: true,
      },
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const getUserSMSToVerifiedPhone = async ({
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
      company: false,
      prismaArguments: {
        select: {
          emailVerification: {
            select: {
              verifiedAt: true,
            },
          },
          lang: true,
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

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (
      !existingUser?.phone?.numberToConfirm ||
      !existingUser?.phone?.countryCodeToConfirm
    ) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    if (existingUser?.phone?.codeExpires) {
      const isCorrectDateExpires = dayjs().isBefore(
        dayjs(existingUser?.phone?.codeExpires),
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

    await database.userPhone.update({
      data: {
        code: hashedPhoneCode,
        codeExpires: dayjs().add(1, "day").toDate(),
      },
      where: {
        userId: existingUser.id,
      },
    });

    const resultSendVerifiedSMS = await sendVerifiedSMS({
      codePhone: generatedPhoneCode,
      phone: {
        countryCodeToConfirm: existingUser.phone.countryCodeToConfirm,
        numberToConfirm: existingUser.phone.numberToConfirm,
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

export const updateUserPhone = async ({
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
        [formNames.phoneCountryCode]: zodValidator.phoneCountryCode,
        [formNames.phoneNumber]: zodValidator.phoneNumber,
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
      company: false,
      prismaArguments: {
        select: {
          lang: true,
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

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    if (
      existingUser?.phone &&
      (existingUser?.phone?.numberToConfirm ||
        existingUser?.phone?.countryCodeToConfirm)
    ) {
      return await responseOnFailure({
        message: "inProgressPhoneChange",
        request,
        status: 422,
      });
    }

    if (existingUser?.phone?.codeExpires) {
      const isCorrectDateExpires = dayjs().isBefore(
        dayjs(existingUser?.phone?.codeExpires),
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
      countryCode: Number(resultValidator.data[formNames.phoneCountryCode]),
      number: Number(resultValidator.data[formNames.phoneNumber]),
    };

    if (existingUser?.phone) {
      const countryCodeIsTheSame =
        existingUser.phone?.countryCode?.toString() ===
        contentToUpdate.countryCode.toString();
      const numberCodeIsTheSame =
        existingUser.phone?.number?.toString() ===
        contentToUpdate.number.toString();

      if (countryCodeIsTheSame && numberCodeIsTheSame) {
        return await responseOnFailure({
          message: "newUserPhoneTheSame",
          request,
          status: 422,
        });
      }
    }

    const generatedPhoneCode = generateRandomDigits(6);
    const hashedPhoneCode = await hashPassword(generatedPhoneCode);

    if (existingUser?.phone) {
      await sendVerifiedSMS({
        codePhone: generatedPhoneCode,
        phone: {
          countryCodeToConfirm: contentToUpdate.countryCode,
          numberToConfirm: contentToUpdate.number,
        },
        request,
        userLanguage: existingUser.lang,
      });

      await database.userPhone.update({
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
          userId: existingUser.id,
        },
      });
    } else {
      await sendVerifiedSMS({
        codePhone: generatedPhoneCode,
        phone: {
          countryCodeToConfirm: contentToUpdate.countryCode,
          numberToConfirm: contentToUpdate.number,
        },
        request,
        userLanguage: existingUser.lang,
      });

      await database.userPhone.create({
        data: {
          code: hashedPhoneCode,
          countryCodeToConfirm: contentToUpdate.countryCode,
          numberToConfirm: contentToUpdate.number,
          userId: existingUser.id,
        },
        select: {
          countryCodeToConfirm: true,
          numberToConfirm: true,
        },
      });
    }

    const updatedUser = await database.user.findUnique({
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
      where: {
        id: existingUser.id,
      },
    });

    if (!updatedUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    return await responseOnSuccess({
      flashData: {
        message: "successUpdatePhone",
        refetchUserSession: true,
      },
      newUserSession: {
        userCompanyId: updatedUser?.company?.id ?? null,
        userCompanyName: updatedUser?.company?.name ?? null,
        userEmailVerification: updatedUser.emailVerification,
        userFirstName: updatedUser.firstName,
        userId: updatedUser.id,
        userLang: updatedUser.lang,
        userLastName: updatedUser.lastName,
        userPhoneVerification: updatedUser.phone,
        userRole: updatedUser.role,
        userSessionVersion: updatedUser.sessionVersion,
      },
      redirectTo: E_Routes.account,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
