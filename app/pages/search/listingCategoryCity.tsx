import { useEffect, useMemo } from "react";
import { LoaderFunctionArgs, useNavigate, useParams } from "react-router";
import z from "zod";

import { SearchListingCategoryCityPage } from "~/components/SearchListingCategoryCityPage";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { getListingsSearch } from "~/data/home.server";
import { T_ListingCategoryServer } from "~/data/models.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Z_City } from "~/models/city";
import { Z_CityCategoryCounts } from "~/models/cityCategoryCounts";
import { T_CityName } from "~/models/cityNested";
import { getCategoryFromSlug, T_ListingCategory } from "~/models/enums";
import { Z_Listings } from "~/models/listings";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.search, namespaces.home],
});

export default function Page() {
  const { listingCategory } = useParams<{
    listingCategory?: T_ListingCategory;
  }>();
  const navigate = useNavigate();
  const { getLocalizedRoute } = useLocalizedRoute();

  const errorMessageValidatorCategory = useMemo(
    () =>
      checkFormValidator({
        formName: formNames.listingCategory,
        value: listingCategory
          ? (getCategoryFromSlug(listingCategory) ?? "")
          : "",
      }),
    [listingCategory],
  );

  const isErrorInPath = errorMessageValidatorCategory || !listingCategory;

  useEffect(() => {
    if (isErrorInPath) {
      navigate(
        getLocalizedRoute({
          route: E_Routes.error,
        }),
        {
          replace: true,
        },
      );

      return;
    }
  }, [isErrorInPath]);

  if (isErrorInPath) {
    return null;
  }

  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          city: Z_City,
          cityCategoryCounts: Z_CityCategoryCounts.optional(),
          listings: Z_Listings,
          nextPage: z.number().nullable(),
          totalPages: z.number().optional().nullable(),
          totalResults: z.number(),
        })}
      >
        {data => (
          <SearchListingCategoryCityPage
            city={data.city}
            cityCategoryCounts={data.cityCategoryCounts}
            district={null}
            listingCategory={
              getCategoryFromSlug(listingCategory) as T_ListingCategory
            }
            listings={data.listings}
            nextPage={data.nextPage}
            totalPages={data.totalPages}
            totalResults={data.totalResults}
          />
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    return await getListingsSearch({
      listingCategory:
        (getCategoryFromSlug(
          params?.listingCategory ?? "",
        ) as T_ListingCategoryServer) ?? null,
      listingCity: (params?.listingCity as T_CityName) ?? null,
      listingCityDistrict: null,
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};
