import axios from "axios";
import { TFunction } from "i18next";

import { namespaces } from "~/constants/namespaces";
import { environment } from "~/data/environment.server";
import i18next from "~/localization/i18n.server";
import { T_Language } from "~/models/enums";

import { checkIsFlagSMSDisabledBackend } from "./flags.server";
import { E_LanguagesServer } from "./models.server";

export type T_SendSMSResponseAPi = {
  ErrorMessage?: string;
  MessageId: string;
};

type T_SendSMSResult = {
  messageId?: string;
  success: boolean;
};

type T_SendSMSPhone = {
  countryCode: number;
  number: bigint | number;
  verified: boolean;
};

type T_SendSMS = {
  message: string;
  phone: null | T_SendSMSPhone;
  request: Request;
};

export const sendSMS = async ({
  message,
  phone,
  request,
}: T_SendSMS): Promise<T_SendSMSResult> => {
  try {
    const isFlagSMSDisabled = checkIsFlagSMSDisabledBackend(request);
    if (isFlagSMSDisabled) {
      return {
        success: true,
      };
    }

    if (!phone || !message) {
      return {
        success: false,
      };
    }

    if (!phone?.verified) {
      return {
        success: false,
      };
    }

    if (!phone?.number || !phone?.countryCode) {
      return {
        success: false,
      };
    }

    if (!Number(phone?.number)) {
      return {
        success: false,
      };
    }

    const fullNumberPhone = `${phone.countryCode}${Number(phone.number)}`;

    const validatedNumber =
      phone.number.toString().length >= 9 &&
      phone.number.toString().length <= 11;

    const validatedPhoneNumber =
      fullNumberPhone.length >= 11 && fullNumberPhone.length <= 13;

    if (!validatedPhoneNumber || !validatedNumber) {
      return {
        success: false,
      };
    }

    const result = await axios.post<T_SendSMSResponseAPi>(
      environment("HOSTED_SMS_API"),
      {
        Message: message,
        Password: environment("HOSTED_SMS_PASSWORD"),
        Phone: fullNumberPhone,
        Sender: environment("HOSTED_SMS_SENDER"),
        UserEmail: environment("HOSTED_SMS_EMAIL"),
      },
      {
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      },
    );

    if (result.status !== 200) {
      return {
        success: false,
      };
    }

    if (result.data.ErrorMessage) {
      return {
        success: false,
      };
    }

    return {
      messageId: result?.data?.MessageId,
      success: true,
    };
  } catch {
    return {
      success: false,
    };
  }
};

type T_SendVerificationSMSPhone = {
  countryCodeToConfirm: null | number;
  numberToConfirm: bigint | null | number;
};

type T_SendVerificationSMS = {
  codePhone: string;
  phone: null | T_SendVerificationSMSPhone;
  request: Request;
  userLanguage: T_Language;
};

type T_SendVerificationSMSResult = {
  codePhone?: string;
  messageId?: string;
  successSendSMS: boolean;
};

export const sendVerifiedSMS = async ({
  codePhone,
  phone,
  request,
  userLanguage = E_LanguagesServer.PL,
}: T_SendVerificationSMS): Promise<T_SendVerificationSMSResult> => {
  if (!phone?.countryCodeToConfirm || !phone?.numberToConfirm) {
    return {
      successSendSMS: false,
    };
  }

  const isFlagSMSDisabled = checkIsFlagSMSDisabledBackend(request);
  if (isFlagSMSDisabled) {
    return {
      codePhone,
      successSendSMS: true,
    };
  }

  const t: TFunction<"sms", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.sms,
  );

  const resultSendSMS = await sendSMS({
    message: `${t("confirmNewPhone1")} ${codePhone}. ${t("confirmNewPhone2")}`,
    phone: {
      countryCode: phone.countryCodeToConfirm,
      number: phone.numberToConfirm,
      verified: true,
    },
    request,
  });

  return {
    messageId: resultSendSMS?.messageId,
    successSendSMS: resultSendSMS.success,
  };
};
