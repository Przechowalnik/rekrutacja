import { useEffect, useMemo } from "react";
import { LoaderFunctionArgs, useNavigate, useParams } from "react-router";
import z from "zod";

import { SearchListingCitiesPage } from "~/components/SearchListingCitiesPage";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { getListingCitiesForCategory } from "~/data/home.server";
import { responseThrowError, throwNotFound } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Z_CategoryCityCounts } from "~/models/categoryCityCounts";
import { Z_Cities } from "~/models/cities";
import { getCategoryFromSlug, T_ListingCategory } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.search],
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
          categoryCityCounts: Z_CategoryCityCounts.optional(),
          cities: Z_Cities,
        })}
      >
        {data => (
          <SearchListingCitiesPage
            category={
              listingCategory ? getCategoryFromSlug(listingCategory) : null
            }
            categoryCityCounts={data.categoryCityCounts}
            cities={data.cities}
          />
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    const category = getCategoryFromSlug(params?.listingCategory ?? "");
    if (!category) {
      throwNotFound();
    }

    return await getListingCitiesForCategory({
      category,
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};
