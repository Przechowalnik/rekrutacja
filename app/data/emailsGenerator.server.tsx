import { render } from "@react-email/render";
import CheckoutListingPaymentFailed from "emails/CheckoutListingPaymentFailed";
import { TFunction } from "i18next";

import { namespaces } from "~/constants/namespaces";
import {
  checkIsFlagEmailDisabledBackend,
  checkIsFlagOtpCodeDisabledBackend,
  isTestInvoicesServer,
} from "~/data/flags.server";
import i18next from "~/localization/i18n.server";
import { T_Language } from "~/models/enums";

import BackupChangedEmail from "../../emails/BackupChangedEmail.server";
import ChangedEmail from "../../emails/ChangedEmail.server";
import ChangedPassword from "../../emails/ChangedPassword.server";
import EmailOTPCode from "../../emails/EmailOtpCode.server";
import EmailVerified from "../../emails/EmailVerified.server";
import LoginCodeEmail from "../../emails/LoginCodeEmail.server";
import NewEmailCode from "../../emails/NewEmailCode.server";
import RecoveryAccountPassword from "../../emails/RecoveryAccountPassword.server";
import SendInvoice from "../../emails/SendInvoice.server";
import SubscriptionCancelled from "../../emails/SubscriptionCancelled.server";
import SubscriptionCreated from "../../emails/SubscriptionCreated.server";
import SubscriptionDeleted from "../../emails/SubscriptionDeleted.server";
import SubscriptionPaymentFailed from "../../emails/SubscriptionPaymentFailed.server";
import SubscriptionTrialEndingWithBilling from "../../emails/SubscriptionTrialEndingWithBilling.server";
import SubscriptionUpcoming from "../../emails/SubscriptionUpcoming.server";
import { getEmailsClient, getEmailsSender } from "./emails.server";
import { E_LanguagesServer } from "./models.server";

function stripHtml(html: string) {
  return html
    .replaceAll(/<[^>]*>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
}

export const sendVerifiedEmail = async ({
  codeEmail,
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  codeEmail: string;
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagOtpCodeDisabled = checkIsFlagOtpCodeDisabledBackend(request);
  if (isFlagOtpCodeDisabled) {
    return {
      codeEmail,
    };
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(
    <LoginCodeEmail t={t} validationCode={codeEmail} />,
  );

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendVerifiedEmail.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendVerifiedNewEmail = async ({
  code,
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  code: string;
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagOtpCodeDisabled = checkIsFlagOtpCodeDisabledBackend(request);
  if (isFlagOtpCodeDisabled) {
    return {
      code,
    };
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<NewEmailCode t={t} validationCode={code} />);

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendVerifiedNewEmail.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendBackupChangedEmail = async ({
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<BackupChangedEmail t={t} />);

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendBackupChangedEmail.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendChangedPassword = async ({
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<ChangedPassword t={t} />);

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendChangedPassword.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendInvoice = async ({
  pdfBuffer,
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  pdfBuffer: Buffer;
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled || isTestInvoicesServer()) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<SendInvoice t={t} />);

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    Attachments: [
      {
        Content: pdfBuffer.toString("base64"),
        ContentID: "invoice-pdf",
        ContentType: "application/pdf",
        Name: "invoice.pdf",
      },
    ],
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendInvoice.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendRecoveryAccountPassword = async ({
  recoveryLink,
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  recoveryLink: string;
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagOtpCodeDisabled = checkIsFlagOtpCodeDisabledBackend(request);
  if (isFlagOtpCodeDisabled) {
    return {
      recoveryLink,
    };
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(
    <RecoveryAccountPassword recoveryLink={recoveryLink} t={t} />,
  );

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendRecoveryAccountPassword.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendChangedEmail = async ({
  recoveryLink,
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  recoveryLink: string;
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagOtpCodeDisabled = checkIsFlagOtpCodeDisabledBackend(request);
  if (isFlagOtpCodeDisabled) {
    return {
      recoveryLink,
    };
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<ChangedEmail recoveryLink={recoveryLink} t={t} />);
  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendChangedEmail.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendEmailOTPCode = async ({
  code,
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  code: string;
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagOtpCodeDisabled = checkIsFlagOtpCodeDisabledBackend(request);
  if (isFlagOtpCodeDisabled) {
    return { code };
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<EmailOTPCode t={t} validationCode={code} />);
  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendEmailOTPCode.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendEmailIsVerified = async ({
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<EmailVerified t={t} />);

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendEmailIsVerified.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendSubscriptionCreated = async ({
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<SubscriptionCreated t={t} />);

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendSubscriptionCreated.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendSubscriptionCancelled = async ({
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<SubscriptionCancelled t={t} />);

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendSubscriptionCancelled.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendSubscriptionDeleted = async ({
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<SubscriptionDeleted t={t} />);

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendSubscriptionDeleted.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendSubscriptionUpcoming = async ({
  nextPaymentAttempt,
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  nextPaymentAttempt: string;
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(
    <SubscriptionUpcoming nextPaymentAttempt={nextPaymentAttempt} t={t} />,
  );

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendSubscriptionUpcoming.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendSubscriptionPaymentFailed = async ({
  nextPaymentAttempt,
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  nextPaymentAttempt: string;
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(
    <SubscriptionPaymentFailed nextPaymentAttempt={nextPaymentAttempt} t={t} />,
  );

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendSubscriptionPaymentFailed.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendCheckoutListingPaymentFailed = async ({
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(<CheckoutListingPaymentFailed t={t} />);

  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendListingExtensionPaymentFailed.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};

export const sendSubscriptionTrialEndingWithBilling = async ({
  nextPaymentAttempt,
  request,
  toEmail,
  userLanguage = E_LanguagesServer.PL,
}: {
  nextPaymentAttempt: string;
  request: Request;
  toEmail: string;
  userLanguage: T_Language;
}) => {
  const isFlagEmailDisabled = checkIsFlagEmailDisabledBackend(request);
  if (isFlagEmailDisabled) {
    return;
  }

  const t: TFunction<"emails", undefined> = await i18next.getFixedT(
    userLanguage.toLowerCase(),
    namespaces.emails,
  );

  const html = await render(
    <SubscriptionTrialEndingWithBilling
      nextPaymentAttempt={nextPaymentAttempt}
      t={t}
    />,
  );
  const client = getEmailsClient();
  const sender = getEmailsSender();

  await client.sendEmail({
    From: `${sender.name} <${sender.email}>`,
    HtmlBody: html,
    MessageStream: "outbound",
    Subject: t("sendSubscriptionTrialEndingWithBilling.subject"),
    TextBody: stripHtml(html),
    To: toEmail,
  });
};
