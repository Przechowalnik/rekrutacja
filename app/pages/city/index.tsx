import { LoaderFunctionArgs } from "react-router";
import z from "zod";

import { SearchListingCitiesPage } from "~/components/SearchListingCitiesPage";
import { getListingCities } from "~/data/home.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Cities } from "~/models/cities";
import { Z_CityCounts } from "~/models/cityCounts";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";

export const handle = getI18nextNamespaces({
  extraNamespaces: [],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          cities: Z_Cities,
          cityCounts: Z_CityCounts.optional(),
        })}
      >
        {data => (
          <SearchListingCitiesPage
            cities={data.cities}
            cityCounts={data.cityCounts}
          />
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    return await getListingCities({ request });
  } catch (error) {
    return responseThrowError({ error });
  }
};
