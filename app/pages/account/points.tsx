import { namespaces } from "~/constants/namespaces";
import { dynamic } from "~/hoc/dynamic";
import { getI18nextNamespaces } from "~/lib/i18nextNamespaces";
import { E_Roles } from "~/models/enums";
import { RespectLocalization } from "~/ui/RespectLocalization";
import { RespectUser } from "~/ui/RespectUser";

const AccountPointsPage = dynamic(() =>
  import("~/components/AccountPointsPage").then(module => ({
    default: module.AccountPointsPage,
  })),
);

export const handle = getI18nextNamespaces({
  extraNamespaces: [namespaces.accountPoints],
});

export default function Page() {
  return (
    <RespectLocalization namespaces={handle.i18n}>
      <RespectUser userRoles={[E_Roles.USER]}>
        <AccountPointsPage />
      </RespectUser>
    </RespectLocalization>
  );
}
