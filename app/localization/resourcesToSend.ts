import commonEn from "~/locales/en/common.json";
import emailsEn from "~/locales/en/emails.json";
import smsEn from "~/locales/en/sms.json";
import commonPl from "~/locales/pl/common.json";
import emailsPl from "~/locales/pl/emails.json";
import smsPl from "~/locales/pl/sms.json";

export const resourcesToSend = {
  en: {
    common: commonEn,
    emails: emailsEn,
    sms: smsEn,
  },
  pl: {
    common: commonPl,
    emails: emailsPl,
    sms: smsPl,
  },
} as const;
