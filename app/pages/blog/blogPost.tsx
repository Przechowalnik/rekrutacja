import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { BlogPostDetailsPage } from "~/components/BlogPostDetailsPage";
import { namespaces } from "~/constants/namespaces";
import { getBlogPostFromSlug } from "~/data/blog.server";
import { responseThrowError } from "~/data/response.server";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_BlogPost } from "~/models/blogPost";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.blogPostDetails],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          blogPost: Z_BlogPost,
        })}
      >
        {data => <BlogPostDetailsPage blogPost={data.blogPost} />}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    return await getBlogPostFromSlug({
      blogPostSlug: params?.blogPostSlug,
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};
