import { E_Routes } from "~/constants/routes";
import { formNames } from "~/lib/zodFormValidator";

import { verifyUserAuthenticators } from "./checkAuthenticator.server";
import { getCookieValue, getLastIdCookieName } from "./cookies.server";
import { database } from "./database.server";
import { convertToCorrectSlug } from "./functions.server";
import { E_RolesServer } from "./models.server";
import { getAndCheckUser } from "./prismaRequest.server";
import { prismaSelectBlogPost } from "./prismaSelect.server";
import {
  responseGetOnFailure,
  responseOnFailure,
  responseOnFailureServer,
  responseOnSuccess,
} from "./response.server";
import { checkZodValidator, zodValidator } from "./zodValidator.server";

export const getBlogPosts = async ({ request }: { request: Request }) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const resultValidator = await checkZodValidator({
      queryData: [formNames.limit, formNames.page],
      request,
      validator: {
        [formNames.limit]: zodValidator.limit.optional(),
        [formNames.page]: zodValidator.page.optional(),
      },
    });

    if (resultValidator?.responseError) {
      return redirectOnError;
    }

    if (!resultValidator?.data) {
      return redirectOnError;
    }

    const { limit = 10, page = 1 } = resultValidator.data;

    const lastId = getCookieValue(
      request.headers.get("cookie"),
      getLastIdCookieName(request),
    );
    const skip = (page - 1) * limit;

    let cursorId: null | string = null;

    if (lastId) {
      const exists = await database.blogPost.findFirst({
        select: { id: true },
        where: { id: lastId },
      });

      cursorId = exists ? lastId : null;
    }

    const blogPosts = await database.blogPost.findMany({
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : { skip }),
      orderBy: [{ title: "desc" }, { id: "desc" }],
      select: prismaSelectBlogPost,
      take: limit,
    });

    const total = await database.blogPost.count({
      where: {},
    });

    const nextPage = skip + limit < total ? page + 1 : null;
    const totalPages = Math.ceil(total / limit);

    return await responseOnSuccess({
      data: {
        blogPosts,
        nextPage,
        totalPages,
        totalResults: total,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const createNewBlogPostAdmin = async ({
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
      arrayData: [formNames.plansId],
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.blogPostContent]: zodValidator.blogPostContent,
        [formNames.blogPostDescription]: zodValidator.blogPostDescription,
        [formNames.blogPostDescriptionSeo]: zodValidator.blogPostDescriptionSeo,
        [formNames.blogPostSlug]: zodValidator.blogPostSlug,
        [formNames.blogPostTitle]: zodValidator.blogPostTitle,
        [formNames.blogPostTitleSeo]: zodValidator.blogPostTitleSeo,
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
      authenticator: true,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const {
      blogPostContent,
      blogPostDescription,
      blogPostDescriptionSeo,
      blogPostSlug,
      blogPostTitle,
      blogPostTitleSeo,
    } = resultValidator.data;

    const newSlug = convertToCorrectSlug(blogPostSlug);

    const foundBlogsWithSameTitle = await database.blogPost.count({
      where: {
        OR: [
          {
            title: {
              equals: blogPostTitle,
              mode: "insensitive",
            },
          },
          {
            titleSeo: {
              equals: blogPostTitleSeo,
              mode: "insensitive",
            },
          },
          {
            slug: {
              equals: newSlug,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (foundBlogsWithSameTitle > 0) {
      return await responseOnFailure({
        message: "errorOnCreateBlogPostTitleAlreadyExists",
        request,
        status: 422,
      });
    }

    await database.blogPost.create({
      data: {
        content: blogPostContent,
        createdByUserId: existingUser.id,
        description: blogPostDescription,
        descriptionSeo: blogPostDescriptionSeo,
        slug: newSlug,
        title: blogPostTitle,
        titleSeo: blogPostTitleSeo,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successCreateBlogPost",
      },
      redirectTo: E_Routes.adminBlogPosts,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const deleteBlogPostAdmin = async ({
  blogPostId,
  request,
  userId,
  userSessionVersion,
}: {
  blogPostId?: string;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    if (!blogPostId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.blogPostId]: zodValidator.blogPostId,
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

    const { blogPostId: blogPostIdFromApi } = resultValidator.data;

    if (blogPostId !== blogPostIdFromApi) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const foundBlogPost = await database.blogPost.count({
      where: {
        id: blogPostIdFromApi,
      },
    });

    if (!foundBlogPost) {
      return await responseOnFailure({
        message: "notFoundBlogPost",
        request,
        status: 422,
      });
    }

    await database.blogPost.delete({
      where: {
        id: blogPostIdFromApi,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successDeleteBlogPost",
      },
      redirectTo: E_Routes.adminBlogPosts,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const updateBlogPostAdmin = async ({
  blogPostId,
  request,
  userId,
  userSessionVersion,
}: {
  blogPostId?: string;
  request: Request;
  userId: string;
  userSessionVersion: null | number;
}) => {
  try {
    if (!blogPostId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const resultValidator = await checkZodValidator({
      request,
      validator: {
        [formNames.authenticator]: zodValidator.authenticator,
        [formNames.blogPostContent]: zodValidator.blogPostContent,
        [formNames.blogPostDescription]: zodValidator.blogPostDescription,
        [formNames.blogPostDescriptionSeo]: zodValidator.blogPostDescriptionSeo,
        [formNames.blogPostId]: zodValidator.blogPostId,
        [formNames.blogPostSlug]: zodValidator.blogPostSlug,
        [formNames.blogPostTitle]: zodValidator.blogPostTitle,
        [formNames.blogPostTitleSeo]: zodValidator.blogPostTitleSeo,
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

    const {
      blogPostContent,
      blogPostDescription,
      blogPostDescriptionSeo,
      blogPostId: blogPostIdFromApi,
      blogPostSlug,
      blogPostTitle,
      blogPostTitleSeo,
    } = resultValidator.data;

    if (blogPostIdFromApi !== blogPostId) {
      return await responseOnFailure({
        message: "somethingWentWrong",
        request,
        status: 422,
      });
    }

    const { existingUser, responseError } = await getAndCheckUser({
      authenticator: true,
      company: false,
      prismaArguments: {
        select: {},
        where: {
          id: userId,
          role: {
            in: [E_RolesServer.ADMIN, E_RolesServer.ADMIN_SUPER],
          },
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

    const resultVerifyUser2FACode = await verifyUserAuthenticators({
      authenticator: resultValidator.data[formNames.authenticator],
      authenticator2FA: existingUser.authenticator2FA,
      authenticatorEmailOTP: existingUser.authenticatorEmailOTP,
      password: existingUser.password,
      request,
      userId: existingUser.id,
    });

    if (resultVerifyUser2FACode?.responseError) {
      return await responseOnFailure(resultVerifyUser2FACode.responseError);
    }

    const foundBlogPosts = await database.blogPost.count({
      where: {
        id: blogPostIdFromApi,
      },
    });

    if (!foundBlogPosts) {
      return await responseOnFailure({
        message: "notFoundBlogPost",
        request,
        status: 422,
      });
    }

    const newSlug = convertToCorrectSlug(blogPostSlug);

    const foundBlogPostsWithSameTitle = await database.blogPost.count({
      where: {
        id: {
          not: blogPostIdFromApi,
        },
        OR: [
          {
            title: {
              equals: blogPostTitle,
              mode: "insensitive",
            },
          },
          {
            titleSeo: {
              equals: blogPostTitleSeo,
              mode: "insensitive",
            },
          },
          {
            slug: {
              equals: newSlug,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    if (foundBlogPostsWithSameTitle > 0) {
      return await responseOnFailure({
        message: "errorOnCreateBlogPostTitleAlreadyExists",
        request,
        status: 422,
      });
    }

    await database.blogPost.update({
      data: {
        content: blogPostContent,
        description: blogPostDescription,
        descriptionSeo: blogPostDescriptionSeo,
        slug: newSlug,
        title: blogPostTitle,
        titleSeo: blogPostTitleSeo,
      },
      where: {
        id: blogPostIdFromApi,
      },
    });

    return await responseOnSuccess({
      flashData: {
        message: "successUpdateBlogPost",
      },
      redirectTo: E_Routes.adminBlogPosts,
      request,
      status: 200,
    });
  } catch (error) {
    return await responseOnFailureServer({ error, request });
  }
};

export const getBlogPost = async ({
  blogPostId,
  request,
}: {
  blogPostId?: string;
  request: Request;
}) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    if (!blogPostId) {
      return redirectOnError;
    }

    const foundBlogPost = await database.blogPost.findUnique({
      select: prismaSelectBlogPost,
      where: {
        id: blogPostId,
      },
    });

    if (!foundBlogPost) {
      return redirectOnError;
    }

    return await responseOnSuccess({
      data: {
        blogPost: foundBlogPost,
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};
