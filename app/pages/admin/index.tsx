import { namespaces } from "~/constants/namespaces";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AdminPage = dynamic(() =>
  import("../../components/AdminPage").then(module => ({
    default: module.AdminPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.admin],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser userRoles={[E_Roles.ADMIN, E_Roles.ADMIN_SUPER]}>
        <AdminPage />
      </RespectUser>
    </RespectLocalization>
  );
}
