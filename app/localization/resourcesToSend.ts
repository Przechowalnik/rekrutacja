import blogPostsEn from "~/locales/en/blogPosts.json";
import commonEn from "~/locales/en/common.json";
import emailsEn from "~/locales/en/emails.json";
import invoiceEn from "~/locales/en/invoice.json";
import smsEn from "~/locales/en/sms.json";
import blogPostsPl from "~/locales/pl/blogPosts.json";
import commonPl from "~/locales/pl/common.json";
import emailsPl from "~/locales/pl/emails.json";
import invoicePl from "~/locales/pl/invoice.json";
import smsPl from "~/locales/pl/sms.json";

export const resourcesToSend = {
  en: {
    blogPosts: blogPostsEn,
    common: commonEn,
    emails: emailsEn,
    invoice: invoiceEn,
    sms: smsEn,
  },
  pl: {
    blogPosts: blogPostsPl,
    common: commonPl,
    emails: emailsPl,
    invoice: invoicePl,
    sms: smsPl,
  },
} as const;
