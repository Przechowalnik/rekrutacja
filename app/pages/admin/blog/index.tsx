import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import { getBlogPosts } from "~/data/adminBlog.server";
import { requireAdminSession } from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_BlogPosts } from "~/models/blogPosts";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminBlogPostsPage = dynamic(() =>
  import("~/components/AdminBlogPostsPage").then(module => ({
    default: module.AdminBlogPostsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminBlogPosts],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          blogPosts: Z_BlogPosts,
          nextPage: z.number().nullable(),
          totalPages: z.number().optional().nullable(),
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
            <AdminBlogPostsPage
              blogPosts={data.blogPosts}
              nextPage={data.nextPage}
              totalPages={data.totalPages}
            />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await requireAdminSession({
      request,
    });

    return await getBlogPosts({ request });
  } catch (error) {
    return responseThrowError({ error });
  }
};
