import type { TFunction } from "i18next";

import { reduceMultipleSpaces } from "~/lib/validations";

const convertToValidStringWithSyn = (
  value: string,
  lang = "pl", // NOSONAR
  t: TFunction<"help", undefined>,
) => {
  let string_ = reduceMultipleSpaces(value.toLowerCase()).trim();

  const charMap = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
  };
  const rx = /([óąćęłńśźż])/g;
  if (rx.test(string_)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    string_ = string_.replaceAll(rx, (_, key) => charMap[key]);
  }

  string_ = string_.replaceAll(/[^\d\sa-z-]/gi, "");
  string_ = string_.replaceAll(/(^\s+)|(\s+$)/g, "");

  const synonyms: Record<string, string[]> =
    t("synonyms", { lng: lang, returnObjects: true }) || {};

  for (const [key, variants] of Object.entries(synonyms)) {
    if (string_.includes(key)) {
      string_ += " " + variants.join(" ");
    }
  }

  return string_;
};

function generateTitleVariants({
  base,
  language,
  t,
}: {
  base: string;
  language: string;
  t: TFunction<"help", undefined>;
}): string[] {
  if (!base) {
    return [];
  }

  const variants = t("titleVariants", {
    base: base.toLowerCase(),
    lng: language,
    returnObjects: true,
  }) as string[];

  if (!variants || !Array.isArray(variants)) {
    return [];
  }

  return variants.filter(Boolean);
}

export type T_GetFaqResult = {
  items: {
    description: string;
    searchText?: string;
    title: string;
  }[];
  title: string;
};

