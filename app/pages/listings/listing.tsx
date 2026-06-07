import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { ListingPage } from "~/components/ListingPage";
import { namespaces } from "~/constants/namespaces";
import { getUserFromSession } from "~/data/authSession.server";
import { E_Requests } from "~/data/formRequests.server";
import { getListing, incrementListing } from "~/data/listing.server";
import { E_ListingInteractionTypeServer } from "~/data/models.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { applyRateLimit } from "~/data/security.server";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_Listing } from "~/models/listing";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.listing],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          listing: Z_Listing,
          metaCapiEventId: z.string().optional(),
        })}
      >
        {data => (
          <ListingPage
            listing={data.listing}
            metaCapiEventId={data.metaCapiEventId}
          />
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    await applyRateLimit({ request });

    return await getListing({
      listingIdOrSlug: params?.listingIdOrSlug,
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    await applyRateLimit({ request });

    const { userId } = await getUserFromSession({
      request,
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await incrementListing({
          listingIdOrSlug: params?.listingIdOrSlug,
          request,
          type: E_ListingInteractionTypeServer.CONTACT,
          userId,
        });
      }

      case E_Requests.post: {
        return await incrementListing({
          listingIdOrSlug: params?.listingIdOrSlug,
          request,
          type: E_ListingInteractionTypeServer.VIEW,
          userId,
        });
      }
    }

    return await responseOnFailure({
      message: "somethingWentWrong",
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
}
