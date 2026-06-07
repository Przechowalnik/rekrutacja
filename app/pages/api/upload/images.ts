import { ActionFunctionArgs } from "react-router";

import { requireUserSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { signDraftImagesUpload } from "~/data/images.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireUserSession({
      request,
    });

    switch (request.method) {
      case E_Requests.post: {
        return await signDraftImagesUpload({
          folder: "listings",
          mainFolder: "draft/images",
          request,
          userId,
          userSessionVersion,
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
