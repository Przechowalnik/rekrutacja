import type { LoaderFunctionArgs } from "react-router";

import { namespaces } from "~/constants/namespaces";
import { requireAdminSession } from "~/data/auth.server";
import { responseThrowError } from "~/data/response.server";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AdminMarketingEmailPage = dynamic(() =>
  import("~/components/AdminMarketingEmailPage").then(module => ({
    default: module.AdminMarketingEmailPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.adminExchanges], // to do
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
        <AdminMarketingEmailPage />
      </RespectUser>
    </RespectLocalization>
  );
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await requireAdminSession({
      request,
    });

    return null;
  } catch (error) {
    return responseThrowError({ error });
  }
};
