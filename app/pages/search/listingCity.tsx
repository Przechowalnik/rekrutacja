import { LoaderFunctionArgs } from "react-router";
import z from "zod";

import { SearchListingCityPage } from "~/components/SearchListingCityPage";
import { getListingCity } from "~/data/home.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_City } from "~/models/city";
import { T_CityName } from "~/models/cityNested";
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
          city: Z_City,
        })}
      >
        {data => (
          <SearchListingCityPage
            city={data.city}
            district={null}
            showDistrictsIfExists={false}
          />
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    return await getListingCity({
      listingCity: (params?.listingCity as T_CityName) ?? null,
      listingCityDistrict: null,
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};
