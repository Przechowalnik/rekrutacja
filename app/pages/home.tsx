import { type LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { HomePage } from "~/components/HomePage";
import { namespaces } from "~/constants/namespaces";
import { getLatestListings } from "~/data/home.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Listings } from "~/models/listings";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.home],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          listings: Z_Listings,
        })}
      >
        {data => <HomePage latestListings={data.listings} />}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    return await getLatestListings({ request });
  } catch (error) {
    return responseThrowError({ error });
  }
};
