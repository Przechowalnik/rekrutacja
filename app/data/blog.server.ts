import { serializeBigInt } from "~/utilities/converter";

import { cacheTimeServer } from "./cacheTime.server";
import { database } from "./database.server";
import { convertToCorrectSlug } from "./functions.server";
import { prismaSelectBlogPost } from "./prismaSelect.server";
import { client } from "./redis.server";
import {
  responseGetOnFailure,
  responseOnSuccess,
  throwNotFound,
} from "./response.server";

export const getAllBlogPosts = async ({ request }: { request: Request }) => {
  const redirectOnError = await responseGetOnFailure({ request });

  try {
    const key = `blogs`;
    const cached = await client.get(key);

    if (cached) {
      return await responseOnSuccess({
        cacheResponse: {
          maxAge: cacheTimeServer.blog,
        },
        data: cached,
        extraHeaders: {
          "Cache-Control": "no-store",
          "X-Cache": "HIT",
        },
        request,
        status: 200,
      });
    }

    const blogPosts = await database.blogPost.findMany({
      orderBy: {
        title: "desc",
      },
      select: prismaSelectBlogPost,
    });

    const result = {
      blogPosts,
    };

    await client.set(key, serializeBigInt(result), {
      ex: cacheTimeServer.blog,
    });

    return await responseOnSuccess({
      cacheResponse: {
        maxAge: cacheTimeServer.blog,
      },
      data: result,
      extraHeaders: {
        "Cache-Control": "no-store",
        "X-Cache": "MISS",
      },
      request,
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return redirectOnError;
  }
};

export const getAllBlogPostsForRSS = async () => {
  try {
    const blogPosts = await database.blogPost.findMany({
      orderBy: {
        title: "desc",
      },
      select: prismaSelectBlogPost,
    });

    return blogPosts;
  } catch {
    return [];
  }
};

export const getBlogPostFromSlug = async ({
  blogPostSlug,
  request,
}: {
  blogPostSlug?: string;
  request: Request;
}) => {
  if (!blogPostSlug) {
    throwNotFound();
  }

  try {
    const key = `blog:${blogPostSlug}`;
    const cached = await client.get(key);

    if (cached) {
      return await responseOnSuccess({
        cacheResponse: {
          maxAge: cacheTimeServer.blog,
        },
        data: cached,
        extraHeaders: {
          "Cache-Control": "no-store",
          "X-Cache": "HIT",
        },
        request,
        status: 200,
      });
    }

    const foundBlogPost = await database.blogPost.findUnique({
      select: prismaSelectBlogPost,
      where: {
        slug: convertToCorrectSlug(blogPostSlug),
      },
    });

    if (!foundBlogPost) {
      throwNotFound();
    }

    const result = {
      blogPost: foundBlogPost,
    };

    await client.set(key, serializeBigInt(result), {
      ex: cacheTimeServer.blog,
    });

    return await responseOnSuccess({
      cacheResponse: {
        maxAge: cacheTimeServer.blog,
      },
      data: result,
      extraHeaders: {
        "Cache-Control": "no-store",
        "X-Cache": "MISS",
      },
      request,
      status: 200,
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error(error);
    throwNotFound();
  }
};
