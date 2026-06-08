import { TFunction } from "i18next";

import { cities } from "~/constants/cities";
import { E_Routes, T_RouteValue } from "~/constants/routes";
import { T_GetLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { allListingCategory, getCategorySlug } from "~/models/enums";
import { T_UserCookie } from "~/models/userCookie";
import { isEnableCreateOrLoginCompany } from "~/utilities/flags";

type T_GenerateFooterReturnRoute = {
  reloadDocument?: boolean;
  title: string;
  url: T_RouteValue;
};

type T_GenerateFooterReturn = {
  routes: T_GenerateFooterReturnRoute[];
  title: string;
};

export const generateFooter = ({
  getLocalizedRoute,
  t,
  userCookie,
}: {
  getLocalizedRoute: T_GetLocalizedRoute;
  t: TFunction<"common", undefined>;
  userCookie: null | T_UserCookie;
}): T_GenerateFooterReturn[] => {
  const sortedCities = [...cities].sort((a, b) => {
    const firstItemToSort = a.name;
    const secondItemToSort = b.name;

    return firstItemToSort.localeCompare(secondItemToSort);
  });

  const mapAllCities: T_GenerateFooterReturnRoute[] = sortedCities.map(item => {
    return {
      title: item.name,
      url: getLocalizedRoute({
        extraPath: `/${item.nameSearch.toLowerCase()}`,
        route: E_Routes.cities,
      }),
    };
  });

  const mapAllCategories: T_GenerateFooterReturnRoute[] = [
    ...allListingCategory,
  ]
    .sort((a, b) => {
      const firstItemToSort = t(`listingCategory.${a}`);
      const secondItemToSort = t(`listingCategory.${b}`);

      return firstItemToSort.localeCompare(secondItemToSort);
    })
    .map(item => {
      return {
        title: t(`listingCategoryPlural.${item}`),
        url: getLocalizedRoute({
          extraPath: `/${getCategorySlug(item)}`,
          route: E_Routes.search,
        }),
      };
    });

  const footerMenu: T_GenerateFooterReturn[] = [
    {
      routes: [
        {
          title: t(`breadcrumbs.${E_Routes.home}`),
          url: getLocalizedRoute({
            route: E_Routes.home,
          }),
        },
        {
          title: t(`breadcrumbs.${E_Routes.aboutUs}`),
          url: getLocalizedRoute({
            route: E_Routes.aboutUs,
          }),
        },
        {
          title: t(`breadcrumbs.${E_Routes.howToAddListing}`),
          url: getLocalizedRoute({
            route: E_Routes.howToAddListing,
          }),
        },
        {
          title: t(`breadcrumbs.${E_Routes.howToSearchListing}`),
          url: getLocalizedRoute({
            route: E_Routes.howToSearchListing,
          }),
        },
        {
          title: t(`breadcrumbs.${E_Routes.search}`),
          url: getLocalizedRoute({
            route: E_Routes.search,
          }),
        },
        {
          title: t(`breadcrumbs.${E_Routes.archive}`),
          url: getLocalizedRoute({
            route: E_Routes.archive,
          }),
        },
        ...(userCookie
          ? [
              {
                title: t(`breadcrumbs.${E_Routes.account}`),
                url: getLocalizedRoute({
                  route: E_Routes.account,
                }),
              },
              ...(userCookie?.userCompanyId
                ? [
                    {
                      title: t(`breadcrumbs.${E_Routes.company}`),
                      url: getLocalizedRoute({
                        route: E_Routes.company,
                      }),
                    },
                  ]
                : []),
            ]
          : [
              {
                title: t(`breadcrumbs.${E_Routes.login}`),
                url: getLocalizedRoute({
                  route: E_Routes.login,
                }),
              },
              {
                title: t(`breadcrumbs.${E_Routes.recoveryAccount}`),
                url: getLocalizedRoute({
                  route: E_Routes.recoveryAccount,
                }),
              },
              {
                title: t(`breadcrumbs.${E_Routes.registration}`),
                url: getLocalizedRoute({
                  route: E_Routes.registration,
                }),
              },
              {
                title: t(`breadcrumbs.${E_Routes.registrationAccount}`),
                url: getLocalizedRoute({
                  route: E_Routes.registrationAccount,
                }),
              },
              ...(isEnableCreateOrLoginCompany()
                ? [
                    {
                      title: t(`breadcrumbs.${E_Routes.registrationCompany}`),
                      url: getLocalizedRoute({
                        route: E_Routes.registrationCompany,
                      }),
                    },
                  ]
                : []),
            ]),
        {
          title: t(`breadcrumbs.${E_Routes.help}`),
          url: getLocalizedRoute({
            route: E_Routes.help,
          }),
        },
        {
          title: t(`breadcrumbs.${E_Routes.contact}`),
          url: getLocalizedRoute({
            route: E_Routes.contact,
          }),
        },
        {
          title: t(`breadcrumbs.${E_Routes.accessibility}`),
          url: getLocalizedRoute({
            route: E_Routes.accessibility,
          }),
        },
        {
          reloadDocument: true,
          title: t(`breadcrumbs.${E_Routes.termsAndConditions}`),
          url: getLocalizedRoute({
            route: E_Routes.termsAndConditions,
          }),
        },
        {
          reloadDocument: true,
          title: t(`breadcrumbs.${E_Routes.privacyPolicy}`),
          url: getLocalizedRoute({
            route: E_Routes.privacyPolicy,
          }),
        },
        {
          reloadDocument: true,
          title: t(`breadcrumbs.${E_Routes.newsletter}`),
          url: getLocalizedRoute({
            route: E_Routes.newsletter,
          }),
        },
      ],
      title: t("footer.pages"),
    },
    {
      routes: [...mapAllCategories],
      title: t("footer.categories"),
    },
    {
      routes: [
        ...mapAllCities,
        {
          title: t(`breadcrumbs.searchOtherCities`),
          url: getLocalizedRoute({
            route: E_Routes.cities,
          }),
        },
      ],
      title: t("footer.cities"),
    },
  ];

  return footerMenu;
};
