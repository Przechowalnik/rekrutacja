import { LoaderFunctionArgs } from "react-router";
import z from "zod";

import { ArchivedListingsPage } from "~/components/ArchivedListingsPage";
import { namespaces } from "~/constants/namespaces";
import { getArchivedListings } from "~/data/archivedListings.server";
import { responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Listings } from "~/models/listings";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.archive],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          listings: Z_Listings,
          page: z.number(),
          totalPages: z.number(),
          totalResults: z.number(),
        })}
      >
        {data => (
          <ArchivedListingsPage
            listings={data.listings}
            page={data.page}
            totalPages={data.totalPages}
          />
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    return await getArchivedListings({ request });
  } catch (error) {
    return responseThrowError({ error });
  }
};
