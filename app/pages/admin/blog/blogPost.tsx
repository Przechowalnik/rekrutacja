import "@mantine/tiptap/styles.css";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { z } from "zod";

import { namespaces } from "~/constants/namespaces";
import {
  deleteBlogPostAdmin,
  getBlogPost,
  updateBlogPostAdmin,
} from "~/data/adminBlog.server";
import { requireAdminSession } from "~/data/auth.server";
import { E_Requests } from "~/data/formRequests.server";
import { responseOnFailure, responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { Z_BlogPost } from "~/models/blogPost";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectSchema } from "~/ui/RespectSchema";
import { RespectUser } from "~/ui/RespectUser";

const AdminBlogPostEditPage = dynamic(() =>
  import("~/components/AdminBlogPostEditPage").then(module => ({
    default: module.AdminBlogPostEditPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminBlogPostEdit],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectSchema
        schema={z.object({
          blogPost: Z_BlogPost,
        })}
      >
        {data => (
          <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
            <AdminBlogPostEditPage blogPost={data.blogPost} />
          </RespectUser>
        )}
      </RespectSchema>
    </RespectLocalization>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  try {
    const { userId, userSessionVersion } = await requireAdminSession({
      request,
    });

    switch (request.method) {
      case E_Requests.patch: {
        return await updateBlogPostAdmin({
          blogPostId: params?.blogPostId,
          request,
          userId,
          userSessionVersion,
        });
      }
      case E_Requests.delete: {
        return await deleteBlogPostAdmin({
          blogPostId: params?.blogPostId,
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

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  try {
    await requireAdminSession({
      request,
    });

    return await getBlogPost({
      blogPostId: params?.blogPostId,
      request,
    });
  } catch (error) {
    return responseThrowError({ error });
  }
};
