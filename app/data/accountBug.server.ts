import { E_Routes } from "~/constants/routes";
import { database } from "~/data/database.server";
import { formNames } from "~/lib/zodFormValidator";

import type { T_ResultUploadOrGetImage } from "./images.server";
import { uploadImageOrVideo, uploadImagesOrVideos } from "./images.server";
import { E_BugStatusServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectBug } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseGetOnFailureLogout,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getBugAccount = async ({
  bugId,
  request,
  userId,
  userSessionVersion,
}: {
  bugId: string | undefined;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    if (!bugId) {
      return redirectOnError;
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      if (responseError.status === 401) {
        return await responseGetOnFailureLogout({
          request,
        });
      }

      return redirectOnError;
    }

    if (!existingUser) {
      return redirectOnError;
    }

    const foundBug = await database.bug.findUnique({
      select: prismaSelectBug,
      where: {
        id: bugId,
        userId: existingUser.id,
      },
    });

    if (!foundBug) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        bug: foundBug,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const getBugsAccount = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      if (responseError.status === 401) {
        return await responseGetOnFailureLogout({
          request,
        });
      }

      return redirectOnError;
    }

    if (!existingUser) {
      return redirectOnError;
    }

    const bugs = await database.bug.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: prismaSelectBug,
      where: {
        userId: existingUser.id,
      },
    });

    return await responseOnSuccess({
      data: {
        bugs,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const createAccountBug = async ({
  request,
  userId,
  userSessionVersion,
}: {
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    const resultValidator = await checkZodValidator({
      arrayData: [formNames.bugImages, formNames.bugVideo],
      request,
      validator: {
        [formNames.bugActionsBeforeError]: zodValidator.bugActionsBeforeError,
        [formNames.bugDescription]: zodValidator.bugDescription,
        [formNames.bugEnvironment]: zodValidator.bugEnvironment,
        [formNames.bugErrorMessage]: zodValidator.bugErrorMessage.optional(),
        [formNames.bugExpectedBehavior]:
          zodValidator.bugExpectedBehavior.optional(),
        [formNames.bugImages]: zodValidator.fileImage5MB.array().optional(),
        [formNames.bugIsReproducible]: zodValidator.checkbox,
        [formNames.bugTimestamp]: zodValidator.date,
        [formNames.bugVideo]: zodValidator.fileVideo100MB.array().optional(),
      },
    });

    if (resultValidator?.responseError) {
      return await responseOnFailure(resultValidator.responseError);
    }

    if (!resultValidator?.data) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: false,
      prismaArguments: {
        select: {
          companyId: true,
        },
        where: {
          id: userId,
        },
      },
      request,
      userSessionVersion,
    });

    if (responseError) {
      return await responseOnFailure(responseError);
    }

    if (!existingUser) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 401,
      });
    }

    const {
      bugActionsBeforeError,
      bugDescription,
      bugEnvironment,
      bugErrorMessage,
      bugExpectedBehavior,
      bugImages,
      bugIsReproducible,
      bugTimestamp,
      bugVideo,
    } = resultValidator.data;

    let resultUploadImage: null | T_ResultUploadOrGetImage[] = null;
    let resultUploadVideo: null | T_ResultUploadOrGetImage = null;
    if (bugImages) {
      if (bugImages.length > 3) {
        return await responseOnFailure({
          message: "bugImagesMax3",
          request,
          status: 422,
        });
      }

      resultUploadImage = await uploadImagesOrVideos({
        files: bugImages,
        folder: "bugs",
      });
    }

    if (bugVideo) {
      const foundFirstVideo = bugVideo?.at(0);
      if (!foundFirstVideo || bugVideo.length > 1) {
        return await responseOnFailure({
          message: "somethingWentWrong",
          request,
          status: 422,
        });
      }

      resultUploadVideo = await uploadImageOrVideo({
        file: foundFirstVideo,
        folder: "bugs",
      });
    }

    await database.bug.create({
      data: {
        actionsBeforeError: bugActionsBeforeError,
        companyId: existingUser.companyId ?? null,
        description: bugDescription,
        environment: bugEnvironment,
        errorMessage: bugErrorMessage ? bugErrorMessage?.toString() : null,
        expectedBehavior: bugExpectedBehavior,
        images:
          resultUploadImage
            ?.filter(item => !!item.url)
            ?.map(item => item.url ?? "") ?? [],
        isReproducible: bugIsReproducible,
        status: E_BugStatusServer.REPORTED,
        timestamp: bugTimestamp,
        userId: existingUser.id,
        video: resultUploadVideo?.url ?? null,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successCreateBug",
      },
      redirectTo: E_Routes.accountBugs,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};