export const getFaq = (
  t: TFunction<"help", undefined>,
  language: string,
): T_GetFaqResult[] => {
  const sortFaqResult = (faqs: T_GetFaqResult[]): T_GetFaqResult[] => {
    return [...faqs]
      .map(faq => ({
        ...faq,
        items: [...faq.items].sort((a, b) =>
          a.title.localeCompare(b.title, "pl", { sensitivity: "base" }),
        ),
      }))
      .sort((a, b) =>
        a.title.localeCompare(b.title, "pl", { sensitivity: "base" }),
      );
  };

  const faq: T_GetFaqResult[] = [
    {
      items: [
        {
          description: t("faq.accountCompany.showListings.description"),
          title: t("faq.accountCompany.showListings.title"),
        },
        {
          description: t("faq.accountCompany.extendListing.description"),
          title: t("faq.accountCompany.extendListing.title"),
        },
        {
          description: t("faq.accountCompany.updateListing.description"),
          title: t("faq.accountCompany.updateListing.title"),
        },
        {
          description: t("faq.accountCompany.addListing.description"),
          title: t("faq.accountCompany.addListing.title"),
        },
        {
          description: t(
            "faq.accountCompany.exchangePointsForSubscriptionDays.description",
          ),
          title: t(
            "faq.accountCompany.exchangePointsForSubscriptionDays.title",
          ),
        },
        {
          description: t("faq.accountCompany.checkCompanyPoints.description"),
          title: t("faq.accountCompany.checkCompanyPoints.title"),
        },
        {
          description: t("faq.accountCompany.findInvoices.description"),
          title: t("faq.accountCompany.findInvoices.title"),
        },
        {
          description: t("faq.accountCompany.deleteEmployee.description"),
          title: t("faq.accountCompany.deleteEmployee.title"),
        },
        {
          description: t("faq.accountCompany.updateEmployeeAvatar.description"),
          title: t("faq.accountCompany.updateEmployeeAvatar.title"),
        },
        {
          description: t("faq.accountCompany.updateEmployeeName.description"),
          title: t("faq.accountCompany.updateEmployeeName.title"),
        },
        {
          description: t(
            "faq.accountCompany.manageEmployeePermissions.description",
          ),
          title: t("faq.accountCompany.manageEmployeePermissions.title"),
        },
        {
          description: t("faq.accountCompany.manageLoginMethods.description"),
          title: t("faq.accountCompany.manageLoginMethods.title"),
        },
        {
          description: t(
            "faq.accountCompany.requireSecurityForEmployees.description",
          ),
          title: t("faq.accountCompany.requireSecurityForEmployees.title"),
        },
        {
          description: t(
            "faq.accountCompany.addCompanySocialLinks.description",
          ),
          title: t("faq.accountCompany.addCompanySocialLinks.title"),
        },
        {
          description: t("faq.accountCompany.updateCompanyAvatar.description"),
          title: t("faq.accountCompany.updateCompanyAvatar.title"),
        },
        {
          description: t("faq.accountCompany.updateCompanyBanner.description"),
          title: t("faq.accountCompany.updateCompanyBanner.title"),
        },
        {
          description: t(
            "faq.accountCompany.updateCompanyDescription.description",
          ),
          title: t("faq.accountCompany.updateCompanyDescription.title"),
        },
        {
          description: t("faq.accountCompany.deleteCompany.description"),
          title: t("faq.accountCompany.deleteCompany.title"),
        },
        {
          description: t(
            "faq.accountCompany.registerCompanyAccount.description",
          ),
          title: t("faq.accountCompany.registerCompanyAccount.title"),
        },
        {
          description: t("faq.accountCompany.startReferral.description"),
          title: t("faq.accountCompany.startReferral.title"),
        },
        {
          description: t("faq.accountCompany.invoiceData.description"),
          title: t("faq.accountCompany.invoiceData.title"),
        },
        {
          description: t("faq.accountCompany.getInvoice.description"),
          title: t("faq.accountCompany.getInvoice.title"),
        },
        {
          description: t("faq.accountCompany.freeTrial.description"),
          title: t("faq.accountCompany.freeTrial.title"),
        },
        {
          description: t("faq.accountCompany.createSubscription.description"),
          title: t("faq.accountCompany.createSubscription.title"),
        },
        {
          description: t(
            "faq.accountCompany.checkSubscriptionOrFreeTrial.description",
          ),
          title: t("faq.accountCompany.checkSubscriptionOrFreeTrial.title"),
        },
        {
          description: t("faq.accountCompany.updateCard.description"),
          title: t("faq.accountCompany.updateCard.title"),
        },
        {
          description: t("faq.accountCompany.addCard.description"),
          title: t("faq.accountCompany.addCard.title"),
        },
        {
          description: t("faq.accountCompany.information.description"),
          title: t("faq.accountCompany.information.title"),
        },
        {
          description: t("faq.accountCompany.informationEdit.description"),
          title: t("faq.accountCompany.informationEdit.title"),
        },
        {
          description: t("faq.accountCompany.changeCompanyPhone.description"),
          title: t("faq.accountCompany.changeCompanyPhone.title"),
        },
        {
          description: t("faq.accountCompany.companyBugs.description"),
          title: t("faq.accountCompany.companyBugs.title"),
        },
        {
          description: t("faq.accountCompany.showBugDetails.description"),
          title: t("faq.accountCompany.showBugDetails.title"),
        },
      ],
      title: t("faq.accountCompany.title"),
    },
    {
      items: [
        {
          description: t("faq.accountUser.showListings.description"),
          title: t("faq.accountUser.showListings.title"),
        },
        {
          description: t("faq.accountUser.extendListing.description"),
          title: t("faq.accountUser.extendListing.title"),
        },
        {
          description: t("faq.accountUser.updateListing.description"),
          title: t("faq.accountUser.updateListing.title"),
        },
        {
          description: t("faq.accountUser.addListing.description"),
          title: t("faq.accountUser.addListing.title"),
        },
        {
          description: t("faq.accountUser.checkUserPoints.description"),
          title: t("faq.accountUser.checkUserPoints.title"),
        },
        {
          description: t("faq.accountUser.findInvoices.description"),
          title: t("faq.accountUser.findInvoices.title"),
        },
        {
          description: t("faq.accountUser.updateUserName.description"),
          title: t("faq.accountUser.updateUserName.title"),
        },
        {
          description: t("faq.accountUser.updateUserAvatar.description"),
          title: t("faq.accountUser.updateUserAvatar.title"),
        },
        {
          description: t("faq.accountUser.registerUserAccount.description"),
          title: t("faq.accountUser.registerUserAccount.title"),
        },
        {
          description: t("faq.accountUser.logout.description"),
          title: t("faq.accountUser.logout.title"),
        },
        {
          description: t("faq.accountUser.manageSessions.description"),
          title: t("faq.accountUser.manageSessions.title"),
        },
        {
          description: t("faq.accountUser.loginWithFacebook.description"),
          title: t("faq.accountUser.loginWithFacebook.title"),
        },
        {
          description: t("faq.accountUser.loginWithGoogle.description"),
          title: t("faq.accountUser.loginWithGoogle.title"),
        },
        {
          description: t("faq.accountUser.startReferral.description"),
          title: t("faq.accountUser.startReferral.title"),
        },
        {
          description: t("faq.accountUser.loginToAccount.description"),
          title: t("faq.accountUser.loginToAccount.title"),
        },
        {
          description: t("faq.accountUser.recoveryAccount.description"),
          title: t("faq.accountUser.recoveryAccount.title"),
        },
        {
          description: t("faq.accountUser.recoveryAccount2FA.description"),
          title: t("faq.accountUser.recoveryAccount2FA.title"),
        },
        {
          description: t("faq.accountUser.changeUserName.description"),
          title: t("faq.accountUser.changeUserName.title"),
        },
        {
          description: t("faq.accountUser.changeUserPassword.description"),
          title: t("faq.accountUser.changeUserPassword.title"),
        },
        {
          description: t("faq.accountUser.changeUserEmail.description"),
          title: t("faq.accountUser.changeUserEmail.title"),
        },
        {
          description: t("faq.accountUser.addUserPhone.description"),
          title: t("faq.accountUser.addUserPhone.title"),
        },
        {
          description: t("faq.accountUser.changeUserPhone.description"),
          title: t("faq.accountUser.changeUserPhone.title"),
        },
        {
          description: t(
            "faq.accountUser.activeAuthenticatorEmailOTP.description",
          ),
          title: t("faq.accountUser.activeAuthenticatorEmailOTP.title"),
        },
        {
          description: t(
            "faq.accountUser.deActiveAuthenticatorEmailOTP.description",
          ),
          title: t("faq.accountUser.deActiveAuthenticatorEmailOTP.title"),
        },
        {
          description: t("faq.accountUser.activeAuthenticator2FA.description"),
          title: t("faq.accountUser.activeAuthenticator2FA.title"),
        },
        {
          description: t(
            "faq.accountUser.deActiveAuthenticator2FA.description",
          ),
          title: t("faq.accountUser.deActiveAuthenticator2FA.title"),
        },
        {
          description: t("faq.accountUser.updateConsents.description"),
          title: t("faq.accountUser.updateConsents.title"),
        },
        {
          description: t("faq.accountUser.showBugs.description"),
          title: t("faq.accountUser.showBugs.title"),
        },
        {
          description: t("faq.accountUser.addBugs.description"),
          title: t("faq.accountUser.addBugs.title"),
        },
        {
          description: t("faq.accountUser.showBugDetails.description"),
          title: t("faq.accountUser.showBugDetails.title"),
        },
        {
          description: t("faq.accountUser.deleteAccount.description"),
          title: t("faq.accountUser.deleteAccount.title"),
        },
      ],
      title: t("faq.accountUser.title"),
    },
    {
      items: [
        {
          description: t("faq.settingsSite.searchListings.description"),
          title: t("faq.settingsSite.searchListings.title"),
        },
        {
          description: t("faq.settingsSite.updateCookies.description"),
          title: t("faq.settingsSite.updateCookies.title"),
        },
        {
          description: t("faq.settingsSite.enterReferralCode.description"),
          title: t("faq.settingsSite.enterReferralCode.title"),
        },
        {
          description: t("faq.settingsSite.changeLanguage.description"),
          title: t("faq.settingsSite.changeLanguage.title"),
        },
        {
          description: t("faq.settingsSite.changeColorMode.description"),
          title: t("faq.settingsSite.changeColorMode.title"),
        },
      ],
      title: t("faq.settingsSite.title"),
    },
  ];

  const faqWithSearchData = faq.map(category => ({
    ...category,
    items: category.items.map(item => ({
      ...item,
      searchText: [
        convertToValidStringWithSyn(item.title, language, t),
        convertToValidStringWithSyn(item.description, language, t),
        ...generateTitleVariants({
          base: item.title,
          language,
          t,
        }).map(variant => convertToValidStringWithSyn(variant, language, t)),
      ].join(" "),
    })),
    searchText: convertToValidStringWithSyn(category.title, language, t),
  }));

  const sorted = sortFaqResult(faqWithSearchData);

  return sorted;
};
