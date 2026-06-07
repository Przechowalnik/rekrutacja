import { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { BlogPostsPage } from "~/components/BlogPostsPage";
import { namespaces } from "~/constants/namespaces";
import { getAllBlogPosts } from "~/data/blog.server";
import { responseThrowError } from "~/data/response.server";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_BlogPosts } from "~/models/blogPosts";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.blogPosts],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          blogPosts: Z_BlogPosts,
        })}
      >
        {data => <BlogPostsPage blogPosts={data.blogPosts} />}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    return await getAllBlogPosts({ request });
  } catch (error) {
    return responseThrowError({ error });
  }
};
